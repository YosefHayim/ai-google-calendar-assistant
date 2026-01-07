'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import {
  AnalyticsResponseSchema,
  type AnalyticsResponse,
  type CalendarBreakdownItem,
  type ProcessedActivity,
  type PeriodMetrics,
  type DailyAvailableHoursDataPoint,
  type EnhancedAnalyticsData,
  type WeeklyPatternDataPoint,
  type MonthlyPatternDataPoint,
  type PatternEventSummary,
  type EventDurationCategory,
  type TimeOfDayDistribution,
  type EventDurationBreakdown,
  type FocusTimeMetrics,
  type ProductivityMetrics,
} from '@/types/analytics'
import { toast } from 'sonner'
import { useAnalyticsComparison } from './useAnalyticsComparison'
import type { CalendarEvent } from '@/types/api'

interface UseAnalyticsDataOptions {
  timeMin: Date | null
  timeMax: Date | null
  calendarMap: Map<string, { name: string; color: string }>
  enabled?: boolean
}

const WAKING_HOURS_PER_DAY = 16
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getEmptyEnhancedData(): EnhancedAnalyticsData {
  return {
    totalEvents: 0,
    totalDurationHours: 0,
    averageEventDuration: 0,
    busiestDayHours: 0,
    calendarBreakdown: [],
    recentActivities: [],
    dailyAvailableHours: [],
    weeklyPattern: DAY_NAMES.map((day, index) => ({
      day,
      dayShort: DAY_NAMES_SHORT[index],
      dayIndex: index,
      hours: 0,
      eventCount: 0,
      events: [],
    })),
    monthlyPattern: Array.from({ length: 31 }, (_, i) => ({
      dayOfMonth: i + 1,
      hours: 0,
      eventCount: 0,
      events: [],
    })),
    timeOfDayDistribution: { morning: 0, afternoon: 0, evening: 0, night: 0 },
    eventDurationBreakdown: { short: 0, medium: 0, long: 0, extended: 0 },
    eventDurationCategories: [
      { key: 'short', label: 'Short', range: '< 30 min', color: '#34d399', count: 0, percentage: 0, events: [] },
      { key: 'medium', label: 'Medium', range: '30-60 min', color: '#38bdf8', count: 0, percentage: 0, events: [] },
      { key: 'long', label: 'Long', range: '1-2 hrs', color: '#fbbf24', count: 0, percentage: 0, events: [] },
      { key: 'extended', label: 'Extended', range: '2+ hrs', color: '#fb7185', count: 0, percentage: 0, events: [] },
    ],
    focusTimeMetrics: {
      totalFocusBlocks: 0,
      averageFocusBlockLength: 0,
      longestFocusBlock: 0,
      focusTimePercentage: 0,
    },
    productivityMetrics: {
      productivityScore: 0,
      meetingLoad: 0,
      averageEventsPerDay: 0,
      mostProductiveDay: '-',
      leastProductiveDay: '-',
      peakHour: 9,
    },
    totalDays: 0,
    daysWithEvents: 0,
    eventFreeDays: 0,
    longestEvent: 0,
    shortestEvent: 0,
    recurringEventsCount: 0,
    allDayEventsCount: 0,
  }
}

function getTimeOfDayCategory(hour: number): keyof TimeOfDayDistribution {
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

function getDurationCategory(minutes: number): keyof EventDurationBreakdown {
  if (minutes < 30) return 'short'
  if (minutes < 60) return 'medium'
  if (minutes < 120) return 'long'
  return 'extended'
}

function calculateProductivityScore(
  meetingLoad: number,
  focusTimePercentage: number,
  eventDistribution: number
): number {
  const meetingBalance = meetingLoad > 60 ? Math.max(0, 100 - (meetingLoad - 40)) : 100
  const focusScore = focusTimePercentage * 100
  const distributionScore = eventDistribution * 100

  return Math.round((meetingBalance * 0.4 + focusScore * 0.35 + distributionScore * 0.25))
}

export function useAnalyticsData({ timeMin, timeMax, calendarMap, enabled = true }: UseAnalyticsDataOptions) {
  const analyticsQuery = useQuery({
    queryKey: ['events-analytics', timeMin, timeMax],
    queryFn: async (): Promise<AnalyticsResponse | null> => {
      if (!timeMin || !timeMax) return null

      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
      })

      const response = await apiClient.get(`${ENDPOINTS.EVENTS_ANALYTICS}?${params.toString()}`)

      if (response.data?.status && response.data?.message) {
        if (response.data.status === 'success') {
          toast.success(response.data.message)
        } else {
          toast.error(response.data.message)
        }
      }

      const result = AnalyticsResponseSchema.safeParse(response.data)
      if (!result.success) {
        if (response.data?.allEvents && Array.isArray(response.data.allEvents)) {
          const normalizedData = {
            status: response.data.status || 'success',
            message: response.data.message || 'Events retrieved',
            data: {
              allEvents: response.data.allEvents,
            },
          }
          const retryResult = AnalyticsResponseSchema.safeParse(normalizedData)
          if (retryResult.success) {
            return retryResult.data
          }
        }

        throw new Error(`Invalid API response format: ${result.error.message}`)
      }

      return result.data
    },
    enabled: enabled && !!timeMin && !!timeMax,
    retry: false,
  })

  const processData = React.useCallback(
    (data: AnalyticsResponse | null | undefined): EnhancedAnalyticsData => {
      if (!data?.data?.allEvents || !Array.isArray(data.data.allEvents)) {
        return getEmptyEnhancedData()
      }

      let totalEvents = 0
      let totalDurationMinutes = 0
      let recurringEventsCount = 0
      let allDayEventsCount = 0
      let longestEventMinutes = 0
      let shortestEventMinutes = Infinity

      const calendarDurationMap = new Map<string, { minutes: number; calendarId: string }>()
      const recentActivities: ProcessedActivity[] = []
      const dayHoursMap = new Map<string, number>()
      const dayEventsMap = new Map<string, number>()

      const weeklyHours = new Array(7).fill(0)
      const weeklyEventCounts = new Array(7).fill(0)
      const weeklyEvents: PatternEventSummary[][] = Array.from({ length: 7 }, () => [])
      const monthlyHours = new Array(31).fill(0)
      const monthlyEventCounts = new Array(31).fill(0)
      const monthlyEvents: PatternEventSummary[][] = Array.from({ length: 31 }, () => [])
      const hourlyDistribution = new Array(24).fill(0)
      const durationEvents: Record<keyof EventDurationBreakdown, PatternEventSummary[]> = {
        short: [],
        medium: [],
        long: [],
        extended: [],
      }

      const timeOfDay: TimeOfDayDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 }
      const durationBreakdown: EventDurationBreakdown = { short: 0, medium: 0, long: 0, extended: 0 }

      const defaultColors = ['#f26306', '#1489b4', '#2d9663', '#6366f1', '#64748b', '#e11d48']

      data.data.allEvents.forEach((calendarGroup) => {
        if (!calendarGroup?.calendarId || !Array.isArray(calendarGroup.events)) return

        const calendarInfo = calendarMap.get(calendarGroup.calendarId)
        let calendarName: string
        if (calendarInfo?.name) {
          calendarName = calendarInfo.name
        } else if (calendarGroup.calendarId.includes('@')) {
          calendarName = calendarGroup.calendarId.split('@')[0]
        } else if (calendarGroup.calendarId.length > 20) {
          calendarName = `Calendar ${calendarGroup.calendarId.slice(0, 8)}...`
        } else {
          calendarName = calendarGroup.calendarId
        }
        const calendarColor = calendarInfo?.color || '#6366f1'

        calendarGroup.events.forEach((event) => {
          if (!event?.start || !event?.end) return

          totalEvents++

          if (event.recurringEventId) {
            recurringEventsCount++
          }

          if (event.start.date && !event.start.dateTime) {
            allDayEventsCount++
            return
          }

          if (event.start.dateTime && event.end.dateTime) {
            const start = new Date(event.start.dateTime)
            const end = new Date(event.end.dateTime)
            const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)

            if (durationMinutes > 0) {
              totalDurationMinutes += durationMinutes
              longestEventMinutes = Math.max(longestEventMinutes, durationMinutes)
              if (shortestEventMinutes === Infinity || durationMinutes < shortestEventMinutes) {
                shortestEventMinutes = durationMinutes
              }
            }

            const dayKey = start.toISOString().split('T')[0]
            const hours = durationMinutes / 60
            dayHoursMap.set(dayKey, (dayHoursMap.get(dayKey) || 0) + hours)
            dayEventsMap.set(dayKey, (dayEventsMap.get(dayKey) || 0) + 1)

            const eventSummary: PatternEventSummary = {
              id: event.id,
              summary: event.summary || 'No Title',
              startTime: event.start.dateTime,
              endTime: event.end.dateTime,
              eventDate: dayKey,
              durationMinutes,
              calendarName,
              calendarColor,
              htmlLink: event.htmlLink,
            }

            const dayOfWeek = start.getDay()
            weeklyHours[dayOfWeek] += hours
            weeklyEventCounts[dayOfWeek]++
            weeklyEvents[dayOfWeek].push(eventSummary)

            const dayOfMonth = start.getDate()
            monthlyHours[dayOfMonth - 1] += hours
            monthlyEventCounts[dayOfMonth - 1]++
            monthlyEvents[dayOfMonth - 1].push(eventSummary)

            const startHour = start.getHours()
            hourlyDistribution[startHour]++

            const timeCategory = getTimeOfDayCategory(startHour)
            timeOfDay[timeCategory]++

            const durationCategory = getDurationCategory(durationMinutes)
            durationBreakdown[durationCategory]++
            durationEvents[durationCategory].push(eventSummary)

            const existing = calendarDurationMap.get(calendarName)
            if (existing) {
              existing.minutes += durationMinutes
            } else {
              calendarDurationMap.set(calendarName, {
                minutes: durationMinutes,
                calendarId: calendarGroup.calendarId,
              })
            }

            recentActivities.push({
              action: event.summary || 'No Title',
              time: start.toLocaleDateString(),
              icon: CalendarDays,
              timestamp: start.getTime(),
              calendarName,
              calendarId: calendarGroup.calendarId,
              calendarColor,
              event: event as CalendarEvent,
            })
          }
        })
      })

      recentActivities.sort((a, b) => b.timestamp - a.timestamp)

      const calendarBreakdown: CalendarBreakdownItem[] = Array.from(calendarDurationMap.entries())
        .map(([name, calData], index) => {
          const calInfo = calendarMap.get(calData.calendarId)
          let color = calInfo?.color || defaultColors[index % defaultColors.length]

          if (!color || typeof color !== 'string' || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
            color = defaultColors[index % defaultColors.length]
          }

          return {
            category: name,
            hours: Math.round((calData.minutes / 60) * 10) / 10,
            color,
            calendarId: calData.calendarId,
          }
        })
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5)

      const totalDurationHours = Math.round((totalDurationMinutes / 60) * 10) / 10
      const averageEventDuration = totalEvents > 0 ? Math.round((totalDurationHours / totalEvents) * 100) / 100 : 0
      const busiestDayHours = Math.max(...Array.from(dayHoursMap.values()), 0)

      const dailyAvailableHours: DailyAvailableHoursDataPoint[] = Array.from(dayHoursMap.entries())
        .map(([dateStr, eventHours], index) => ({
          day: index + 1,
          date: dateStr,
          hours: Math.max(0, Math.round((WAKING_HOURS_PER_DAY - eventHours) * 10) / 10),
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item, index) => ({ ...item, day: index + 1 }))

      const weeklyPattern: WeeklyPatternDataPoint[] = DAY_NAMES.map((day, index) => ({
        day,
        dayShort: DAY_NAMES_SHORT[index],
        dayIndex: index,
        hours: Math.round(weeklyHours[index] * 10) / 10,
        eventCount: weeklyEventCounts[index],
        events: weeklyEvents[index],
      }))

      const monthlyPattern: MonthlyPatternDataPoint[] = Array.from({ length: 31 }, (_, index) => ({
        dayOfMonth: index + 1,
        hours: Math.round(monthlyHours[index] * 10) / 10,
        eventCount: monthlyEventCounts[index],
        events: monthlyEvents[index],
      }))

      const totalDays = timeMin && timeMax ? Math.ceil((timeMax.getTime() - timeMin.getTime()) / (1000 * 60 * 60 * 24)) : 0
      const daysWithEvents = dayHoursMap.size
      const eventFreeDays = Math.max(0, totalDays - daysWithEvents)

      const sortedDays = Array.from(dayHoursMap.entries()).sort((a, b) => b[1] - a[1])
      const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution))

      let focusBlocks = 0
      let totalFocusMinutes = 0
      let longestFocusBlock = 0

      const sortedDayEntries = Array.from(dayHoursMap.entries()).sort(
        (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
      )

      sortedDayEntries.forEach(([, eventHours]) => {
        const freeHours = WAKING_HOURS_PER_DAY - eventHours
        if (freeHours >= 2) {
          focusBlocks++
          totalFocusMinutes += freeHours * 60
          longestFocusBlock = Math.max(longestFocusBlock, freeHours)
        }
      })

      const totalWakingMinutes = totalDays * WAKING_HOURS_PER_DAY * 60
      const focusTimePercentage = totalWakingMinutes > 0 ? totalFocusMinutes / totalWakingMinutes : 0

      const focusTimeMetrics: FocusTimeMetrics = {
        totalFocusBlocks: focusBlocks,
        averageFocusBlockLength: focusBlocks > 0 ? Math.round((totalFocusMinutes / focusBlocks / 60) * 10) / 10 : 0,
        longestFocusBlock: Math.round(longestFocusBlock * 10) / 10,
        focusTimePercentage: Math.round(focusTimePercentage * 100),
      }

      const meetingLoad = totalWakingMinutes > 0 ? (totalDurationMinutes / totalWakingMinutes) * 100 : 0

      const eventDistribution = totalEvents > 0 ? Math.min(1, daysWithEvents / Math.max(1, totalDays)) : 0

      const productivityScore = calculateProductivityScore(meetingLoad, focusTimePercentage, eventDistribution)

      const productivityMetrics: ProductivityMetrics = {
        productivityScore,
        meetingLoad: Math.round(meetingLoad * 10) / 10,
        averageEventsPerDay: totalDays > 0 ? Math.round((totalEvents / totalDays) * 10) / 10 : 0,
        mostProductiveDay: sortedDays.length > 0 ? new Date(sortedDays[0][0]).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : '-',
        leastProductiveDay: sortedDays.length > 0 ? new Date(sortedDays.at(-1)![0]).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : '-',
        peakHour,
      }

      const eventDurationCategories: EventDurationCategory[] = [
        { key: 'short', label: 'Short', range: '< 30 min', color: '#34d399', count: durationBreakdown.short, percentage: totalEvents > 0 ? (durationBreakdown.short / totalEvents) * 100 : 0, events: durationEvents.short },
        { key: 'medium', label: 'Medium', range: '30-60 min', color: '#38bdf8', count: durationBreakdown.medium, percentage: totalEvents > 0 ? (durationBreakdown.medium / totalEvents) * 100 : 0, events: durationEvents.medium },
        { key: 'long', label: 'Long', range: '1-2 hrs', color: '#fbbf24', count: durationBreakdown.long, percentage: totalEvents > 0 ? (durationBreakdown.long / totalEvents) * 100 : 0, events: durationEvents.long },
        { key: 'extended', label: 'Extended', range: '2+ hrs', color: '#fb7185', count: durationBreakdown.extended, percentage: totalEvents > 0 ? (durationBreakdown.extended / totalEvents) * 100 : 0, events: durationEvents.extended },
      ]

      return {
        totalEvents,
        totalDurationHours,
        averageEventDuration,
        busiestDayHours: Math.round(busiestDayHours * 10) / 10,
        calendarBreakdown,
        recentActivities: recentActivities.slice(0, 5),
        dailyAvailableHours,
        weeklyPattern,
        monthlyPattern,
        timeOfDayDistribution: timeOfDay,
        eventDurationBreakdown: durationBreakdown,
        eventDurationCategories,
        focusTimeMetrics,
        productivityMetrics,
        totalDays,
        daysWithEvents,
        eventFreeDays,
        longestEvent: Math.round((longestEventMinutes / 60) * 10) / 10,
        shortestEvent: shortestEventMinutes === Infinity ? 0 : Math.round((shortestEventMinutes / 60) * 10) / 10,
        recurringEventsCount,
        allDayEventsCount,
      }
    },
    [calendarMap, timeMin, timeMax]
  )

  const processedData = React.useMemo(() => {
    try {
      return processData(analyticsQuery.data ?? null)
    } catch (error) {
      console.error('Error processing analytics data:', error)
      toast.error('Failed to process analytics data. Please refresh the page.')
      return getEmptyEnhancedData()
    }
  }, [analyticsQuery.data, processData])

  const currentMetrics: PeriodMetrics | null = React.useMemo(() => {
    if (!analyticsQuery.data) return null
    return {
      totalEvents: processedData.totalEvents,
      totalDurationHours: processedData.totalDurationHours,
      averageEventDuration: processedData.averageEventDuration,
      busiestDayHours: processedData.busiestDayHours,
    }
  }, [analyticsQuery.data, processedData])

  const comparisonQuery = useAnalyticsComparison({
    timeMin,
    timeMax,
    currentMetrics,
    enabled: enabled && !!timeMin && !!timeMax && !!currentMetrics,
  })

  return {
    data: processedData,
    rawData: analyticsQuery.data,
    comparison: comparisonQuery.data ?? null,
    isLoading: analyticsQuery.isLoading || comparisonQuery.isLoading,
    isFetching: analyticsQuery.isFetching || comparisonQuery.isFetching,
    isError: analyticsQuery.isError || comparisonQuery.isError,
    error: analyticsQuery.error || comparisonQuery.error,
    refetch: () => {
      analyticsQuery.refetch()
      comparisonQuery.refetch()
    },
  }
}
