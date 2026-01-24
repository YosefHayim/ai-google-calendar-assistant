import type { calendar_v3 } from "googleapis"
import type { ConflictCheckResult, ConflictingEvent } from "@/shared/types"
import { fetchCredentialsByEmail } from "@/domains/auth/utils"
import { formatDate } from "@/lib/date"
import { asyncHandler } from "@/lib/http"
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "./init"

export type { ConflictingEvent, ConflictCheckResult }

export type ConflictCheckParams = {
  email: string
  calendarId: string
  startTime: string
  endTime: string
}

export type ConflictCheckAllCalendarsParams = {
  email: string
  startTime: string
  endTime: string
  excludeEventId?: string
}

/**
 * Checks for conflicting events in the specified time range.
 * Uses Google Calendar events.list API to find overlapping events.
 * @param {ConflictCheckParams} params - The parameters for the conflict check.
 * @returns {Promise<ConflictCheckResult>} The result of the conflict check.
 * @example
 * const result = await checkEventConflicts({ email: "test@example.com", calendarId: "primary", startTime: "2025-01-01", endTime: "2025-01-02" });
 *
 */
export const checkEventConflicts = asyncHandler(
  async (params: ConflictCheckParams): Promise<ConflictCheckResult> => {
    const { email, calendarId, startTime, endTime } = params

    const credentials = await fetchCredentialsByEmail(email)
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials)

    // Get calendar name for display
    let calendarName = "Primary"
    if (calendarId && calendarId !== "primary") {
      try {
        const calendarInfo = await calendar.calendars.get({ calendarId })
        calendarName = calendarInfo.data.summary || calendarId
      } catch {
        calendarName = calendarId
      }
    }

    // Query events in the time range
    const eventsResponse = await calendar.events.list({
      calendarId: calendarId || "primary",
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 10, // Limit to avoid too many results
    })

    const events = eventsResponse.data.items || []

    const conflictingEvents: ConflictingEvent[] = events
      .filter((event: calendar_v3.Schema$Event) => {
        if (!(event.start && event.end)) {
          return false
        }

        const eventStart = event.start.dateTime || event.start.date
        const eventEnd = event.end.dateTime || event.end.date

        if (!(eventStart && eventEnd)) {
          return false
        }

        const newStart = new Date(startTime).getTime()
        const newEnd = new Date(endTime).getTime()
        const existingStart = new Date(eventStart).getTime()
        const existingEnd = new Date(eventEnd).getTime()

        return newStart < existingEnd && newEnd > existingStart
      })
      .map((event: calendar_v3.Schema$Event) => ({
        id: event.id || "",
        summary: event.summary || "Untitled Event",
        start:
          formatDate(event.start?.dateTime || event.start?.date || "", true) ||
          "",
        end:
          formatDate(event.end?.dateTime || event.end?.date || "", true) || "",
        calendarId: calendarId || "primary",
        calendarName,
      }))

    return {
      hasConflicts: conflictingEvents.length > 0,
      conflictingEvents,
    }
  }
)

/**
 * @description Checks for conflicting events across all user calendars in the specified time range.
 * Queries Google Calendar API for each calendar the user has access to and identifies
 * any events that overlap with the proposed time slot.
 * @param {ConflictCheckAllCalendarsParams} params - The parameters for the conflict check.
 * @param {string} params.email - The email address of the user whose calendars to check.
 * @param {string} params.startTime - The start time of the proposed event in ISO 8601 format.
 * @param {string} params.endTime - The end time of the proposed event in ISO 8601 format.
 * @param {string} [params.excludeEventId] - Optional event ID to exclude from conflict detection (useful when rescheduling).
 * @returns {Promise<ConflictCheckResult>} An object containing hasConflicts boolean and array of conflicting events.
 * @example
 * const result = await checkEventConflictsAllCalendars({
 *   email: "user@example.com",
 *   startTime: "2025-01-15T10:00:00Z",
 *   endTime: "2025-01-15T11:00:00Z",
 *   excludeEventId: "abc123" // optional
 * });
 * if (result.hasConflicts) {
 *   console.log("Conflicts found:", result.conflictingEvents);
 * }
 */
const NEARBY_BUFFER_MINUTES = 15
const MS_PER_MINUTE = 60000
const NEARBY_BUFFER_MS = NEARBY_BUFFER_MINUTES * MS_PER_MINUTE

export const checkEventConflictsAllCalendars = asyncHandler(
  async (
    params: ConflictCheckAllCalendarsParams
  ): Promise<ConflictCheckResult> => {
    const { email, startTime, endTime, excludeEventId } = params

    const credentials = await fetchCredentialsByEmail(email)
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials)

    const calendarListResponse = await calendar.calendarList.list({
      prettyPrint: true,
    })
    const allCalendars = calendarListResponse.data.items || []

    const allConflicts: ConflictingEvent[] = []
    const nearbyEvents: ConflictingEvent[] = []

    const newStart = new Date(startTime).getTime()
    const newEnd = new Date(endTime).getTime()
    const searchStart = new Date(newStart - NEARBY_BUFFER_MS).toISOString()
    const searchEnd = new Date(newEnd + NEARBY_BUFFER_MS).toISOString()

    await Promise.all(
      allCalendars.map(async (cal) => {
        const calId = cal.id || "primary"
        const calName = cal.summary || calId

        try {
          const eventsResponse = await calendar.events.list({
            calendarId: calId,
            timeMin: searchStart,
            timeMax: searchEnd,
            singleEvents: true,
            orderBy: "startTime",
            maxResults: 20,
          })

          const events = eventsResponse.data.items || []

          events.forEach((event: calendar_v3.Schema$Event) => {
            if (excludeEventId && event.id === excludeEventId) {
              return
            }
            if (!(event.start && event.end)) {
              return
            }

            const eventStart = event.start.dateTime || event.start.date
            const eventEnd = event.end.dateTime || event.end.date

            if (!(eventStart && eventEnd)) {
              return
            }

            const existingStart = new Date(eventStart).getTime()
            const existingEnd = new Date(eventEnd).getTime()

            const eventInfo: ConflictingEvent = {
              id: event.id || "",
              summary: event.summary || "Untitled Event",
              start:
                formatDate(
                  event.start?.dateTime || event.start?.date || "",
                  true
                ) || "",
              end:
                formatDate(
                  event.end?.dateTime || event.end?.date || "",
                  true
                ) || "",
              calendarId: calId,
              calendarName: calName,
            }

            if (newStart < existingEnd && newEnd > existingStart) {
              allConflicts.push(eventInfo)
            } else if (
              (existingEnd > newStart - NEARBY_BUFFER_MS &&
                existingEnd <= newStart) ||
              (existingStart >= newEnd &&
                existingStart < newEnd + NEARBY_BUFFER_MS)
            ) {
              nearbyEvents.push(eventInfo)
            }
          })
        } catch (error) {
          console.error(
            `Failed to check conflicts for calendar ${calId}:`,
            error
          )
        }
      })
    )

    return {
      hasConflicts: allConflicts.length > 0,
      conflictingEvents: allConflicts,
      nearbyEvents: nearbyEvents.length > 0 ? nearbyEvents : undefined,
    }
  }
)
