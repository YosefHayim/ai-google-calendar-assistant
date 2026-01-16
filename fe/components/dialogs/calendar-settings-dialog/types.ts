import type { CalendarListEntry } from '@/types/api'

export interface ExtendedCalendarEntry extends CalendarListEntry {
  notificationSettings?: {
    notifications?: Array<{
      type: string
      method: string
    }>
  }
  conferenceProperties?: {
    allowedConferenceSolutionTypes?: string[]
  }
  location?: string
}
