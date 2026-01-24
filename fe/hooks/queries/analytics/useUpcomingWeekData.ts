'use client'

import { useQuery } from '@tanstack/react-query'
import { addDays, startOfDay, endOfDay, format, isToday, isTomorrow } from 'date-fns'
import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { AnalyticsResponseSchema } from '@/types/analytics'
import type { CalendarEvent } from '@/types/api'

export interface UpcomingDayData {
  date: Date
  dateKey: string
  dateStr: string
  dayName: string
  dayShort: string
  isToday: boolean
  isTomorrow: boolean
  totalHours: number
  eventCount: number
  events: {
    id: string
    summary: string
    startTime: string
    endTime: string
    durationMinutes: number
    calendarName: string
    calendarColor: string
    isAllDay: boolean
    isRecurring: boolean
  }[]
  busynessLevel: 'free' | 'light' | 'moderate' | 'busy' | 'packed'
}

export interface UpcomingWeekData {
  days: UpcomingDayData[]
  totalEvents: number
  totalHours: number
  busiestDay: string
  freestDay: string
}

interface UseUpcomingWeekDataOptions {
  calendarMap: Map<string, { name: string; color: string }>
  enabled?: boolean
}

function getBusynessLevel(hours: number): 'free' | 'light' | 'moderate' | 'busy' | 'packed' {
  if (hours === 0) return 'free'
  if (hours < 2) return 'light'
  if (hours < 4) return 'moderate'
  if (hours < 6) return 'busy'
  return 'packed'
}

export function useUpcomingWeekData({ calendarMap, enabled = true }: UseUpcomingWeekDataOptions) {
  const today = startOfDay(new Date())
  const weekEnd = endOfDay(addDays(today, 6))

  return useQuery({
    queryKey: ['upcoming-week', today.toISOString()],
    queryFn: async (): Promise<UpcomingWeekData> => {
      const params = new URLSearchParams({
        timeMin: today.toISOString(),
        timeMax: weekEnd.toISOString(),
      })

      const response = await apiClient.get(`${ENDPOINTS.EVENTS_ANALYTICS}?${params.toString()}`)

      const result = AnalyticsResponseSchema.safeParse(response.data)
      let allEvents: { calendarId: string; events: CalendarEvent[] }[] = []

      if (result.success) {
        allEvents = result.data.data.allEvents as { calendarId: string; events: CalendarEvent[] }[]
      } else if (response.data?.allEvents) {
        allEvents = response.data.allEvents
      }

      const days: UpcomingDayData[] = []
      for (let i = 0; i < 7; i++) {
        const date = addDays(today, i)
        days.push({
          date,
          dateKey: format(date, 'yyyy-MM-dd'),
          dateStr: format(date, 'EEE, MMM d'),
          dayName: format(date, 'EEEE'),
          dayShort: format(date, 'EEE'),
          isToday: isToday(date),
          isTomorrow: isTomorrow(date),
          totalHours: 0,
          eventCount: 0,
          events: [],
          busynessLevel: 'free',
        })
      }

      // Process events
      allEvents.forEach((calendarGroup) => {
        if (!calendarGroup?.calendarId || !Array.isArray(calendarGroup.events)) return

        const calendarInfo = calendarMap.get(calendarGroup.calendarId)
        const calendarName = calendarInfo?.name || calendarGroup.calendarId.split('@')[0] || 'Calendar'
        const calendarColor = calendarInfo?.color || '#6366f1'

        calendarGroup.events.forEach((event) => {
          if (!event?.start) return

          const isAllDay = !!event.start.date && !event.start.dateTime
          const isRecurring = !!event.recurringEventId || !!event.recurrence
          const eventStart = event.start.dateTime
            ? new Date(event.start.dateTime)
            : event.start.date
              ? new Date(event.start.date)
              : null

          if (!eventStart) return

          const eventDateKey = format(eventStart, 'yyyy-MM-dd')
          const dayData = days.find((d) => d.dateKey === eventDateKey)

          if (!dayData) return

          let durationMinutes = 0
          if (event.start.dateTime && event.end?.dateTime) {
            const end = new Date(event.end.dateTime)
            durationMinutes = (end.getTime() - eventStart.getTime()) / (1000 * 60)
            dayData.totalHours += durationMinutes / 60
          }

          dayData.eventCount++
          dayData.events.push({
            id: event.id,
            summary: event.summary || 'No Title',
            startTime: event.start.dateTime || event.start.date || '',
            endTime: event.end?.dateTime || event.end?.date || '',
            durationMinutes,
            calendarName,
            calendarColor,
            isAllDay,
            isRecurring,
          })
        })
      })

      // Calculate busyness levels and totals
      let totalEvents = 0
      let totalHours = 0
      let busiestDay = days[0]
      let freestDay = days[0]

      days.forEach((day) => {
        day.totalHours = Math.round(day.totalHours * 10) / 10
        day.busynessLevel = getBusynessLevel(day.totalHours)
        day.events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

        totalEvents += day.eventCount
        totalHours += day.totalHours

        if (day.totalHours > busiestDay.totalHours) {
          busiestDay = day
        }
        if (day.totalHours < freestDay.totalHours) {
          freestDay = day
        }
      })

      return {
        days,
        totalEvents,
        totalHours: Math.round(totalHours * 10) / 10,
        busiestDay: busiestDay.dayName,
        freestDay: freestDay.dayName,
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })
}
