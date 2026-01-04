import { ACTION, SUPABASE } from "@/config";
import { eventsHandler, initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar";
import { fetchCredentialsByEmail, generateGoogleAuthUrl } from "@/utils/auth";
import { formatEventData, parseToolArguments } from "./utils";

import { asyncHandler } from "@/utils/http";
import type { calendar_v3 } from "googleapis";
import { getEvents } from "@/utils/calendar/get-events";
import isEmail from "validator/lib/isEmail";

type Event = calendar_v3.Schema$Event;

/**
 * Applies the user's default calendar timezone to timed events that don't have a timezone specified.
 * All-day events (using date instead of dateTime) don't require a timezone.
 */
async function applyDefaultTimezoneIfNeeded(event: Partial<Event>, email: string): Promise<Partial<Event>> {
  const hasTimedStart = !!event.start?.dateTime;
  const hasTimedEnd = !!event.end?.dateTime;
  const hasStartTz = !!event.start?.timeZone;
  const hasEndTz = !!event.end?.timeZone;

  // If not a timed event or already has timezone, return as-is
  if ((!hasTimedStart && !hasTimedEnd) || hasStartTz || hasEndTz) {
    return event;
  }

  // Fetch user's default calendar timezone
  const tokenProps = await fetchCredentialsByEmail(email);
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenProps);
  const tzResponse = await calendar.settings.get({ setting: "timezone" });
  const defaultTimezone = tzResponse.data.value;

  if (!defaultTimezone) {
    return event;
  }

  // Apply default timezone to start and end
  return {
    ...event,
    start: event.start ? { ...event.start, timeZone: defaultTimezone } : event.start,
    end: event.end ? { ...event.end, timeZone: defaultTimezone } : event.end,
  };
}

export const EXECUTION_TOOLS = {
  generateGoogleAuthUrl,
  registerUser: asyncHandler(async (params: { email: string; name?: string }) => {
    if (!params.email) {
      throw new Error("Email is required for registration.");
    }
    if (!isEmail(params.email)) {
      throw new Error("Invalid email address.");
    }

    // This app uses Google OAuth for authentication - generate OAuth URL for the user
    // Force consent screen for first-time authentication
    const authUrl = generateGoogleAuthUrl({ forceConsent: true });
    return {
      status: "needs_auth",
      email: params.email,
      name: params.name,
      authUrl,
      message: "Please authorize access to your Google Calendar using the provided URL.",
    };
  }),

  insertEvent: asyncHandler(async (params: calendar_v3.Schema$Event & { email: string; customEvents?: boolean }) => {
    const { email, calendarId, eventLike } = parseToolArguments(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }

    // If timed event without timezone, fetch user's default calendar timezone
    const eventWithTimezone = await applyDefaultTimezoneIfNeeded(eventLike as Event, email);
    const eventData: Event = formatEventData(eventWithTimezone);
    return eventsHandler(null, ACTION.INSERT, eventData, { email, calendarId: calendarId ?? "primary", customEvents: params.customEvents ?? false });
  }),

  updateEvent: asyncHandler(async (params: calendar_v3.Schema$Event & { email: string; eventId: string }) => {
    const { email, calendarId, eventId, eventLike } = parseToolArguments(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    if (!eventId) {
      throw new Error("eventId is required for update.");
    }

    // For updates, only include fields that are actually being changed
    // Don't require summary/start/end - only pass what the user wants to update
    const updateData: Partial<Event> = { id: eventId };

    // Only add fields that are actually provided (not null/undefined)
    if (eventLike.summary) updateData.summary = eventLike.summary;
    if (eventLike.description) updateData.description = eventLike.description;
    if (eventLike.location) updateData.location = eventLike.location;

    // Handle start/end times if provided
    if (eventLike.start?.dateTime || eventLike.start?.date) {
      const startWithTz = await applyDefaultTimezoneIfNeeded({ start: eventLike.start } as Event, email);
      updateData.start = startWithTz.start;
    }
    if (eventLike.end?.dateTime || eventLike.end?.date) {
      const endWithTz = await applyDefaultTimezoneIfNeeded({ end: eventLike.end } as Event, email);
      updateData.end = endWithTz.end;
    }

    // Use PATCH for partial updates - only updates provided fields, preserves the rest
    return eventsHandler(null, ACTION.PATCH, updateData as Event, { email, calendarId: calendarId ?? "primary", eventId });
  }),

  getEvent: asyncHandler(
    async (
      params: calendar_v3.Schema$Event & { email: string; q?: string | null; timeMin?: string | null; searchAllCalendars?: boolean; calendarId?: string | null }
    ) => {
      // Default timeMin to start of today in RFC3339 format (required by Google Calendar API)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const defaultTimeMin = today.toISOString();
      // Limit events to prevent context overflow
      const MAX_EVENTS_TOTAL = 100;
      const MAX_EVENTS_PER_CALENDAR = 50;

      const { email, calendarId } = parseToolArguments(params);
      if (!(email && isEmail(email))) {
        throw new Error("Invalid email address.");
      }

      // Helper to slim down event data to essential fields only
      // calendarId is added when iterating across calendars (see allEventsResults loop)
      const slimEvent = (event: calendar_v3.Schema$Event, calendarId?: string | null) => ({
        id: event.id,
        calendarId: calendarId ?? event.organizer?.email ?? "primary", // Include calendar ID for updates
        summary: event.summary,
        description: event.description?.substring(0, 200), // Truncate long descriptions
        start: event.start,
        end: event.end,
        location: event.location,
        status: event.status,
        htmlLink: event.htmlLink,
      });

      // Default to searching all calendars (true) unless explicitly set to false
      const searchAllCalendars = params.searchAllCalendars !== false;

      if (searchAllCalendars) {
        // Search across ALL calendars
        const tokenData = await fetchCredentialsByEmail(email);
        const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
        const allCalendarIds = (await calendar.calendarList.list({ prettyPrint: true }).then((r) => r.data.items?.map((cal) => cal.id))) || [];

        const allEventsResults = await Promise.all(
          allCalendarIds.map((calId) =>
            getEvents({
              calendarEvents: calendar.events,
              req: undefined,
              extra: {
                calendarId: calId,
                timeMin: params.timeMin ?? defaultTimeMin,
                q: params.q || "",
                maxResults: MAX_EVENTS_PER_CALENDAR,
                singleEvents: true,
                orderBy: "startTime",
              },
            })
          )
        );

        // Aggregate all events from all calendars (with limits)
        const aggregatedEvents: ReturnType<typeof slimEvent>[] = [];
        const calendarEventMap: { calendarId: string; eventCount: number }[] = [];
        let truncated = false;

        for (let i = 0; i < allEventsResults.length; i++) {
          const result = allEventsResults[i];
          const calId = allCalendarIds[i];
          const events = result.type === "standard" ? result.data.items ?? [] : [];

          if (events.length > 0) {
            calendarEventMap.push({ calendarId: calId || "unknown", eventCount: events.length });

            // Only add events if we haven't hit the total limit
            const remainingSlots = MAX_EVENTS_TOTAL - aggregatedEvents.length;
            if (remainingSlots > 0) {
              const eventsToAdd = events.slice(0, remainingSlots).map((e) => slimEvent(e, calId));
              aggregatedEvents.push(...eventsToAdd);
              if (events.length > remainingSlots) {
                truncated = true;
              }
            } else {
              truncated = true;
            }
          }
        }

        return {
          searchedCalendars: allCalendarIds.length,
          totalEventsFound: aggregatedEvents.length,
          truncated,
          calendarSummary: calendarEventMap,
          allEvents: aggregatedEvents,
        };
      }

      // Search single calendar (original behavior)
      return eventsHandler(null, ACTION.GET, {}, {
        email,
        calendarId: calendarId ?? "primary",
        timeMin: params.timeMin ?? defaultTimeMin,
        q: params.q || "",
        singleEvents: true,
        orderBy: "startTime",
      });
    }
  ),

  deleteEvent: asyncHandler((params: { eventId: string; email: string; calendarId?: string | null }) => {
    const { email, eventId, calendarId } = parseToolArguments(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    if (!eventId) {
      throw new Error("Event ID is required to delete event.");
    }
    return eventsHandler(null, ACTION.DELETE, { id: eventId }, { email, calendarId: calendarId ?? "primary" });
  }),
};
