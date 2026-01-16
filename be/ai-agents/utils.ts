import type { calendar_v3 } from "googleapis";
import { isEmpty, isNil, isPlainObject, omitBy } from "lodash-es";
import { TIMEZONE } from "@/config";

export {
  getCalendarCategoriesByEmail,
  type UserCalendar,
} from "@/shared";

type Event = calendar_v3.Schema$Event;
type EDT = calendar_v3.Schema$EventDateTime;

const ALLOWED_TZ = new Set<string>(Object.values(TIMEZONE) as string[]);

/**
 * @description Recursively removes null, undefined, empty strings, empty objects, and empty arrays
 * from an object structure. Useful for cleaning up event data before sending to APIs that
 * reject empty values or for reducing payload size.
 *
 * @template T - The type of the input object
 * @param {T} obj - The object to clean (can be nested with arrays and objects)
 * @returns {T} A new object with all empty/null values recursively removed
 *
 * @example
 * // Clean event data before API submission
 * const event = {
 *   summary: 'Meeting',
 *   description: '',
 *   location: null,
 *   attendees: []
 * };
 * const cleaned = deepClean(event);
 * // Result: { summary: 'Meeting' }
 *
 * @example
 * // Handles nested structures
 * const data = {
 *   outer: {
 *     inner: null,
 *     value: 'kept'
 *   },
 *   empty: {}
 * };
 * const cleaned = deepClean(data);
 * // Result: { outer: { value: 'kept' } }
 */
export function deepClean<T>(obj: T): T {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const clean = (val: unknown): unknown => {
    if (Array.isArray(val)) {
      const arr = val.map(clean).filter((v) => !isNil(v) && v !== "");
      return arr.length ? arr : undefined;
    }
    if (isPlainObject(val)) {
      const cleaned = omitBy(
        Object.fromEntries(
          Object.entries(val as object).map(([k, v]) => [k, clean(v)])
        ),
        (v) =>
          isNil(v) ||
          v === "" ||
          (isPlainObject(v) && isEmpty(v)) ||
          (Array.isArray(v) && !v.length)
      );
      return isEmpty(cleaned) ? undefined : cleaned;
    }
    return val;
  };

  return clean(obj) as T;
}

/**
 * @description Normalizes a Google Calendar EventDateTime object by removing empty values
 * and ensuring mutual exclusivity between date (all-day) and dateTime (timed) fields.
 * When dateTime is present, date is removed; when only date is present, dateTime and timeZone are removed.
 *
 * @param {Partial<EDT>} input - The raw EventDateTime object with optional date, dateTime, timeZone
 * @returns {EDT} A normalized EventDateTime with empty values removed and proper field exclusivity
 *
 * @example
 * // Timed event - keeps dateTime and removes date
 * normalizeEventDateTime({ dateTime: '2024-01-15T10:00:00', date: '', timeZone: 'America/New_York' })
 * // Result: { dateTime: '2024-01-15T10:00:00', timeZone: 'America/New_York' }
 *
 * @example
 * // All-day event - keeps date, removes dateTime and timeZone
 * normalizeEventDateTime({ date: '2024-01-15', dateTime: '', timeZone: 'UTC' })
 * // Result: { date: '2024-01-15' }
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
 * @description Validates that required fields are present for creating/updating a calendar event.
 * Throws descriptive errors if validation fails. Required fields: summary, start (date or dateTime),
 * and end (date or dateTime).
 *
 * @param {string | null | undefined} summary - The event title/summary
 * @param {EDT} start - The event start time (must have either date or dateTime)
 * @param {EDT} end - The event end time (must have either date or dateTime)
 * @returns {void}
 * @throws {Error} 'Event summary is required.' if summary is null/undefined/empty
 * @throws {Error} 'Event start is required.' if start has neither date nor dateTime
 * @throws {Error} 'Event end is required.' if end has neither date nor dateTime
 *
 * @example
 * // Valid timed event
 * validateEventRequired(
 *   'Team Meeting',
 *   { dateTime: '2024-01-15T10:00:00', timeZone: 'UTC' },
 *   { dateTime: '2024-01-15T11:00:00', timeZone: 'UTC' }
 * ); // No error thrown
 *
 * @example
 * // Missing summary throws error
 * validateEventRequired(null, start, end);
 * // Throws: Error('Event summary is required.')
 */
export function validateEventRequired(
  summary: string | null | undefined,
  start: EDT,
  end: EDT
): void {
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
 * @description Validates and resolves the timezone for an event's start and end times.
 * Ensures timed events have a valid timezone from the allowed list, and that start/end
 * timezones match. For all-day events, timezone is not required.
 *
 * @param {EDT} start - The event start time with optional timeZone
 * @param {EDT} end - The event end time with optional timeZone
 * @returns {string | undefined} The resolved timezone string, or undefined for all-day events
 * @throws {Error} 'Event timeZone is required for timed events.' if timed event lacks timezone
 * @throws {Error} 'Invalid timeZone: {tz}. Allowed: ...' if timezone not in allowed list
 * @throws {Error} 'Start and end time zones must match.' if timezones differ
 *
 * @example
 * // Valid matching timezones
 * const tz = validateAndResolveTimezone(
 *   { dateTime: '2024-01-15T10:00:00', timeZone: 'America/New_York' },
 *   { dateTime: '2024-01-15T11:00:00', timeZone: 'America/New_York' }
 * );
 * // Result: 'America/New_York'
 *
 * @example
 * // All-day event (no timezone needed)
 * const tz = validateAndResolveTimezone(
 *   { date: '2024-01-15' },
 *   { date: '2024-01-16' }
 * );
 * // Result: undefined
 */
export function validateAndResolveTimezone(
  start: EDT,
  end: EDT
): string | undefined {
  const tzStart = start.dateTime ? (start.timeZone ?? undefined) : undefined;
  const tzEnd = end.dateTime
    ? (end.timeZone ?? tzStart ?? undefined)
    : undefined;

  if ((start.dateTime || end.dateTime) && !(tzStart || tzEnd)) {
    throw new Error("Event timeZone is required for timed events.");
  }

  if (tzStart && !ALLOWED_TZ.has(tzStart)) {
    throw new Error(
      `Invalid timeZone: ${tzStart}. Allowed: ${Array.from(ALLOWED_TZ).join(", ")}`
    );
  }
  if (tzEnd && !ALLOWED_TZ.has(tzEnd)) {
    throw new Error(
      `Invalid timeZone: ${tzEnd}. Allowed: ${Array.from(ALLOWED_TZ).join(", ")}`
    );
  }
  if (tzStart && tzEnd && tzStart !== tzEnd) {
    throw new Error("Start and end time zones must match.");
  }

  return tzStart ?? tzEnd;
}

/**
 * @description Applies a timezone to start and end EventDateTime objects in place.
 * Only sets timezone on timed events (those with dateTime); all-day events (with date only)
 * are left unchanged.
 *
 * @param {EDT} start - The event start time object (modified in place)
 * @param {EDT} end - The event end time object (modified in place)
 * @param {string | undefined} timezone - The IANA timezone to apply (e.g., 'America/New_York')
 * @returns {void}
 *
 * @example
 * const start = { dateTime: '2024-01-15T10:00:00' };
 * const end = { dateTime: '2024-01-15T11:00:00' };
 * applyTimezone(start, end, 'Europe/London');
 * // start.timeZone === 'Europe/London'
 * // end.timeZone === 'Europe/London'
 *
 * @example
 * // All-day events are not modified
 * const start = { date: '2024-01-15' };
 * const end = { date: '2024-01-16' };
 * applyTimezone(start, end, 'Europe/London');
 * // start.timeZone === undefined (unchanged)
 */
export function applyTimezone(
  start: EDT,
  end: EDT,
  timezone: string | undefined
): void {
  if (start.dateTime) {
    start.timeZone = timezone;
  }
  if (end.dateTime) {
    end.timeZone = timezone;
  }
}

/**
 * @description Builds a Google Calendar Event object from cleaned event parameters and
 * normalized start/end times. Extracts only the fields supported by the Google Calendar API.
 *
 * @param {Partial<Event>} cleaned - The cleaned event parameters (summary, description, location, etc.)
 * @param {EDT} start - The normalized start EventDateTime
 * @param {EDT} end - The normalized end EventDateTime
 * @returns {Event} A properly structured Google Calendar Event object
 *
 * @example
 * const event = buildEvent(
 *   { summary: 'Team Meeting', location: 'Conference Room A' },
 *   { dateTime: '2024-01-15T10:00:00', timeZone: 'UTC' },
 *   { dateTime: '2024-01-15T11:00:00', timeZone: 'UTC' }
 * );
 * // Result: {
 * //   summary: 'Team Meeting',
 * //   location: 'Conference Room A',
 * //   start: { dateTime: '2024-01-15T10:00:00', timeZone: 'UTC' },
 * //   end: { dateTime: '2024-01-15T11:00:00', timeZone: 'UTC' },
 * //   description: undefined,
 * //   attendees: undefined,
 * //   ...
 * // }
 */
export function buildEvent(
  cleaned: Partial<Event>,
  start: EDT,
  end: EDT
): Event {
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
 * @description Main function for formatting and validating calendar event data before API submission.
 * Performs deep cleaning, datetime normalization, validation, timezone resolution, and builds
 * the final Event object. This is the primary entry point for processing user event input.
 *
 * @param {Partial<Event>} params - Raw event parameters from user input or AI parsing
 * @returns {Event} A validated, cleaned, and properly formatted Google Calendar Event
 * @throws {Error} If validation fails (missing summary, start, end, or invalid timezone)
 *
 * @example
 * // Full event formatting pipeline
 * const rawEvent = {
 *   summary: 'Team Standup',
 *   description: '',  // Will be removed by deepClean
 *   location: null,   // Will be removed by deepClean
 *   start: { dateTime: '2024-01-15T09:00:00', timeZone: 'America/New_York' },
 *   end: { dateTime: '2024-01-15T09:30:00', timeZone: 'America/New_York' }
 * };
 * const event = formatEventData(rawEvent);
 * // Result: Cleaned, validated event ready for Google Calendar API
 *
 * @example
 * // Throws on missing required fields
 * formatEventData({ description: 'No summary provided' });
 * // Throws: Error('Event summary is required.')
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

/**
 * @description Removes null, undefined, and empty string values from a flat object.
 * A simpler, non-recursive version of deepClean for single-level objects.
 *
 * @template T - The object type extending Record<string, unknown>
 * @param {T} obj - The object to clean
 * @returns {T} A new object with null/undefined/empty string values removed
 *
 * @example
 * const obj = { a: 'value', b: null, c: '', d: 0 };
 * const cleaned = cleanObject(obj);
 * // Result: { a: 'value', d: 0 }  // Note: 0 is kept, only null/undefined/'' removed
 *
 * @private
 */
const cleanObject = <T extends Record<string, unknown>>(obj: T): T =>
  omitBy(obj, (v) => isNil(v) || v === "") as T;

/**
 * @description Cleans an EventDateTime-like object by converting empty strings to null and
 * returning undefined if neither date nor dateTime is present. Used during tool argument
 * parsing to normalize datetime inputs from various sources.
 *
 * @param {Object | null | undefined} dt - The datetime object to clean
 * @param {string | null} [dt.date] - The all-day date value
 * @param {string | null} [dt.dateTime] - The timed event datetime value
 * @param {string | null} [dt.timeZone] - The timezone identifier
 * @returns {{date?: string | null, dateTime?: string | null, timeZone?: string | null} | undefined}
 *   The cleaned datetime object, or undefined if no valid date/dateTime
 *
 * @example
 * cleanEventDateTime({ date: '', dateTime: '2024-01-15T10:00:00', timeZone: '' })
 * // Result: { date: null, dateTime: '2024-01-15T10:00:00', timeZone: null }
 *
 * @example
 * cleanEventDateTime({ date: '', dateTime: '' })
 * // Result: undefined (neither date nor dateTime present)
 *
 * @example
 * cleanEventDateTime(null)
 * // Result: undefined
 *
 * @private
 */
function cleanEventDateTime(
  dt:
    | {
        date?: string | null;
        dateTime?: string | null;
        timeZone?: string | null;
      }
    | null
    | undefined
):
  | { date?: string | null; dateTime?: string | null; timeZone?: string | null }
  | undefined {
  if (!dt) {
    return;
  }
  const cleaned = {
    date: dt.date === "" ? null : dt.date,
    dateTime: dt.dateTime === "" ? null : dt.dateTime,
    timeZone: dt.timeZone === "" ? null : dt.timeZone,
  };
  if (!(cleaned.date || cleaned.dateTime)) {
    return;
  }
  return cleaned;
}

/**
 * @description Parses and normalizes tool arguments from various input formats used by AI agents.
 * Handles multiple nesting patterns (input string, fullEventParameters, eventParameters) and
 * extracts email, calendarId, eventId, and event-like properties. Robust against malformed inputs.
 *
 * @param {unknown} raw - The raw tool arguments, which may be:
 *   - An object with an 'input' string property containing JSON
 *   - An object with 'fullEventParameters' or 'eventParameters' nesting
 *   - A flat object with event properties directly
 * @returns {{email: string | undefined, calendarId: string | null, eventId: string | undefined, eventLike: Partial<Event>}}
 *   An object containing:
 *   - email: The user's email address if found
 *   - calendarId: The calendar ID (null if not found or invalid)
 *   - eventId: The event ID if found (for updates/deletes)
 *   - eventLike: Cleaned partial Event object with extracted properties
 *
 * @example
 * // Parse nested input from AI tool call
 * const result = parseToolArguments({
 *   input: '{"email": "user@example.com", "eventParameters": {"summary": "Meeting"}}'
 * });
 * // Result: {
 * //   email: 'user@example.com',
 * //   calendarId: null,
 * //   eventId: undefined,
 * //   eventLike: { summary: 'Meeting' }
 * // }
 *
 * @example
 * // Parse flat object
 * const result = parseToolArguments({
 *   email: 'user@example.com',
 *   calendarId: 'primary',
 *   summary: 'Team Sync',
 *   start: { dateTime: '2024-01-15T10:00:00' }
 * });
 *
 * @example
 * // Invalid calendarId is normalized to null
 * parseToolArguments({ calendarId: '/' }).calendarId  // null
 * parseToolArguments({ calendarId: '  ' }).calendarId // null
 */
export function parseToolArguments(raw: unknown) {
  const base =
    typeof (raw as { input?: string })?.input === "string"
      ? JSON.parse((raw as { input: string }).input)
      : raw;

  const outer = base?.fullEventParameters ?? base;
  const inner = outer?.eventParameters ?? base?.eventParameters ?? base;

  const email = base?.email ?? outer?.email ?? inner?.email;
  const rawCalendarId =
    outer?.calendarId ?? base?.calendarId ?? inner?.calendarId;
  const calendarId =
    rawCalendarId &&
    typeof rawCalendarId === "string" &&
    rawCalendarId.trim() !== "" &&
    rawCalendarId !== "/"
      ? rawCalendarId.trim()
      : null;
  const eventId = base?.eventId ?? outer?.eventId ?? inner?.eventId;

  const cleanString = (val: unknown): string | undefined =>
    typeof val === "string" && val.trim() !== "" ? val : undefined;

  const eventLike: Partial<Event> = {
    id: inner?.id,
    summary: cleanString(inner?.summary),
    description: cleanString(inner?.description),
    location: cleanString(inner?.location),
    attendees: inner?.attendees,
    reminders: inner?.reminders,
    recurrence: inner?.recurrence,
    colorId: inner?.colorId,
    conferenceData: inner?.conferenceData,
    transparency: inner?.transparency,
    visibility: inner?.visibility,
    start: cleanEventDateTime(inner?.start),
    end: cleanEventDateTime(inner?.end),
  };

  return { email, calendarId, eventId, eventLike: cleanObject(eventLike) };
}
