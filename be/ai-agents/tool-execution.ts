import {
  eventsHandler,
  initUserSupabaseCalendarWithTokensAndUpdateTokens,
} from "@/utils/calendar";
import { fetchCredentialsByEmail, generateGoogleAuthUrl } from "@/utils/auth";
import { formatEventData, parseToolArguments } from "./utils";

import { ACTION } from "@/config";
import { asyncHandler } from "@/utils/http";
import type { calendar_v3 } from "googleapis";
import { getEvents } from "@/utils/calendar/get-events";
import isEmail from "validator/lib/isEmail";
import { isValidDateTime } from "@/utils/date/date-helpers";

type Event = calendar_v3.Schema$Event;

/**
 * Apply user's default calendar timezone to timed events without timezone.
 *
 * For timed events (using dateTime instead of date) that lack explicit
 * timezone information, fetches the user's Google Calendar default timezone
 * and applies it to ensure proper event scheduling across timezones.
 *
 * All-day events are left unchanged as they don't require timezone info.
 *
 * @param event - Partial Google Calendar event object
 * @param email - User's email to fetch their calendar settings
 * @returns Promise resolving to event with default timezone applied if needed
 */
async function applyDefaultTimezoneIfNeeded(
  event: Partial<Event>,
  email: string
): Promise<Partial<Event>> {
  const hasTimedStart = !!event.start?.dateTime;
  const hasTimedEnd = !!event.end?.dateTime;
  const hasStartTz = !!event.start?.timeZone;
  const hasEndTz = !!event.end?.timeZone;

  // If not a timed event or already has timezone, return as-is
  if (!(hasTimedStart || hasTimedEnd) || hasStartTz || hasEndTz) {
    return event;
  }

  // Fetch user's default calendar timezone
  const tokenProps = await fetchCredentialsByEmail(email);
  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenProps);
  const tzResponse = await calendar.settings.get({ setting: "timezone" });
  const defaultTimezone = tzResponse.data.value;

  if (!defaultTimezone) {
    return event;
  }

  // Apply default timezone to start and end
  return {
    ...event,
    start: event.start
      ? { ...event.start, timeZone: defaultTimezone }
      : event.start,
    end: event.end ? { ...event.end, timeZone: defaultTimezone } : event.end,
  };
}

export const EXECUTION_TOOLS = {
  generateGoogleAuthUrl,
  /**
   * Register a new user with email validation and OAuth URL generation.
   *
   * Initiates user registration by validating the email and generating
   * a Google OAuth URL for calendar authorization. Uses forced consent
   * screen to ensure proper permissions on first authentication.
   *
   * @param params - Registration parameters
   * @param params.email - User's email address (required)
   * @param params.name - Optional user's name
   * @returns Promise resolving to registration status with auth URL
   */
  registerUser: asyncHandler(
    async (params: { email: string; name?: string }) => {
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
        message:
          "Please authorize access to your Google Calendar using the provided URL.",
      };
    }
  ),

  /**
   * Create a new calendar event with timezone handling and optional features.
   *
   * Inserts a new event into the user's Google Calendar with automatic
   * timezone application for timed events, optional Google Meet link
   * generation, and support for custom event types.
   *
   * @param params - Event creation parameters including Google Calendar event data
   * @param params.email - User's email for calendar access
   * @param params.customEvents - Whether this is a custom event type (default: false)
   * @param params.addMeetLink - Whether to automatically add a Google Meet link (default: false)
   * @returns Promise resolving to created event data
   */
  insertEvent: asyncHandler(
    async (
      params: calendar_v3.Schema$Event & {
        email: string;
        customEvents?: boolean;
        addMeetLink?: boolean;
      }
    ) => {
      const { email, calendarId, eventLike } = parseToolArguments(params);
      if (!(email && isEmail(email))) {
        throw new Error("Invalid email address.");
      }

      // If timed event without timezone, fetch user's default calendar timezone
      const eventWithTimezone = await applyDefaultTimezoneIfNeeded(
        eventLike as Event,
        email
      );
      const eventData: Event = formatEventData(eventWithTimezone);
      return eventsHandler(null, ACTION.INSERT, eventData, {
        email,
        calendarId: calendarId ?? "primary",
        customEvents: params.customEvents ?? false,
        addMeetLink: params.addMeetLink ?? false,
      });
    }
  ),

  /**
   * Update an existing calendar event with new data.
   *
   * Modifies an existing Google Calendar event using its event ID.
   * Applies timezone handling and validates user permissions before
   * performing the update operation.
   *
   * @param params - Event update parameters
   * @param params.email - User's email for calendar access
   * @param params.eventId - Google Calendar event ID to update (required)
   * @returns Promise resolving to updated event data
   */
  updateEvent: asyncHandler(
    async (
      params: calendar_v3.Schema$Event & { email: string; eventId: string }
    ) => {
      const { email, calendarId, eventId, eventLike } =
        parseToolArguments(params);
      if (!(email && isEmail(email))) {
        throw new Error("Invalid email address.");
      }
      if (!eventId) {
        throw new Error("eventId is required for update.");
      }

      const updateData: Partial<Event> = { id: eventId };

      if (eventLike.summary && eventLike.summary.trim() !== "") {
        updateData.summary = eventLike.summary;
      }
      if (eventLike.description && eventLike.description.trim() !== "") {
        updateData.description = eventLike.description;
      }
      if (eventLike.location && eventLike.location.trim() !== "") {
        updateData.location = eventLike.location;
      }

      if (eventLike.start?.dateTime || eventLike.start?.date) {
        if (
          eventLike.start.dateTime &&
          !isValidDateTime(eventLike.start.dateTime)
        ) {
          throw new Error(
            `Invalid start dateTime format: ${eventLike.start.dateTime}`
          );
        }
        const startWithTz = await applyDefaultTimezoneIfNeeded(
          { start: eventLike.start } as Event,
          email
        );
        updateData.start = startWithTz.start;
      }
      if (eventLike.end?.dateTime || eventLike.end?.date) {
        if (
          eventLike.end.dateTime &&
          !isValidDateTime(eventLike.end.dateTime)
        ) {
          throw new Error(
            `Invalid end dateTime format: ${eventLike.end.dateTime}`
          );
        }
        const endWithTz = await applyDefaultTimezoneIfNeeded(
          { end: eventLike.end } as Event,
          email
        );
        updateData.end = endWithTz.end;
      }

      return eventsHandler(null, ACTION.PATCH, updateData as Event, {
        email,
        calendarId: calendarId ?? "primary",
        eventId,
      });
    }
  ),

  /**
   * Retrieve calendar events with flexible filtering and search options.
   *
   * Fetches events from Google Calendar with support for time ranges,
   * text search, and multi-calendar queries. Provides sensible defaults
   * for time ranges to prevent excessive API calls.
   *
   * @param params - Event retrieval parameters
   * @param params.email - User's email for calendar access
   * @param params.q - Text search query to filter events
   * @param params.timeMin - Start time for event range (ISO string, defaults to today)
   * @param params.timeMax - End time for event range (ISO string, defaults to 24h after timeMin)
   * @param params.searchAllCalendars - Whether to search across all user calendars
   * @param params.calendarId - Specific calendar ID to search (default: "primary")
   * @returns Promise resolving to matching calendar events
   */
  getEvent: asyncHandler(
    async (
      params: calendar_v3.Schema$Event & {
        email: string;
        q?: string | null;
        timeMin?: string | null;
        timeMax?: string | null;
        searchAllCalendars?: boolean;
        calendarId?: string | null;
      }
    ) => {
      // Default timeMin to start of today in RFC3339 format (required by Google Calendar API)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const defaultTimeMin = today.toISOString();

      // Default timeMax to 1 day after timeMin if not provided
      // This prevents fetching too many events when user asks for "today" or "tomorrow"
      const computeDefaultTimeMax = (timeMin: string): string => {
        const minDate = new Date(timeMin);
        const maxDate = new Date(minDate);
        maxDate.setDate(maxDate.getDate() + 1);
        maxDate.setHours(23, 59, 59, 999);
        return maxDate.toISOString();
      };

      const effectiveTimeMin = params.timeMin ?? defaultTimeMin;
      const effectiveTimeMax =
        params.timeMax ?? computeDefaultTimeMax(effectiveTimeMin);

      // Limit events to prevent context overflow
      const MAX_EVENTS_TOTAL = 100;
      const MAX_EVENTS_PER_CALENDAR = 50;

      const { email, calendarId } = parseToolArguments(params);
      if (!(email && isEmail(email))) {
        throw new Error("Invalid email address.");
      }

      // Helper to slim down event data to essential fields only
      // calendarId is added when iterating across calendars (see allEventsResults loop)
      const slimEvent = (
        event: calendar_v3.Schema$Event,
        calendarId?: string | null
      ) => ({
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
        const calendar =
          await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
        const allCalendarIds =
          (await calendar.calendarList
            .list({ prettyPrint: true })
            .then((r) => r.data.items?.map((cal) => cal.id))) || [];

        const allEventsResults = await Promise.all(
          allCalendarIds.map((calId) =>
            getEvents({
              calendarEvents: calendar.events,
              req: undefined,
              extra: {
                calendarId: calId,
                timeMin: effectiveTimeMin,
                timeMax: effectiveTimeMax,
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
        const calendarEventMap: { calendarId: string; eventCount: number }[] =
          [];
        let truncated = false;

        for (let i = 0; i < allEventsResults.length; i++) {
          const result = allEventsResults[i];
          const calId = allCalendarIds[i];
          const events =
            result.type === "standard" ? (result.data.items ?? []) : [];

          if (events.length > 0) {
            calendarEventMap.push({
              calendarId: calId || "unknown",
              eventCount: events.length,
            });

            // Only add events if we haven't hit the total limit
            const remainingSlots = MAX_EVENTS_TOTAL - aggregatedEvents.length;
            if (remainingSlots > 0) {
              const eventsToAdd = events
                .slice(0, remainingSlots)
                .map((e) => slimEvent(e, calId));
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
      return eventsHandler(
        null,
        ACTION.GET,
        {},
        {
          email,
          calendarId: calendarId ?? "primary",
          timeMin: effectiveTimeMin,
          timeMax: effectiveTimeMax,
          q: params.q || "",
          singleEvents: true,
          orderBy: "startTime",
        }
      );
    }
  ),

  /**
   * Delete an existing calendar event.
   *
   * Permanently removes an event from the user's Google Calendar.
   * Validates user permissions and event existence before deletion.
   *
   * @param params - Event deletion parameters
   * @param params.eventId - Google Calendar event ID to delete (required)
   * @param params.email - User's email for calendar access
   * @param params.calendarId - Calendar ID containing the event (default: "primary")
   * @returns Promise resolving to deletion confirmation
   */
  deleteEvent: asyncHandler(
    (params: {
      eventId: string;
      email: string;
      calendarId?: string | null;
    }) => {
      const { email, eventId, calendarId } = parseToolArguments(params);
      if (!(email && isEmail(email))) {
        throw new Error("Invalid email address.");
      }
      if (!eventId) {
        throw new Error("Event ID is required to delete event.");
      }
      return eventsHandler(
        null,
        ACTION.DELETE,
        { id: eventId },
        { email, calendarId: calendarId ?? "primary" }
      );
    }
  ),
};
