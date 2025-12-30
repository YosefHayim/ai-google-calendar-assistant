import { ACTION, OAUTH2CLIENT, REDIRECT_URI, SCOPES, SUPABASE } from "@/config";
import { checkEventConflicts, eventsHandler, initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar";
import { formatEventData, getCalendarCategoriesByEmail, parseToolArguments } from "./utils";

import { TOKEN_FIELDS } from "@/config/constants/sql";
import { asyncHandler } from "@/utils/http";
import type { calendar_v3 } from "googleapis";
import { fetchCredentialsByEmail } from "@/utils/auth";
import isEmail from "validator/lib/isEmail";

type Event = calendar_v3.Schema$Event;

const MAX_PW = 72;
const MIN_PW = 6;

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
  generateGoogleAuthUrl: () => {
    const url = OAUTH2CLIENT.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
      include_granted_scopes: true,
      redirect_uri: REDIRECT_URI,
    });

    return url;
  },
  registerUser: asyncHandler(async (params: { email: string; password: string }) => {
    if (!(params.email && params.password)) {
      throw new Error("Email and password are required in order to register.");
    }
    if (!isEmail(params.email)) {
      throw new Error("Invalid email address.");
    }

    if (params.password.length < MIN_PW || params.password.length > MAX_PW) {
      throw new Error("Password must be between 6 and maximum of 72 characters long.");
    }

    const { data, error } = await SUPABASE.auth.signUp({
      email: params.email,
      password: params.password,
    });

    if (data) {
      return data;
    }
    throw error;
  }),
  validateUser: asyncHandler(async ({ email }: { email: string }) => {
    const { data, error } = await SUPABASE.from("user_calendar_tokens").select(TOKEN_FIELDS).eq("email", email.trim().toLowerCase());
    if (error || !data || data.length === 0) {
      throw new Error("User not found or no tokens available.");
    }
    return data[0];
  }),

  validateEventFields: asyncHandler((params: calendar_v3.Schema$Event & { email: string }) => {
    const { email, eventLike } = parseToolArguments(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const formatted = formatEventData(eventLike as Event);
    return { ...formatted, email };
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

    // If timed event without timezone, fetch user's default calendar timezone
    const eventWithTimezone = await applyDefaultTimezoneIfNeeded(eventLike as Event, email);
    const eventData: Event = { ...formatEventData(eventWithTimezone), id: eventId };
    return eventsHandler(null, ACTION.UPDATE, eventData, { email, calendarId: calendarId ?? "primary", eventId });
  }),

  getEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; q?: string | null; timeMin?: string | null }) => {
    const startOfYear = new Date().toISOString().split("T")[0];

    const { email, calendarId } = parseToolArguments(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    return eventsHandler(null, ACTION.GET, {}, { email, calendarId: calendarId ?? "primary", timeMin: params.timeMin ?? startOfYear, q: params.q || "" });
  }),

  selectCalendarByEventDetails: asyncHandler(async (params: { eventInformation: calendar_v3.Schema$Event; email: string }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    const calendars = (await getCalendarCategoriesByEmail(params.email)).map((c) => {
      return {
        calendarId: c.calendar_id,
        calendarName: c.calendar_name,
      };
    });
    return calendars;
  }),

  deleteEvent: asyncHandler((params: { eventId: string; email: string }) => {
    const { email, eventId } = parseToolArguments(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    if (!eventId) {
      throw new Error("Event ID is required to delete event.");
    }
    return eventsHandler(null, ACTION.DELETE, { id: eventId }, { email });
  }),
  checkConflicts: asyncHandler(
    async (params: { email: string; calendarId: string | null; start: calendar_v3.Schema$EventDateTime; end: calendar_v3.Schema$EventDateTime }) => {
      const { email, calendarId } = parseToolArguments(params);
      if (!(email && isEmail(email))) {
        throw new Error("Invalid email address.");
      }

      const startTime = params.start?.dateTime || params.start?.date;
      const endTime = params.end?.dateTime || params.end?.date;

      if (!startTime || !endTime) {
        throw new Error("Start and end times are required.");
      }

      return checkEventConflicts({
        email,
        calendarId: calendarId ?? "primary",
        startTime,
        endTime,
      });
    }
  ),
};
