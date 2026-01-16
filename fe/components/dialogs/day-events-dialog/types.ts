import type { CalendarEvent } from '@/types/api'

export interface DayEventsDialogProps {
  isOpen: boolean
  date: string
  availableHours: number
  events: CalendarEvent[]
  calendarMap: Map<string, { name: string; color: string }>
  isLoading?: boolean
  onClose: () => void
  onEventClick: (event: CalendarEvent, calendarColor: string, calendarName: string) => void
}

export interface CalendarInfo {
  name: string
  color: string
}

export const WAKING_HOURS_PER_DAY = 16
