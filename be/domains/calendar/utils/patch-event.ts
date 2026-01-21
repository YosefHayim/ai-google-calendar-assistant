import type { calendar_v3 } from "googleapis"
import { REQUEST_CONFIG_BASE } from "@/config"

type PatchEventParams = {
  calendarEvents: calendar_v3.Resource$Events
  eventData?: calendar_v3.Schema$Event | Record<string, string>
  extra?: Record<string, unknown>
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
 * normalizeCalendarId(null); // Returns null
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

/**
 * Generate conference data for Google Meet
 */
function generateMeetConferenceData(): calendar_v3.Schema$ConferenceData {
  return {
    createRequest: {
      requestId: Date.now().toString(),
      conferenceSolutionKey: {
        type: "hangoutsMeet",
      },
    },
  }
}

/**
 * Patch an event in the calendar (partial update - only updates provided fields)
 *
 * @param {PatchEventParams} params - The parameters for patching an event.
 * @returns {Promise<calendar_v3.Schema$Event>} The patched event.
 * @description Patches an event in the calendar - only the fields provided are updated,
 * other fields are preserved. This is the preferred method for partial updates.
 * Supports adding Google Meet links to existing events via extra.addMeetLink.
 */
export async function patchEvent({
  calendarEvents,
  eventData,
  extra,
}: PatchEventParams) {
  const body =
    (eventData as calendar_v3.Schema$Event & {
      calendarId?: string
      email?: string
    }) || {}
  const calendarId =
    normalizeCalendarId(extra?.calendarId) ||
    normalizeCalendarId(body.calendarId) ||
    "primary"
  const eventId = (extra?.eventId as string) || body.id || ""
  const addMeetLink = extra?.addMeetLink === true

  if (!eventId) {
    throw new Error("eventId is required for patch operation")
  }

  const { calendarId: _cid, email: _email, id: _id, ...requestBody } = body

  // Add Google Meet conference data if requested
  if (addMeetLink) {
    requestBody.conferenceData = generateMeetConferenceData()
  }

  const patchedEvent = await calendarEvents.patch({
    ...REQUEST_CONFIG_BASE,
    calendarId,
    eventId,
    requestBody,
    // conferenceDataVersion is required when adding conference data
    conferenceDataVersion: addMeetLink ? 1 : undefined,
  })
  return patchedEvent.data
}
