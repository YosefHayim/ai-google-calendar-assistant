'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Info, ListChecks } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ProcessedActivity } from '@/types/analytics'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface RecentEventsProps {
  activities: ProcessedActivity[]
  onActivityClick: (activity: ProcessedActivity) => void
  isLoading?: boolean
  layout?: 'vertical' | 'horizontal'
}

const RecentEvents: React.FC<RecentEventsProps> = ({
  activities,
  onActivityClick,
  isLoading = false,
  layout = 'vertical',
}) => {
  const isHorizontal = layout === 'horizontal'
  const displayActivities = isHorizontal ? activities.slice(0, 5) : activities

  if (isLoading) {
    return (
      <div className="flex-1 rounded-md bg-background bg-secondary p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2 sm:mb-6">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-28 sm:h-5 sm:w-32" />
        </div>
        <div
          className={
            isHorizontal ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5' : 'space-y-2'
          }
        >
          {Array.from({ length: isHorizontal ? 5 : 5 }).map((_, i) => (
            <div
              key={i}
              className={isHorizontal ? 'flex flex-col gap-2 rounded-lg p-3' : '-m-2 flex items-start gap-3 p-2'}
            >
              <Skeleton className="h-8 w-8 flex-shrink-0 rounded-md" />
              <div className="min-w-0 flex-1">
                <Skeleton className="mb-1 h-4 w-full" />
                <Skeleton className="h-3 w-14 sm:w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 rounded-md bg-background bg-secondary p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground sm:text-base">
          <ListChecks className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <span className="truncate">{isHorizontal ? '5' : activities?.length} Recent Events</span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-muted-foreground"
              >
                <Info size={16} />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Recent Events</h4>
                <p className="text-xs text-muted-foreground">
                  A real-time feed of your most recent calendar events and activities. Click on any item to view
                  detailed information about the event.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </h3>
      </div>
      {displayActivities.length > 0 ? (
        <div
          className={
            isHorizontal ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5' : 'space-y-2'
          }
        >
          {displayActivities.map((activity, i) => {
            const Icon = activity.icon
            return isHorizontal ? (
              <div
                key={i}
                className="group flex cursor-pointer flex-col gap-2 rounded-lg p-3 transition-colors hover:border-muted hover:bg-muted hover:bg-secondary/50 sm:gap-3 sm:p-4"
                data-calendar-id={activity.calendarId || ''}
                onClick={() => onActivityClick(activity)}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-opacity group-hover:opacity-80 sm:h-10 sm:w-10"
                    style={{ backgroundColor: `${activity.calendarColor || '#6366f1'}20` }}
                  >
                    <span className="sm:hidden">
                      <Icon size={16} style={{ color: activity.calendarColor || '#6366f1' }} />
                    </span>
                    <span className="hidden sm:block">
                      <Icon size={18} style={{ color: activity.calendarColor || '#6366f1' }} />
                    </span>
                  </div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground sm:text-xs">{activity.time}</p>
                </div>
                <p className="line-clamp-2 text-xs font-semibold text-foreground text-muted-foreground sm:text-sm">
                  {activity.action}
                </p>
                {activity.calendarName && (
                  <span
                    className="max-w-full self-start truncate rounded border px-1.5 py-0.5 text-[10px] font-bold sm:px-2 sm:py-1 sm:text-xs"
                    style={{
                      color: activity.calendarColor || '#6366f1',
                      borderColor: activity.calendarColor || '#6366f1',
                      backgroundColor: `${activity.calendarColor || '#6366f1'}15`,
                    }}
                  >
                    {activity.calendarName}
                  </span>
                )}
              </div>
            ) : (
              <div
                key={i}
                className="group -m-2 flex cursor-pointer items-start gap-3 rounded-md border-transparent p-2 transition-colors hover:border hover:border-black hover:bg-muted hover:bg-secondary/50"
                data-calendar-id={activity.calendarId || ''}
                onClick={() => onActivityClick(activity)}
              >
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-opacity group-hover:opacity-80"
                  style={{ backgroundColor: activity.calendarColor || '#6366f1', opacity: 0.2 }}
                >
                  <Icon size={16} style={{ color: activity.calendarColor || '#6366f1' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-foreground text-muted-foreground">
                    {activity.action}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-xs font-bold uppercase text-muted-foreground">{activity.time}</p>
                    {activity.calendarName && (
                      <span
                        className="rounded border px-1.5 py-0.5 text-xs font-bold"
                        style={{
                          color: activity.calendarColor || '#6366f1',
                          borderColor: activity.calendarColor || '#6366f1',
                          backgroundColor: `${activity.calendarColor || '#6366f1'}15`,
                        }}
                      >
                        {activity.calendarName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No recent activities found for this period.</p>
      )}
    </div>
  )
}

export default RecentEvents
