'use client'

import { Calendar, ChevronRight, Clock } from 'lucide-react'

import type { EnhancedAnalyticsData, TimeOfDayCategory } from '@/types/analytics'
import React from 'react'
import type { UpcomingWeekData } from '@/hooks/queries/analytics/useUpcomingWeekData'
import { cn } from '@/lib/utils'

interface TimeDistributionRowProps {
  data: EnhancedAnalyticsData
  upcomingWeekData?: UpcomingWeekData
  isLoading?: boolean
  isUpcomingWeekLoading?: boolean
  onDayClick?: (dateKey: string, totalHours: number) => void
  onTimeOfDayClick?: (category: TimeOfDayCategory) => void
}

const TIME_PERIOD_COLORS: Record<string, string> = {
  morning: 'bg-amber-400',
  afternoon: 'bg-orange-500',
  evening: 'bg-purple-500',
  night: 'bg-indigo-600',
}

function TimeOfDayDistribution({
  data,
  isLoading,
  onTimeOfDayClick,
}: {
  data: EnhancedAnalyticsData
  isLoading?: boolean
  onTimeOfDayClick?: (category: TimeOfDayCategory) => void
}) {
  const { timeOfDayCategories } = data

  const maxCount = Math.max(...timeOfDayCategories.map((c) => c.count), 1)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:gap-5 sm:p-6">
        <div className="h-5 w-36 animate-pulse rounded bg-muted sm:w-40" />
        <div className="flex items-end justify-around gap-2 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 sm:gap-2">
              <div className="h-24 w-10 animate-pulse rounded bg-muted sm:h-32 sm:w-14" />
              <div className="h-3.5 w-12 animate-pulse rounded bg-muted sm:h-4 sm:w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:gap-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
        <h4 className="text-sm font-semibold text-foreground sm:text-base">Time of Day Distribution</h4>
      </div>

      <div className="flex items-end justify-around gap-2 sm:gap-4">
        {timeOfDayCategories.map((category) => {
          const height = maxCount > 0 ? (category.count / maxCount) * 140 : 20
          const colorClass = TIME_PERIOD_COLORS[category.key] || 'bg-gray-400'

          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onTimeOfDayClick?.(category)}
              className="flex flex-col items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-muted sm:gap-2"
            >
              <span className="text-xs font-semibold text-foreground sm:text-sm">
                {Math.round(category.percentage)}%
              </span>
              <div
                className={cn('w-10 rounded-t-lg transition-all sm:w-14', colorClass)}
                style={{ height: Math.max(16, height * 0.7), minHeight: 16 }}
              />
              <div className="text-center">
                <span className="block text-[10px] font-medium text-foreground sm:text-sm">{category.label}</span>
                <span className="hidden text-[10px] text-muted-foreground sm:block">{category.timeRange}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function UpcomingWeek({
  data,
  isLoading,
  onDayClick,
}: {
  data?: UpcomingWeekData
  isLoading?: boolean
  onDayClick?: (dateKey: string, totalHours: number) => void
}) {
  // Map to only the properties we need to avoid accidentally rendering Date objects
  const weekData =
    data?.days && data.days.length > 0
      ? data.days.slice(0, 5).map((day) => ({
          dayName: day.dayName,
          dateStr: day.dateStr,
          dateKey: day.dateKey,
          eventCount: day.eventCount,
          totalHours: day.totalHours,
        }))
      : null

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-6 lg:w-[380px]">
        <div className="h-5 w-28 animate-pulse rounded bg-muted sm:w-32" />
        <div className="space-y-2.5 sm:space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3.5 w-20 animate-pulse rounded bg-muted sm:h-4 sm:w-24" />
              <div className="h-3.5 w-14 animate-pulse rounded bg-muted sm:h-4 sm:w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!weekData) {
    return (
      <div className="flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-6 lg:w-[380px]">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
          <h4 className="text-sm font-semibold text-foreground sm:text-base">Upcoming Week</h4>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center sm:py-8">
          <Calendar className="mb-2 h-6 w-6 text-muted-foreground/50 sm:h-8 sm:w-8" />
          <p className="text-xs text-muted-foreground sm:text-sm">No upcoming events</p>
          <p className="text-[10px] text-muted-foreground/70 sm:text-xs">Your week preview will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-6 lg:w-[380px]">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
        <h4 className="text-sm font-semibold text-foreground sm:text-base">Upcoming Week</h4>
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-3">
        {weekData.map((day, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onDayClick?.(day.dateKey, day.totalHours)}
            className="flex w-full items-center justify-between rounded-lg p-1.5 text-left transition-colors hover:bg-muted sm:p-2"
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground sm:text-sm">{day.dayName}</span>
              <span className="text-[10px] text-muted-foreground sm:text-xs">{day.dateStr}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="text-right">
                <span className="text-xs font-semibold text-foreground sm:text-sm">{day.eventCount}</span>
                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  {' '}
                  event{day.eventCount !== 1 ? 's' : ''}
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
            </div>
          </button>
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
  onDayClick,
  onTimeOfDayClick,
}: TimeDistributionRowProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <TimeOfDayDistribution data={data} isLoading={isLoading} onTimeOfDayClick={onTimeOfDayClick} />
      <UpcomingWeek data={upcomingWeekData} isLoading={isUpcomingWeekLoading} onDayClick={onDayClick} />
    </div>
  )
}
