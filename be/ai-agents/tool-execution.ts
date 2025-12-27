import { ACTION, OAUTH2CLIENT, REDIRECT_URI, SCOPES, SUPABASE } from "@/config";
import { eventsHandler, initCalendarWithUserTokensAndUpdateTokens } from "@/utils/calendar";
import { formatEventData, getCalendarCategoriesByEmail, parseToolArguments } from "./utils";

import { TOKEN_FIELDS } from "@/config/constants/sql";
import { asyncHandler } from "@/utils/http";
import type { calendar_v3 } from "googleapis";
import { fetchCredentialsByEmail } from "@/utils/auth";
import isEmail from "validator/lib/isEmail";

type Event = calendar_v3.Schema$Event;

const MAX_PW = 72;
const MIN_PW = 6;

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

  insertEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; customEvents?: boolean }) => {
    const { email, calendarId, eventLike } = parseToolArguments(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const eventData: Event = formatEventData(eventLike as Event);
    return eventsHandler(null, ACTION.INSERT, eventData, { email, calendarId: calendarId ?? "primary", customEvents: params.customEvents ?? false });
  }),

  updateEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; eventId: string }) => {
    const { email, calendarId, eventId, eventLike } = parseToolArguments(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    if (!eventId) {
      throw new Error("eventId is required for update.");
    }
    const eventData: Event = { ...formatEventData(eventLike as Event), id: eventId };
    const insureEventDataWithEventId = { ...eventData, id: eventId };
    return eventsHandler(null, ACTION.UPDATE, insureEventDataWithEventId, { email, calendarId: calendarId ?? "primary", eventId });
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
  getUserDefaultTimeZone: asyncHandler(async (params: { email: string }) => {
    const { email } = parseToolArguments(params);
    if (!(email && isEmail(email))) {
      throw new Error("Invalid email address.");
    }
    const tokenProps = await fetchCredentialsByEmail(email);
    const CALENDAR = await initCalendarWithUserTokensAndUpdateTokens(tokenProps);
    const r = await CALENDAR.settings.get({ setting: "timezone" });
    return r;
  }),
};
