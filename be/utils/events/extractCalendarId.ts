import type { Request } from "express";
import type { calendar_v3 } from "googleapis";

/**
 * Extracts calendar ID from various sources, defaults to "primary"
 */
export function extractCalendarId(
  req?: Request | null,
  extra?: Record<string, unknown>,
  eventData?: calendar_v3.Schema$Event | Record<string, string>
): string {
  const bodyCalendarId = (eventData as calendar_v3.Schema$Event & { calendarId?: string })?.calendarId;
  const extraCalendarId = extra?.calendarId as string | undefined;
  const queryCalendarId = req?.query?.calendarId as string | undefined;
  const reqBodyCalendarId = req?.body?.calendarId as string | undefined;

  return extraCalendarId || bodyCalendarId || queryCalendarId || reqBodyCalendarId || "primary";
}
