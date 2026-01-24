'use client'

import { Calendar, ChevronRight, Clock } from 'lucide-react'

import type { EnhancedAnalyticsData } from '@/types/analytics'
import React from 'react'
import type { UpcomingWeekData } from '@/hooks/queries/analytics/useUpcomingWeekData'
import { cn } from '@/lib/utils'

interface TimeDistributionRowProps {
  data: EnhancedAnalyticsData
  upcomingWeekData?: UpcomingWeekData
  isLoading?: boolean
  isUpcomingWeekLoading?: boolean
}

const TIME_PERIODS = [
  { key: 'morning', label: 'Morning', timeRange: '6am-12pm', color: 'bg-amber-400' },
  { key: 'afternoon', label: 'Afternoon', timeRange: '12pm-5pm', color: 'bg-orange-500' },
  { key: 'evening', label: 'Evening', timeRange: '5pm-9pm', color: 'bg-purple-500' },
  { key: 'night', label: 'Night', timeRange: '9pm-6am', color: 'bg-indigo-600' },
]

function TimeOfDayDistribution({ data, isLoading }: { data: EnhancedAnalyticsData; isLoading?: boolean }) {
  const { timeOfDayDistribution, totalEvents } = data

  const getPercentage = (count: number) => {
    if (totalEvents === 0) return 0
    return Math.round((count / totalEvents) * 100)
  }

  const maxCount = Math.max(
    timeOfDayDistribution.morning,
    timeOfDayDistribution.afternoon,
    timeOfDayDistribution.evening,
    timeOfDayDistribution.night,
    1,
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="flex items-end justify-around gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-32 w-14 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-5 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h4 className="text-base font-semibold text-foreground">Time of Day Distribution</h4>
      </div>

      <div className="flex items-end justify-around gap-4">
        {TIME_PERIODS.map((period) => {
          const count = timeOfDayDistribution[period.key as keyof typeof timeOfDayDistribution]
          const height = maxCount > 0 ? (count / maxCount) * 140 : 20

          return (
            <div key={period.key} className="flex flex-col items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{getPercentage(count)}%</span>
              <div
                className={cn('w-14 rounded-t-lg transition-all', period.color)}
                style={{ height: Math.max(20, height) }}
              />
              <div className="text-center">
                <span className="block text-sm font-medium text-foreground">{period.label}</span>
                <span className="text-[10px] text-muted-foreground">{period.timeRange}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function UpcomingWeek({ data, isLoading }: { data?: UpcomingWeekData; isLoading?: boolean }) {
  // Map to only the properties we need to avoid accidentally rendering Date objects
  const weekData =
    data?.days && data.days.length > 0
      ? data.days.slice(0, 5).map((day) => ({
          dayName: day.dayName,
          dateStr: day.dateStr,
          eventCount: day.eventCount,
          totalHours: day.totalHours,
        }))
      : null

  console.log('weekData', weekData)

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-6 lg:w-[380px]">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!weekData) {
    return (
      <div className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-6 lg:w-[380px]">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h4 className="text-base font-semibold text-foreground">Upcoming Week</h4>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No upcoming events</p>
          <p className="text-xs text-muted-foreground/70">Your week preview will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-border bg-card p-6 lg:w-[380px]">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h4 className="text-base font-semibold text-foreground">Upcoming Week</h4>
      </div>

      <div className="flex flex-col gap-3">
        {weekData.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{day.dayName}</span>
              <span className="text-xs text-muted-foreground">{day.dateStr}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-sm font-semibold text-foreground">{day.eventCount}</span>
                <span className="text-xs text-muted-foreground"> event{day.eventCount !== 1 ? 's' : ''}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TimeDistributionRow({
  data,
  upcomingWeekData,
  isLoading,
  isUpcomingWeekLoading,
}: TimeDistributionRowProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <TimeOfDayDistribution data={data} isLoading={isLoading} />
      <UpcomingWeek data={upcomingWeekData} isLoading={isUpcomingWeekLoading} />
    </div>
  )
}
