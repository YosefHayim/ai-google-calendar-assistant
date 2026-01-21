import type { calendar_v3 } from "googleapis"
import { REQUEST_CONFIG_BASE } from "@/config"

type UpdateEventParams = {
  calendarEvents: calendar_v3.Resource$Events
  eventData?: calendar_v3.Schema$Event | Record<string, string>
  extra?: Record<string, unknown>
  req?: { query?: Record<string, unknown> } | null
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

export async function updateEvent({
  calendarEvents,
  eventData,
  extra,
  req,
}: UpdateEventParams) {
  const body =
    (eventData as calendar_v3.Schema$Event & {
      calendarId?: string
      email?: string
    }) || {}
  const calendarId =
    normalizeCalendarId(extra?.calendarId) ||
    normalizeCalendarId(body.calendarId) ||
    normalizeCalendarId(req?.query?.calendarId) ||
    "primary"

  const resp = await calendarEvents.update({
    ...REQUEST_CONFIG_BASE,
    eventId: (eventData?.id as string) || "",
    requestBody: eventData,
    calendarId,
  })

  return resp.data
}
