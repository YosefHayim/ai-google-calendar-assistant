'use client'

import React from 'react'
import { Clock, Calendar, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EnhancedAnalyticsData, ProcessedActivity, EventDurationCategory } from '@/types/analytics'

interface RecentDurationRowProps {
  data: EnhancedAnalyticsData
  activities: ProcessedActivity[]
  onActivityClick?: (activity: ProcessedActivity) => void
  onDurationCategoryClick?: (category: EventDurationCategory) => void
  isLoading?: boolean
}

function RecentEventsCard({
  activities,
  onActivityClick,
  isLoading,
}: {
  activities: ProcessedActivity[]
  onActivityClick?: (activity: ProcessedActivity) => void
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-6">
        <div className="h-5 w-28 animate-pulse rounded bg-muted sm:w-32" />
        <div className="space-y-2.5 sm:space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 sm:gap-3">
              <div className="h-8 w-1 animate-pulse rounded bg-muted sm:h-10" />
              <div className="flex-1 space-y-1 sm:space-y-1.5">
                <div className="h-3.5 w-32 animate-pulse rounded bg-muted sm:h-4 sm:w-40" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted sm:w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const recentEvents = activities.slice(0, 3)

  const getEventColor = (index: number, calendarColor?: string) => {
    if (calendarColor) return ''
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500']
    return colors[index % colors.length]
  }

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
        <h4 className="text-sm font-semibold text-foreground sm:text-base">Recent Events</h4>
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-3">
        {recentEvents.length === 0 ? (
          <p className="py-3 text-center text-xs text-muted-foreground sm:py-4 sm:text-sm">No recent events</p>
        ) : (
          recentEvents.map((activity, index) => {
            const eventTitle = activity.event?.summary || activity.action || 'Untitled Event'
            const eventId = activity.event?.id || `activity-${index}`

            return (
              <button
                key={eventId}
                onClick={() => onActivityClick?.(activity)}
                className="flex items-start gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-muted sm:gap-3 sm:p-2"
              >
                <div
                  className={cn(
                    'mt-0.5 h-8 w-1 rounded-full sm:mt-1 sm:h-10',
                    getEventColor(index, activity.calendarColor),
                  )}
                  style={activity.calendarColor ? { backgroundColor: activity.calendarColor } : undefined}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                    <span className="truncate text-xs font-medium text-foreground sm:text-sm">{eventTitle}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground sm:h-3.5 sm:w-3.5" />
                  </div>
                  <span className="text-[10px] text-muted-foreground sm:text-xs">{activity.time}</span>
                  {activity.calendarName && (
                    <span className="mt-0.5 block text-[9px] text-muted-foreground sm:text-[10px]">
                      {activity.calendarName}
                    </span>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

function EventDurationCard({
  data,
  isLoading,
  onCategoryClick,
}: {
  data: EnhancedAnalyticsData
  isLoading?: boolean
  onCategoryClick?: (category: EventDurationCategory) => void
}) {
  const { eventDurationCategories } = data

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-6">
        <div className="h-5 w-28 animate-pulse rounded bg-muted sm:w-32" />
        <div className="space-y-3 sm:space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between">
                <div className="h-3.5 w-20 animate-pulse rounded bg-muted sm:h-4 sm:w-24" />
                <div className="h-3.5 w-10 animate-pulse rounded bg-muted sm:h-4 sm:w-12" />
              </div>
              <div className="h-1.5 w-full animate-pulse rounded bg-muted sm:h-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...eventDurationCategories.map((c) => c.count), 1)

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:gap-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
        <h4 className="text-sm font-semibold text-foreground sm:text-base">Event Duration</h4>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        {eventDurationCategories.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => onCategoryClick?.(category)}
            className="w-full space-y-1 rounded-lg p-1.5 text-left transition-colors hover:bg-muted sm:space-y-1.5 sm:p-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3" style={{ backgroundColor: category.color }} />
                <span className="text-xs text-muted-foreground sm:text-sm">{category.label}</span>
              </div>
              <span className="text-xs font-semibold text-foreground sm:text-sm">
                {Math.round(category.percentage)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-secondary sm:h-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  backgroundColor: category.color,
                  width: `${(category.count / maxCount) * 100}%`,
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function RecentDurationRow({
  data,
  activities,
  onActivityClick,
  onDurationCategoryClick,
  isLoading,
}: RecentDurationRowProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <RecentEventsCard activities={activities} onActivityClick={onActivityClick} isLoading={isLoading} />
      <EventDurationCard data={data} isLoading={isLoading} onCategoryClick={onDurationCategoryClick} />
    </div>
  )
}
