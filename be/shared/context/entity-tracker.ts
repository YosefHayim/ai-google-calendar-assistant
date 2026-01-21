import type { calendar_v3 } from "googleapis"
import {
  type CalendarReference,
  type EventReference,
  type Modality,
  unifiedContextStore,
} from "./unified-context-store"

export type TrackedEvent = {
  eventId: string
  calendarId: string
  summary: string
  start: string
  end: string
}

export type TrackedCalendar = {
  calendarId: string
  calendarName: string
  isPrimary: boolean
}

function extractEventData(
  event: calendar_v3.Schema$Event,
  calendarId: string
): TrackedEvent | null {
  if (!(event.id && event.summary)) {
    return null
  }

  const start = event.start?.dateTime || event.start?.date
  const end = event.end?.dateTime || event.end?.date
  if (!(start && end)) {
    return null
  }

  return {
    eventId: event.id,
    calendarId,
    summary: event.summary,
    start,
    end,
  }
}

export const entityTracker = {
  async trackEvent(
    userId: string,
    event: calendar_v3.Schema$Event,
    calendarId: string,
    modality: Modality
  ): Promise<void> {
    const extracted = extractEventData(event, calendarId)
    if (!extracted) {
      return
    }

    await unifiedContextStore.setLastEvent(
      userId,
      {
        eventId: extracted.eventId,
        calendarId: extracted.calendarId,
        summary: extracted.summary,
        start: extracted.start,
        end: extracted.end,
        modality,
      },
      modality
    )
  },

  async trackCalendar(
    userId: string,
    calendar: TrackedCalendar,
    modality: Modality
  ): Promise<void> {
    await unifiedContextStore.setLastCalendar(
      userId,
      {
        calendarId: calendar.calendarId,
        calendarName: calendar.calendarName,
        isPrimary: calendar.isPrimary,
        modality,
      },
      modality
    )
  },

  async resolveEventReference(userId: string): Promise<EventReference | null> {
    return unifiedContextStore.getLastEvent(userId)
  },

  async resolveCalendarReference(
    userId: string
  ): Promise<CalendarReference | null> {
    return unifiedContextStore.getLastCalendar(userId)
  },

  async hasRecentEvent(
    userId: string,
    maxAgeMs = 30 * 60 * 1000
  ): Promise<boolean> {
    const event = await unifiedContextStore.getLastEvent(userId)
    if (!event) {
      return false
    }

    const storedAt = new Date(event.storedAt).getTime()
    const now = Date.now()
    return now - storedAt < maxAgeMs
  },

  async hasRecentCalendar(
    userId: string,
    maxAgeMs = 30 * 60 * 1000
  ): Promise<boolean> {
    const calendar = await unifiedContextStore.getLastCalendar(userId)
    if (!calendar) {
      return false
    }

    const storedAt = new Date(calendar.storedAt).getTime()
    const now = Date.now()
    return now - storedAt < maxAgeMs
  },
}
