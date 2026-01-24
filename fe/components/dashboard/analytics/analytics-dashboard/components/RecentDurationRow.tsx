'use client'

import React from 'react'
import { Clock, Calendar, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EnhancedAnalyticsData, ProcessedActivity } from '@/types/analytics'

interface RecentDurationRowProps {
  data: EnhancedAnalyticsData
  activities: ProcessedActivity[]
  onActivityClick?: (activity: ProcessedActivity) => void
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
      <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-1 animate-pulse rounded bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
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
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h4 className="text-base font-semibold text-foreground">Recent Events</h4>
      </div>

      <div className="flex flex-col gap-3">
        {recentEvents.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No recent events</p>
        ) : (
          recentEvents.map((activity, index) => {
            const eventTitle = activity.event?.summary || activity.action || 'Untitled Event'
            const eventId = activity.event?.id || `activity-${index}`

            return (
              <button
                key={eventId}
                onClick={() => onActivityClick?.(activity)}
                className="flex items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
              >
                <div
                  className={cn('mt-1 h-10 w-1 rounded-full', getEventColor(index, activity.calendarColor))}
                  style={activity.calendarColor ? { backgroundColor: activity.calendarColor } : undefined}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">{eventTitle}</span>
                    <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                  {activity.calendarName && (
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">{activity.calendarName}</span>
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

function EventDurationCard({ data, isLoading }: { data: EnhancedAnalyticsData; isLoading?: boolean }) {
  const { eventDurationCategories, totalEvents } = data

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-2 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...eventDurationCategories.map((c) => c.count), 1)

  return (
    <div className="flex flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h4 className="text-base font-semibold text-foreground">Event Duration</h4>
      </div>

      <div className="flex flex-col gap-4">
        {eventDurationCategories.map((category) => (
          <div key={category.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                <span className="text-sm text-muted-foreground">{category.label}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">{category.percentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  backgroundColor: category.color,
                  width: `${(category.count / maxCount) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RecentDurationRow({ data, activities, onActivityClick, isLoading }: RecentDurationRowProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <RecentEventsCard activities={activities} onActivityClick={onActivityClick} isLoading={isLoading} />
      <EventDurationCard data={data} isLoading={isLoading} />
    </div>
  )
}
