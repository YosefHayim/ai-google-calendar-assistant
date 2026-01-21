import type { calendar_v3 } from "googleapis"
import type { ConflictingEvent } from "@/shared/types"
import { fetchCredentialsByEmail } from "@/domains/auth/utils"
import { formatDate } from "@/lib/date"
import { asyncHandler } from "@/lib/http"
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "./init"

export type RescheduleSuggestion = {
  start: string
  end: string
  startFormatted: string
  endFormatted: string
  dayOfWeek: string
  score: number
  reason: string
}

export type RescheduleParams = {
  email: string
  eventId: string
  calendarId?: string
  preferredTimeOfDay?: "morning" | "afternoon" | "evening" | "any"
  daysToSearch?: number
  excludeWeekends?: boolean
}

export type RescheduleResult = {
  success: boolean
  event?: {
    id: string
    summary: string
    start: string
    end: string
    duration: number // in minutes
  }
  suggestions: RescheduleSuggestion[]
  conflicts?: ConflictingEvent[]
  error?: string
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const TIME_PREFERENCES = {
  morning: { start: 8, end: 12, label: "Morning (8AM-12PM)" },
  afternoon: { start: 12, end: 17, label: "Afternoon (12PM-5PM)" },
  evening: { start: 17, end: 21, label: "Evening (5PM-9PM)" },
  any: { start: 8, end: 21, label: "Any time" },
}

/**
 * @description Finds optimal reschedule times for an event based on user preferences and calendar availability.
 * Analyzes free slots across all user calendars, scores them by time preference, and returns ranked suggestions.
 * @param {RescheduleParams} params - Parameters for finding reschedule suggestions.
 * @param {string} params.email - The user's email address for authentication.
 * @param {string} params.eventId - The ID of the event to reschedule.
 * @param {string} [params.calendarId="primary"] - The calendar containing the event.
 * @param {"morning" | "afternoon" | "evening" | "any"} [params.preferredTimeOfDay="any"] - Preferred time slot for the event.
 * @param {number} [params.daysToSearch=7] - Number of days to search for available slots.
 * @param {boolean} [params.excludeWeekends=false] - Whether to exclude weekend days from suggestions.
 * @returns {Promise<RescheduleResult>} Result containing event info, ranked suggestions, and any errors.
 * @example
 * const result = await findRescheduleSuggestions({
 *   email: "user@example.com",
 *   eventId: "event123",
 *   preferredTimeOfDay: "morning",
 *   excludeWeekends: true
 * });
 * if (result.success) {
 *   console.log("Top suggestion:", result.suggestions[0]);
 * }
 */
export const findRescheduleSuggestions = asyncHandler(
  async (params: RescheduleParams): Promise<RescheduleResult> => {
    const {
      email,
      eventId,
      calendarId = "primary",
      preferredTimeOfDay = "any",
      daysToSearch = 7,
      excludeWeekends = false,
    } = params

    const credentials = await fetchCredentialsByEmail(email)
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials)

    // Get the event to reschedule
    let eventToReschedule: calendar_v3.Schema$Event
    try {
      const eventResponse = await calendar.events.get({
        calendarId,
        eventId,
      })
      eventToReschedule = eventResponse.data
    } catch (_error) {
      return {
        success: false,
        suggestions: [],
        error: "Event not found or access denied",
      }
    }

    if (!(eventToReschedule.start && eventToReschedule.end)) {
      return {
        success: false,
        suggestions: [],
        error: "Event has no start or end time",
      }
    }

    // Calculate event duration
    const eventStart = new Date(
      eventToReschedule.start.dateTime || eventToReschedule.start.date || ""
    )
    const eventEnd = new Date(
      eventToReschedule.end.dateTime || eventToReschedule.end.date || ""
    )
    const durationMinutes = Math.round(
      (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60)
    )

    // Search window: from tomorrow to daysToSearch days
    const searchStart = new Date()
    searchStart.setDate(searchStart.getDate() + 1)
    searchStart.setHours(0, 0, 0, 0)

    const searchEnd = new Date(searchStart)
    searchEnd.setDate(searchEnd.getDate() + daysToSearch)

    // Get all events in search window across all calendars
    const calendarListResponse = await calendar.calendarList.list({
      prettyPrint: true,
    })
    const allCalendars = calendarListResponse.data.items || []

    const allBusySlots: { start: Date; end: Date }[] = []

    await Promise.all(
      allCalendars.map(async (cal) => {
        if (!cal.id) {
          return
        }
        try {
          const eventsResponse = await calendar.events.list({
            calendarId: cal.id,
            timeMin: searchStart.toISOString(),
            timeMax: searchEnd.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
          })

          const events = eventsResponse.data.items || []
          for (const event of events) {
            if (event.id === eventId) {
              continue // Exclude the event being rescheduled
            }
            if (!(event.start && event.end)) {
              continue
            }

            const start = new Date(
              event.start.dateTime || event.start.date || ""
            )
            const end = new Date(event.end.dateTime || event.end.date || "")
            allBusySlots.push({ start, end })
          }
        } catch {
          // Skip calendars that fail
        }
      })
    )

    // Sort busy slots by start time
    allBusySlots.sort((a, b) => a.start.getTime() - b.start.getTime())

    // Find free slots
    const suggestions: RescheduleSuggestion[] = []
    const timePrefs = TIME_PREFERENCES[preferredTimeOfDay]

    for (
      let dayOffset = 1;
      dayOffset <= daysToSearch && suggestions.length < 5;
      dayOffset++
    ) {
      const checkDate = new Date(searchStart)
      checkDate.setDate(searchStart.getDate() + dayOffset - 1)

      // Skip weekends if requested
      if (
        excludeWeekends &&
        (checkDate.getDay() === 0 || checkDate.getDay() === 6)
      ) {
        continue
      }

      const dayOfWeek = DAYS_OF_WEEK[checkDate.getDay()]

      // Check each hour in the preferred time range
      for (
        let hour = timePrefs.start;
        hour <= timePrefs.end - Math.ceil(durationMinutes / 60);
        hour++
      ) {
        const slotStart = new Date(checkDate)
        slotStart.setHours(hour, 0, 0, 0)

        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotStart.getMinutes() + durationMinutes)

        // Check if this slot conflicts with any busy time
        const hasConflict = allBusySlots.some(
          (busy) => slotStart < busy.end && slotEnd > busy.start
        )

        if (!hasConflict) {
          // Calculate score based on various factors
          let score = 100
          let reason = ""

          // Prefer earlier days
          score -= dayOffset * 5

          // Prefer preferred time of day
          if (
            preferredTimeOfDay !== "any" &&
            hour >= timePrefs.start &&
            hour < timePrefs.end
          ) {
            score += 20
            reason = `${timePrefs.label}`
          }

          // Prefer business hours (9-5)
          if (hour >= 9 && hour < 17) {
            score += 10
            reason = reason || "Business hours"
          }

          // Prefer not too early or late
          if (hour >= 10 && hour <= 15) {
            score += 5
            reason = reason || "Optimal time"
          }

          // Generate readable reason
          if (!reason) {
            reason =
              dayOffset === 1
                ? "Tomorrow"
                : `${dayOfWeek}, ${dayOffset} days from now`
          }

          suggestions.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            startFormatted: formatDate(slotStart.toISOString(), true) || "",
            endFormatted: formatDate(slotEnd.toISOString(), true) || "",
            dayOfWeek,
            score,
            reason,
          })

          // Only take the best slot per day
          break
        }
      }
    }

    // Sort by score (highest first)
    suggestions.sort((a, b) => b.score - a.score)

    // Limit to top 5
    const topSuggestions = suggestions.slice(0, 5)

    return {
      success: true,
      event: {
        id: eventToReschedule.id || "",
        summary: eventToReschedule.summary || "Untitled Event",
        start:
          formatDate(
            eventToReschedule.start.dateTime ||
              eventToReschedule.start.date ||
              "",
            true
          ) || "",
        end:
          formatDate(
            eventToReschedule.end.dateTime || eventToReschedule.end.date || "",
            true
          ) || "",
        duration: durationMinutes,
      },
      suggestions: topSuggestions,
    }
  }
)

export type ApplyRescheduleParams = {
  email: string
  eventId: string
  calendarId?: string
  newStart: string
  newEnd: string
}

export type ApplyRescheduleResult = {
  success: boolean
  event?: calendar_v3.Schema$Event
  error?: string
}

/**
 * @description Applies a reschedule suggestion by updating the event's start and end times.
 * Patches the event in Google Calendar with the new time slot.
 * @param {ApplyRescheduleParams} params - Parameters for applying the reschedule.
 * @param {string} params.email - The user's email address for authentication.
 * @param {string} params.eventId - The ID of the event to reschedule.
 * @param {string} [params.calendarId="primary"] - The calendar containing the event.
 * @param {string} params.newStart - The new start time in ISO 8601 format.
 * @param {string} params.newEnd - The new end time in ISO 8601 format.
 * @returns {Promise<ApplyRescheduleResult>} Result indicating success and the updated event or error message.
 * @example
 * const result = await applyReschedule({
 *   email: "user@example.com",
 *   eventId: "event123",
 *   newStart: "2025-01-16T10:00:00Z",
 *   newEnd: "2025-01-16T11:00:00Z"
 * });
 * if (result.success) {
 *   console.log("Event rescheduled to:", result.event?.start);
 * }
 */
export const applyReschedule = asyncHandler(
  async (params: ApplyRescheduleParams): Promise<ApplyRescheduleResult> => {
    const { email, eventId, calendarId = "primary", newStart, newEnd } = params

    const credentials = await fetchCredentialsByEmail(email)
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials)

    try {
      const patchedEvent = await calendar.events.patch({
        calendarId,
        eventId,
        requestBody: {
          start: { dateTime: newStart },
          end: { dateTime: newEnd },
        },
      })

      return {
        success: true,
        event: patchedEvent.data,
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to reschedule event",
      }
    }
  }
)
