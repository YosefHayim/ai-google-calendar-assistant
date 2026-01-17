import type { Event, ColorDefinition } from '../types'

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getDuration(startTime: Date, endTime: Date): string {
  const diff = endTime.getTime() - startTime.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

export function getEventsForDay(events: Event[], date: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.startTime)
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    )
  })
}

export function getEventsForDayAndHour(events: Event[], date: Date, hour: number): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.startTime)
    const eventHour = eventDate.getHours()
    return (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear() &&
      eventHour === hour
    )
  })
}

export function getEventsForHour(events: Event[], currentDate: Date, hour: number): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.startTime)
    const eventHour = eventDate.getHours()
    return (
      eventDate.getDate() === currentDate.getDate() &&
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear() &&
      eventHour === hour
    )
  })
}

export function getEventsForMonth(events: Event[], month: Date): Event[] {
  return events.filter((event) => {
    const eventDate = event.startTime
    return eventDate.getFullYear() === month.getFullYear() && eventDate.getMonth() === month.getMonth()
  })
}

export function getMonthDays(month: Date): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const days: Date[] = []
  const current = new Date(startDate)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

export function getWeekDays(currentDate: Date): Date[] {
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    return day
  })
}

export function hasEventOnDay(day: Date, monthEvents: Event[]): boolean {
  return monthEvents.some(
    (event) =>
      event.startTime.getFullYear() === day.getFullYear() &&
      event.startTime.getMonth() === day.getMonth() &&
      event.startTime.getDate() === day.getDate(),
  )
}

export function getEventColorsForDay(
  day: Date,
  monthEvents: Event[],
  getColorClasses: (color: string) => ColorDefinition,
): string[] {
  const dayEvents = monthEvents.filter(
    (event) =>
      event.startTime.getFullYear() === day.getFullYear() &&
      event.startTime.getMonth() === day.getMonth() &&
      event.startTime.getDate() === day.getDate(),
  )
  return dayEvents.slice(0, 3).map((e) => e.hexColor || getColorClasses(e.color).bg)
}

export function groupEventsByDate(events: Event[]): Record<string, Event[]> {
  const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  return sortedEvents.reduce(
    (acc, event) => {
      const dateKey = event.startTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(event)
      return acc
    },
    {} as Record<string, Event[]>,
  )
}

export function getDateLabel(view: ViewType, currentDate: Date): string {
  switch (view) {
    case 'year':
      return currentDate.getFullYear().toString()
    case 'month':
      return currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    case 'week':
      return `Week of ${currentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`
    case 'day':
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    case 'list':
      return 'All Events'
    default:
      return ''
  }
}

export type ViewType = 'month' | 'week' | 'day' | 'list' | 'year'
