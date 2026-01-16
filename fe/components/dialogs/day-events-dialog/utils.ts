import type { CalendarEvent } from '@/types/api'
import { format } from 'date-fns'
import { formatDurationMs, formatTimeRange, DATE_FORMATS } from '@/lib/formatUtils'
import type { CalendarInfo } from './types'

export function getEventDuration(event: CalendarEvent): string {
  if (!event.start || !event.end) return 'N/A'

  const start = event.start.dateTime
    ? new Date(event.start.dateTime)
    : event.start.date
      ? new Date(event.start.date)
      : null
  const end = event.end.dateTime ? new Date(event.end.dateTime) : event.end.date ? new Date(event.end.date) : null

  if (!start || !end) return 'N/A'

  const durationMs = end.getTime() - start.getTime()
  return formatDurationMs(durationMs)
}

export function formatEventTime(event: CalendarEvent): string {
  if (!event.start) return 'N/A'

  if (event.start.dateTime) {
    return format(new Date(event.start.dateTime), DATE_FORMATS.TIME_12H)
  }
  if (event.start.date) {
    return 'All day'
  }
  return 'N/A'
}

export function formatEventTimeRange(event: CalendarEvent): string {
  if (!event.start || !event.end) return 'N/A'

  if (event.start.dateTime && event.end.dateTime) {
    return formatTimeRange(event.start.dateTime, event.end.dateTime)
  }
  if (event.start.date) {
    return 'All day'
  }
  return 'N/A'
}

export function getCalendarInfo(
  event: CalendarEvent,
  calendarMap: Map<string, CalendarInfo>
): CalendarInfo {
  if (event.organizer?.email) {
    const info = calendarMap.get(event.organizer.email)
    if (info) return info
  }
  return { name: 'Calendar', color: '#6366f1' }
}

export function calculateFilteredBusyHours(events: CalendarEvent[]): number {
  return events.reduce((acc, event) => {
    if (!event.start || !event.end) return acc
    const start = event.start.dateTime
      ? new Date(event.start.dateTime)
      : event.start.date
        ? new Date(event.start.date)
        : null
    const end = event.end.dateTime ? new Date(event.end.dateTime) : event.end.date ? new Date(event.end.date) : null
    if (!start || !end) return acc
    const durationMs = end.getTime() - start.getTime()
    return acc + durationMs / (1000 * 60 * 60)
  }, 0)
}

export function sortEventsByStartTime(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const aStart = a.start?.dateTime
      ? new Date(a.start.dateTime).getTime()
      : a.start?.date
        ? new Date(a.start.date).getTime()
        : 0
    const bStart = b.start?.dateTime
      ? new Date(b.start.dateTime).getTime()
      : b.start?.date
        ? new Date(b.start.date).getTime()
        : 0
    return aStart - bStart
  })
}
