import { SUPABASE, TIMEZONE } from "@/config";
import { isEmpty, isNil, isPlainObject, omitBy } from "lodash-es";

import { asyncHandler } from "@/utils/http";
import type { calendar_v3 } from "googleapis";

type Event = calendar_v3.Schema$Event;
type EDT = calendar_v3.Schema$EventDateTime;

const ALLOWED_TZ = new Set<string>(Object.values(TIMEZONE) as string[]);

/**
 * Recursively remove empty strings, null, and undefined values from objects
 */
export function deepClean<T>(obj: T): T {
  if (!obj || typeof obj !== "object") return obj;

  const clean = (val: unknown): unknown => {
    if (Array.isArray(val)) {
      const arr = val.map(clean).filter((v) => !isNil(v) && v !== "");
      return arr.length ? arr : undefined;
    }
    if (isPlainObject(val)) {
      const cleaned = omitBy(
        Object.fromEntries(Object.entries(val as object).map(([k, v]) => [k, clean(v)])),
        (v) => isNil(v) || v === "" || (isPlainObject(v) && isEmpty(v)) || (Array.isArray(v) && !v.length)
      );
      return isEmpty(cleaned) ? undefined : cleaned;
    }
    return val;
  };

  return clean(obj) as T;
}

/**
 * Normalize event date/time to ensure mutual exclusivity of date vs dateTime
 */
export function normalizeEventDateTime(input: Partial<EDT>): EDT {
  const e: Partial<EDT> = { ...input };

  for (const k of Object.keys(e) as (keyof EDT)[]) {
    if (e[k] === "" || e[k] === undefined || e[k] === null) {
      delete e[k];
    }
  }

  if (e.dateTime) {
    e.date = undefined;
  } else if (e.date) {
    e.dateTime = undefined;
    e.timeZone = undefined;
  }

  return e as EDT;
}

/**
 * Validate required event fields
 */
export function validateEventRequired(summary: string | null | undefined, start: EDT, end: EDT): void {
  if (!summary) {
    throw new Error("Event summary is required.");
  }
  if (!(start.dateTime || start.date)) {
    throw new Error("Event start is required.");
  }
  if (!(end.dateTime || end.date)) {
    throw new Error("Event end is required.");
  }
}

/**
 * Validate and normalize event timezone
 * Returns the resolved timezone for timed events
 */
export function validateAndResolveTimezone(start: EDT, end: EDT): string | undefined {
  const tzStart = start.dateTime ? start.timeZone ?? undefined : undefined;
  const tzEnd = end.dateTime ? end.timeZone ?? tzStart ?? undefined : undefined;

  if ((start.dateTime || end.dateTime) && !(tzStart || tzEnd)) {
    throw new Error("Event timeZone is required for timed events.");
  }

  if (tzStart && !ALLOWED_TZ.has(tzStart)) {
    throw new Error(`Invalid timeZone: ${tzStart}. Allowed: ${Array.from(ALLOWED_TZ).join(", ")}`);
  }
  if (tzEnd && !ALLOWED_TZ.has(tzEnd)) {
    throw new Error(`Invalid timeZone: ${tzEnd}. Allowed: ${Array.from(ALLOWED_TZ).join(", ")}`);
  }
  if (tzStart && tzEnd && tzStart !== tzEnd) {
    throw new Error("Start and end time zones must match.");
  }

  return tzStart ?? tzEnd;
}

/**
 * Apply resolved timezone to event date/time objects
 */
export function applyTimezone(start: EDT, end: EDT, timezone: string | undefined): void {
  if (start.dateTime) {
    start.timeZone = timezone;
  }
  if (end.dateTime) {
    end.timeZone = timezone;
  }
}

/**
 * Build event object from cleaned data
 */
export function buildEvent(cleaned: Partial<Event>, start: EDT, end: EDT): Event {
  return {
    summary: cleaned.summary,
    description: cleaned.description,
    location: cleaned.location,
    attendees: cleaned.attendees,
    reminders: cleaned.reminders,
    recurrence: cleaned.recurrence,
    colorId: cleaned.colorId,
    conferenceData: cleaned.conferenceData,
    transparency: cleaned.transparency,
    visibility: cleaned.visibility,
    start,
    end,
  };
}

/**
 * Format and validate event data for Google Calendar API
 */
export const formatEventData = (params: Partial<Event>): Event => {
  const cleaned = deepClean(params || {});
  const start = normalizeEventDateTime((cleaned.start ?? {}) as Partial<EDT>);
  const end = normalizeEventDateTime((cleaned.end ?? {}) as Partial<EDT>);

  validateEventRequired(cleaned.summary, start, end);
  const timezone = validateAndResolveTimezone(start, end);
  applyTimezone(start, end, timezone);

  return deepClean(buildEvent(cleaned, start, end));
};

export type UserCalendar = {
  calendar_id: string;
  calendar_name: string;
};

export const getCalendarCategoriesByEmail = asyncHandler(async (email: string): Promise<UserCalendar[]> => {
  // Step 1: Get user_id from users table by email
  const { data: userData, error: userError } = await SUPABASE.from("users").select("id").ilike("email", email.trim().toLowerCase()).single();

  if (userError || !userData) {
    // User not found - return empty array instead of throwing
    return [];
  }

  // Step 2: Get calendars from user_calendars table using user_id
  const { data, error } = await SUPABASE.from("user_calendars").select("calendar_id, calendar_name").eq("user_id", userData.id);

  if (error) {
    throw error;
  }

  if (data && Array.isArray(data)) {
    return data
      .filter((row) => row.calendar_id && row.calendar_name)
      .map((row) => ({
        calendar_id: row.calendar_id as string,
        calendar_name: row.calendar_name as string,
      }));
  }

  return [];
});

const cleanObject = <T extends Record<string, unknown>>(obj: T): T => omitBy(obj, (v) => isNil(v) || v === "") as T;
export function parseToolArguments(raw: unknown) {
  // 1) accept stringified input
  const base = typeof (raw as { input?: string })?.input === "string" ? JSON.parse((raw as { input: string }).input) : raw;

  // 2) unwrap common nestings
  const outer = base?.fullEventParameters ?? base;
  const inner = outer?.eventParameters ?? base?.eventParameters ?? base;

  // 3) collect fields
  const email = base?.email ?? outer?.email ?? inner?.email;
  const rawCalendarId = outer?.calendarId ?? base?.calendarId ?? inner?.calendarId;
  // Normalize calendarId - reject invalid values like "/"
  const calendarId = rawCalendarId && typeof rawCalendarId === "string" && rawCalendarId.trim() !== "" && rawCalendarId !== "/" ? rawCalendarId.trim() : null;
  const eventId = base?.eventId ?? outer?.eventId ?? inner?.eventId;

  // 4) extract event fields (summary/start/end/…)
  const eventLike: Partial<Event> = {
    id: inner?.id,
    summary: inner?.summary,
    description: inner?.description,
    location: inner?.location,
    attendees: inner?.attendees,
    reminders: inner?.reminders,
    recurrence: inner?.recurrence,
    colorId: inner?.colorId,
    conferenceData: inner?.conferenceData,
    transparency: inner?.transparency,
    visibility: inner?.visibility,
    start: inner?.start,
    end: inner?.end,
  };

  return { email, calendarId, eventId, eventLike: cleanObject(eventLike) };
}
