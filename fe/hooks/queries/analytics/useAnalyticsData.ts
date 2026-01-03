'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays } from 'lucide-react'
import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import {
  AnalyticsResponseSchema,
  type AnalyticsResponse,
  type ProcessedAnalyticsData,
  type CalendarBreakdownItem,
  type ProcessedActivity,
  type PeriodMetrics,
  type DailyAvailableHoursDataPoint,
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

/**
 * Main hook to fetch and process analytics data
 */
export function useAnalyticsData({ timeMin, timeMax, calendarMap, enabled = true }: UseAnalyticsDataOptions) {
  // Fetch analytics data
  const analyticsQuery = useQuery({
    queryKey: ['events-analytics', timeMin, timeMax],
    queryFn: async (): Promise<AnalyticsResponse | null> => {
      if (!timeMin || !timeMax) return null

      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
      })

      const response = await apiClient.get(`${ENDPOINTS.EVENTS_ANALYTICS}?${params.toString()}`)

      // Toast the status message
      if (response.data?.status && response.data?.message) {
        if (response.data.status === 'success') {
          toast.success(response.data.message)
        } else {
          toast.error(response.data.message)
        }
      }

      // Validate with Zod
      const result = AnalyticsResponseSchema.safeParse(response.data)
      if (!result.success) {
        // Try to handle case where response might be in a different format
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

  // Process data function
  const processData = (data: AnalyticsResponse | null | undefined): ProcessedAnalyticsData => {
    if (!data?.data?.allEvents || !Array.isArray(data.data.allEvents)) {
      return {
        totalEvents: 0,
        totalDurationHours: 0,
        averageEventDuration: 0,
        busiestDayHours: 0,
        calendarBreakdown: [],
        recentActivities: [],
        dailyAvailableHours: [],
      }
    }

    let totalEvents = 0
    let totalDurationMinutes = 0
    const calendarDurationMap = new Map<string, { minutes: number; calendarId: string }>()
    const recentActivities: ProcessedActivity[] = []
    const dayHoursMap = new Map<string, number>()

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

        if (event.start.dateTime && event.end.dateTime) {
          const start = new Date(event.start.dateTime)
          const end = new Date(event.end.dateTime)
          const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
          totalDurationMinutes += durationMinutes

          // Track hours per day for busiest day calculation
          const dayKey = start.toISOString().split('T')[0]
          const hours = durationMinutes / 60
          dayHoursMap.set(dayKey, (dayHoursMap.get(dayKey) || 0) + hours)

          const existing = calendarDurationMap.get(calendarName)
          if (existing) {
            existing.minutes += durationMinutes
          } else {
            calendarDurationMap.set(calendarName, { minutes: durationMinutes, calendarId: calendarGroup.calendarId })
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

    // Sort recent activities by time
    recentActivities.sort((a, b) => b.timestamp - a.timestamp)

    // Format calendar breakdown
    const defaultColors = ['#f26306', '#1489b4', '#2d9663', '#6366f1', '#64748b', '#e11d48']
    const calendarBreakdown: CalendarBreakdownItem[] = Array.from(calendarDurationMap.entries())
      .map(([calendarName, data], index) => {
        const calendarInfo = calendarMap.get(data.calendarId)
        let color = calendarInfo?.color || defaultColors[index % defaultColors.length]

        if (!color || typeof color !== 'string' || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
          color = defaultColors[index % defaultColors.length]
        }

        return {
          category: calendarName,
          hours: Math.round((data.minutes / 60) * 10) / 10,
          color,
          calendarId: data.calendarId,
        }
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)

    const totalDurationHours = Math.round((totalDurationMinutes / 60) * 10) / 10
    const averageEventDuration = totalEvents > 0 ? totalDurationHours / totalEvents : 0
    const busiestDayHours = Math.max(...Array.from(dayHoursMap.values()), 0)

    // Calculate daily available hours (16 waking hours - event hours per day)
    const WAKING_HOURS_PER_DAY = 16
    const dailyAvailableHours: DailyAvailableHoursDataPoint[] = Array.from(dayHoursMap.entries())
      .map(([dateStr, eventHours], index) => ({
        day: index + 1,
        date: dateStr,
        hours: Math.max(0, Math.round((WAKING_HOURS_PER_DAY - eventHours) * 10) / 10),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item, index) => ({ ...item, day: index + 1 }))

    return {
      totalEvents,
      totalDurationHours,
      averageEventDuration,
      busiestDayHours,
      calendarBreakdown,
      recentActivities: recentActivities.slice(0, 5),
      dailyAvailableHours,
    }
  }

  // Memoize processed data
  const processedData = React.useMemo(() => {
    try {
      return processData(analyticsQuery.data ?? null)
    } catch (error) {
      console.error('Error processing analytics data:', error)
      toast.error('Failed to process analytics data. Please refresh the page.')
      return {
        totalEvents: 0,
        totalDurationHours: 0,
        averageEventDuration: 0,
        busiestDayHours: 0,
        calendarBreakdown: [],
        recentActivities: [],
        dailyAvailableHours: [],
      }
    }
  }, [analyticsQuery.data, processData])

  // Extract current metrics for comparison hook
  const currentMetrics: PeriodMetrics | null = React.useMemo(() => {
    if (!analyticsQuery.data) return null
    return {
      totalEvents: processedData.totalEvents,
      totalDurationHours: processedData.totalDurationHours,
      averageEventDuration: processedData.averageEventDuration,
      busiestDayHours: processedData.busiestDayHours,
    }
  }, [analyticsQuery.data, processedData])

  // Fetch comparison data - only fetches previous period, uses currentMetrics for trends
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
