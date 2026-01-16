import type { CalendarEvent } from '@/types/api'
import { formatDurationMs, formatDate } from '@/lib/formatUtils'

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
    return formatDate(event.start.dateTime, 'DATE_TIME')
  }
  if (event.start.date) {
    return formatDate(event.start.date, 'FULL')
  }
  return 'N/A'
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
