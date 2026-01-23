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
      <div className="bg-background dark:bg-secondary rounded-md shadow-sm p-4 sm:p-6 flex-1">
        <div className="mb-4 sm:mb-6 flex items-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
        </div>
        <div
          className={
            isHorizontal ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4' : 'space-y-2'
          }
        >
          {Array.from({ length: isHorizontal ? 5 : 5 }).map((_, i) => (
            <div
              key={i}
              className={isHorizontal ? 'flex flex-col gap-2 p-3 rounded-lg' : 'flex items-start gap-3 p-2 -m-2'}
            >
              <Skeleton className="w-8 h-8 rounded-md flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-14 sm:w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background dark:bg-secondary rounded-md shadow-sm p-4 sm:p-6 flex-1">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-primary-foreground flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{isHorizontal ? '5' : activities?.length} Recent Events</span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground flex-shrink-0"
              >
                <Info size={16} />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Recent Events</h4>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
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
            isHorizontal ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4' : 'space-y-2'
          }
        >
          {displayActivities.map((activity, i) => {
            const Icon = activity.icon
            return isHorizontal ? (
              <div
                key={i}
                className="hover:border-muted dark:hover:border-muted flex flex-col gap-2 sm:gap-3 group cursor-pointer hover:bg-muted dark:hover:bg-secondary/50 rounded-lg p-3 sm:p-4 transition-colors"
                data-calendar-id={activity.calendarId || ''}
                onClick={() => onActivityClick(activity)}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg group-hover:opacity-80 transition-opacity flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${activity.calendarColor || '#6366f1'}20` }}
                  >
                    <span className="sm:hidden">
                      <Icon size={16} style={{ color: activity.calendarColor || '#6366f1' }} />
                    </span>
                    <span className="hidden sm:block">
                      <Icon size={18} style={{ color: activity.calendarColor || '#6366f1' }} />
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase">{activity.time}</p>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-foreground dark:text-muted-foreground line-clamp-2">
                  {activity.action}
                </p>
                {activity.calendarName && (
                  <span
                    className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border self-start truncate max-w-full"
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
                className="border-transparent hover:border-black hover:border flex items-start gap-3 group cursor-pointer hover:bg-muted dark:hover:bg-secondary/50 rounded-md p-2 -m-2 transition-colors"
                data-calendar-id={activity.calendarId || ''}
                onClick={() => onActivityClick(activity)}
              >
                <div
                  className="w-8 h-8 rounded-md group-hover:opacity-80 transition-opacity flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: activity.calendarColor || '#6366f1', opacity: 0.2 }}
                >
                  <Icon size={16} style={{ color: activity.calendarColor || '#6366f1' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground dark:text-muted-foreground line-clamp-1">
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground font-bold uppercase">{activity.time}</p>
                    {activity.calendarName && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded border"
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
