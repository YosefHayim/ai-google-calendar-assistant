import { OAUTH2CLIENT, SCOPES, SUPABASE, redirectUri } from "@/config/root-config";
import { coerceArgs, formatEventData, getCalendarCategoriesByEmail } from "./agent-utils";
import { deleteEvent as deleteEventHandler, getEvents, insertEvent as insertEventHandler, updateEvent as updateEventHandler } from "@/utils/handle-events";

import { TOKEN_FIELDS } from "@/utils/storage";
import { asyncHandler } from "@/utils/async-handlers";
import type { calendar_v3 } from "googleapis";
import { fetchCredentialsByEmail } from "@/utils/get-user-calendar-tokens";
import { initCalendarWithUserTokensAndUpdateTokens } from "@/utils/init-calendar-with-user-tokens-and-update-tokens";
import isEmail from "validator/lib/isEmail";

type Event = calendar_v3.Schema$Event;

const MAX_PW = 72;
const MIN_PW = 6;

export const EXECUTION_TOOLS = {
  generateUserCbGoogleUrl: () => {
    const url = OAUTH2CLIENT.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: "consent",
      include_granted_scopes: true,
      redirect_uri: redirectUri,
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
    const { email, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const formatted = formatEventData(eventLike as Event);
    return { ...formatted, email };
  }),

  insertEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; customEvents?: boolean }) => {
    const { email, calendarId, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const eventData: Event = formatEventData(eventLike as Event);
    return insertEventHandler({ eventData, extra: { email, calendarId: calendarId ?? "primary", customEvents: params.customEvents ?? false } });
  }),

  updateEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; eventId: string }) => {
    const { email, calendarId, eventId, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    if (!eventId) {
      throw new Error("eventId is required for update.");
    }
    const eventData: Event = { ...formatEventData(eventLike as Event), id: eventId };
    const insureEventDataWithEventId = { ...eventData, id: eventId };
    return updateEventHandler({ eventData: insureEventDataWithEventId, extra: { email, calendarId: calendarId ?? "primary", eventId } });
  }),

  getEvent: asyncHandler(
    async (params: { email: string; calendarId?: string | null; q?: string | null; timeMin?: string | null; customEvents?: boolean | null }) => {
      const { email, calendarId } = coerceArgs(params);
      if (!(email && isEmail(email))) {
        throw new Error("Invalid email address.");
      }
      // If calendarId is not provided, default to "all" to search across all calendars
      // This ensures the agent can find events regardless of which calendar they're in
      const finalCalendarId = calendarId ?? "all";

      // Calculate time range: if timeMin is provided, use it and set timeMax to 24 hours from timeMin
      // Otherwise, use now and set timeMax to 24 hours from now
      // This limits results to only 24 hours worth of events to prevent large responses
      const now = new Date();
      const timeMinValue = params.timeMin ?? now.toISOString();
      const timeMinDate = new Date(timeMinValue);
      const timeMaxDate = new Date(timeMinDate.getTime() + 24 * 60 * 60 * 1000);
      const timeMaxValue = timeMaxDate.toISOString();

      const result = await getEvents({
        extra: {
          email,
          calendarId: finalCalendarId,
          timeMin: timeMinValue,
          timeMax: timeMaxValue,
          q: params.q || "",
          customEvents: params.customEvents ?? true,
        },
      });

      // Additional filtering as safety measure to ensure only events within the 24-hour window
      if (result && typeof result === "object" && "items" in result && Array.isArray(result.items)) {
        const filteredItems = result.items.filter((event: calendar_v3.Schema$Event) => {
          const eventStart = event.start?.dateTime || event.start?.date;
          if (!eventStart) return false;

          const eventStartDate = new Date(eventStart);
          const eventTime = eventStartDate.getTime();
          const timeMinTime = timeMinDate.getTime();
          const timeMaxTime = timeMaxDate.getTime();

          // Include events that start within the 24-hour window
          return eventTime >= timeMinTime && eventTime <= timeMaxTime;
        });

        return {
          ...result,
          items: filteredItems,
        };
      }

      // Handle customEvents format
      if (result && typeof result === "object" && "totalEventsFound" in result && Array.isArray(result.totalEventsFound)) {
        const filteredEvents = result.totalEventsFound.filter((event: { start: string | null }) => {
          if (!event.start) return false;
          const eventStartDate = new Date(event.start);
          const eventTime = eventStartDate.getTime();
          const timeMinTime = timeMinDate.getTime();
          const timeMaxTime = timeMaxDate.getTime();

          return eventTime >= timeMinTime && eventTime <= timeMaxTime;
        });

        return {
          ...result,
          totalEventsFound: filteredEvents,
          totalNumberOfEventsFound: filteredEvents.length,
        };
      }

      return result;
    }
  ),

  getCalendarTypesByEventDetails: asyncHandler(async (params: { eventInformation: calendar_v3.Schema$Event; email: string }) => {
    if (!(params.email && isEmail(params.email))) {
      throw new Error("Invalid email address.");
    }
    const calendarsTypes = (await getCalendarCategoriesByEmail(params.email)).map((c) => {
      return {
        calendarId: c.calendar_id,
        calendarName: c.calendar_name,
      };
    });
    return calendarsTypes;
  }),

  deleteEvent: asyncHandler((params: { eventId: string; email: string }) => {
    const { email, eventId } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    if (!eventId) {
      throw new Error("Event ID is required to delete event.");
    }
    return deleteEventHandler({ eventData: { id: eventId }, extra: { email } });
  }),
  getUserDefaultTimeZone: asyncHandler(async (params: { email: string }) => {
    const { email } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const tokenProps = await fetchCredentialsByEmail(email);
    const CALENDAR = await initCalendarWithUserTokensAndUpdateTokens(tokenProps);
    const r = await CALENDAR.settings.get({ setting: "timezone" });
    return r;
  }),
};
