import type { calendar_v3 } from "googleapis"
import { REQUEST_CONFIG_BASE } from "@/config"

type DeleteEventParams = {
  calendarEvents: calendar_v3.Resource$Events
  eventData?: calendar_v3.Schema$Event | Record<string, string>
  extra?: Record<string, unknown>
  req?: {
    body?: Record<string, unknown>
    query?: Record<string, unknown>
  } | null
}

/**
 * @description Validates and normalizes a calendar ID string for use with Google Calendar API.
 * Trims whitespace and rejects obviously invalid values like empty strings or single slashes.
 * @param {unknown} id - The calendar ID to validate (may be undefined, null, or non-string).
 * @returns {string | null} The trimmed calendar ID if valid, or null if invalid.
 * @example
 * normalizeCalendarId("primary"); // Returns "primary"
 * normalizeCalendarId("  user@gmail.com  "); // Returns "user@gmail.com"
 * normalizeCalendarId(""); // Returns null
 * normalizeCalendarId("/"); // Returns null
 */
function normalizeCalendarId(id: unknown): string | null {
  if (!id || typeof id !== "string") {
    return null
  }
  const trimmed = id.trim()
  // Reject obviously invalid values
  if (trimmed === "" || trimmed === "/") {
    return null
  }
  return trimmed
}

export async function deleteEvent({
  calendarEvents,
  eventData,
  extra,
  req,
}: DeleteEventParams) {
  const calendarId =
    normalizeCalendarId(extra?.calendarId) ||
    normalizeCalendarId(req?.body?.calendarId) ||
    normalizeCalendarId(req?.query?.calendarId) ||
    "primary"

  const resp = await calendarEvents.delete({
    ...REQUEST_CONFIG_BASE,
    calendarId,
    eventId: (eventData?.id as string) || "",
  })
  return resp.data
}
