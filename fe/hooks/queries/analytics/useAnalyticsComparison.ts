'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { AnalyticsResponseSchema, type ComparisonResult, type PeriodMetrics } from '@/types/analytics'
import { toast } from 'sonner'

interface UseAnalyticsComparisonOptions {
  timeMin: Date | null
  timeMax: Date | null
  enabled?: boolean
}

/**
 * Hook to fetch analytics data for the previous period and calculate trends
 */
export function useAnalyticsComparison({ timeMin, timeMax, enabled = true }: UseAnalyticsComparisonOptions) {
  return useQuery({
    queryKey: ['analytics-comparison', timeMin, timeMax],
    queryFn: async (): Promise<ComparisonResult | null> => {
      if (!timeMin || !timeMax) return null

      // Calculate previous period: same duration before current period
      const duration = timeMax.getTime() - timeMin.getTime()
      const previousTimeMax = new Date(timeMin.getTime() - 1) // 1ms before current period starts
      const previousTimeMin = new Date(previousTimeMax.getTime() - duration)

      // Fetch current period data
      const currentParams = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
      })
      const currentResponse = await apiClient.get(`${ENDPOINTS.EVENTS_ANALYTICS}?${currentParams.toString()}`)
      const currentResult = AnalyticsResponseSchema.safeParse(currentResponse.data)
      if (!currentResult.success) {
        throw new Error(`Invalid current period response: ${currentResult.error.message}`)
      }

      // Fetch previous period data
      const previousParams = new URLSearchParams({
        timeMin: previousTimeMin.toISOString(),
        timeMax: previousTimeMax.toISOString(),
      })
      const previousResponse = await apiClient.get(`${ENDPOINTS.EVENTS_ANALYTICS}?${previousParams.toString()}`)
      const previousResult = AnalyticsResponseSchema.safeParse(previousResponse.data)
      if (!previousResult.success) {
        throw new Error(`Invalid previous period response: ${previousResult.error.message}`)
      }

      // Process both periods to calculate metrics
      const calculateMetrics = (data: typeof currentResult.data): PeriodMetrics => {
        let totalEvents = 0
        let totalDurationMinutes = 0
        const dayHoursMap = new Map<string, number>()

        if (!data.data?.allEvents) {
          return {
            totalEvents: 0,
            totalDurationHours: 0,
            averageEventDuration: 0,
            busiestDayHours: 0,
          }
        }

        data.data.allEvents.forEach((calendarGroup) => {
          if (!calendarGroup?.events || !Array.isArray(calendarGroup.events)) return

          calendarGroup.events.forEach((event) => {
            if (!event?.start || !event?.end) return

            totalEvents++

            if (event.start.dateTime && event.end.dateTime) {
              const start = new Date(event.start.dateTime)
              const end = new Date(event.end.dateTime)
              const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
              totalDurationMinutes += durationMinutes

              // Track hours per day
              const dayKey = start.toISOString().split('T')[0]
              const hours = durationMinutes / 60
              dayHoursMap.set(dayKey, (dayHoursMap.get(dayKey) || 0) + hours)
            }
          })
        })

        const totalDurationHours = Math.round((totalDurationMinutes / 60) * 10) / 10
        const averageEventDuration = totalEvents > 0 ? totalDurationHours / totalEvents : 0
        const busiestDayHours = Math.max(...Array.from(dayHoursMap.values()), 0)

        return {
          totalEvents,
          totalDurationHours,
          averageEventDuration,
          busiestDayHours,
        }
      }

      const currentMetrics = calculateMetrics(currentResult.data)
      const previousMetrics = calculateMetrics(previousResult.data)

      // Calculate trends
      const calculateTrend = (
        current: number,
        previous: number,
      ): { value: number; previousValue: number; percentageChange: number; direction: 'up' | 'down' | 'neutral' } => {
        if (previous === 0) {
          // If previous is 0 and current > 0, show +100%
          if (current > 0) {
            return {
              value: current,
              previousValue: 0,
              percentageChange: 100,
              direction: 'up',
            }
          }
          return {
            value: 0,
            previousValue: 0,
            percentageChange: 0,
            direction: 'neutral',
          }
        }

        const percentageChange = ((current - previous) / previous) * 100
        return {
          value: current,
          previousValue: previous,
          percentageChange: Math.round(percentageChange * 10) / 10,
          direction: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral',
        }
      }

      return {
        current: currentMetrics,
        previous: previousMetrics,
        trends: {
          totalEvents: calculateTrend(currentMetrics.totalEvents, previousMetrics.totalEvents),
          totalDuration: calculateTrend(currentMetrics.totalDurationHours, previousMetrics.totalDurationHours),
          avgEventDuration: calculateTrend(currentMetrics.averageEventDuration, previousMetrics.averageEventDuration),
          busiestDay: calculateTrend(currentMetrics.busiestDayHours, previousMetrics.busiestDayHours),
        },
      }
    },
    enabled: enabled && !!timeMin && !!timeMax,
    retry: false,
  })
}
