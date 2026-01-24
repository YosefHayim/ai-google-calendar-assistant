'use client'

import { AlertCircle, CalendarDays, Clock, Repeat } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { UpcomingDayData, UpcomingWeekData } from '@/hooks/queries/analytics/useUpcomingWeekData'

import { Button } from '@/components/ui/button'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusDot } from '@/components/ui/status-dot'
import { format } from 'date-fns'

interface UpcomingWeekPreviewProps {
  data: UpcomingWeekData | undefined
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

const BUSYNESS_COLORS = {
  free: 'bg-secondary',
  light: 'bg-emerald-900/40',
  moderate: 'bg-sky-900/40',
  busy: 'bg-primary/10',
  packed: 'bg-rose-900/40',
}

const BUSYNESS_BORDER_COLORS = {
  free: 'border-border',
  light: 'border-emerald-300 -emerald-800',
  moderate: 'border-sky-300 -sky-800',
  busy: 'border-primary/30',
  packed: 'border-rose-300 -rose-800',
}

const BUSYNESS_TEXT = {
  free: 'Free',
  light: 'Light',
  moderate: 'Moderate',
  busy: 'Busy',
  packed: 'Packed',
}

const DayCard: React.FC<{ day: UpcomingDayData }> = ({ day }) => {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div
          className={`relative flex cursor-pointer flex-col items-center rounded-lg border p-1.5 transition-all duration-200 hover:scale-105 hover:shadow-md sm:p-2 ${BUSYNESS_COLORS[day.busynessLevel]} ${BUSYNESS_BORDER_COLORS[day.busynessLevel]} ${day.isToday ? 'ring-2 ring-indigo-500 ring-offset-1 sm:ring-offset-2' : ''} `}
        >
          {day.isToday && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded bg-background bg-secondary px-0.5 text-[8px] font-bold text-indigo-400 sm:-top-2 sm:px-1 sm:text-[10px]">
              TODAY
            </span>
          )}
          {day.isTomorrow && !day.isToday && (
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded bg-background bg-secondary px-0.5 text-[8px] font-medium text-muted-foreground sm:-top-2 sm:px-1 sm:text-[10px]">
              TMR
            </span>
          )}

          <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">{day.dayShort}</span>
          <span className="text-base font-bold text-foreground sm:text-lg">
            {format(day.date instanceof Date ? day.date : new Date(day.date), 'd')}
          </span>

          {/* Busyness indicator */}
          <div className="mt-0.5 flex gap-0.5 sm:mt-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-1 w-1 rounded-full transition-colors sm:h-1.5 sm:w-1.5 ${
                  level <=
                  (day.busynessLevel === 'free'
                    ? 0
                    : day.busynessLevel === 'light'
                      ? 1
                      : day.busynessLevel === 'moderate'
                        ? 2
                        : day.busynessLevel === 'busy'
                          ? 3
                          : 5)
                    ? day.busynessLevel === 'packed'
                      ? 'bg-rose-500'
                      : day.busynessLevel === 'busy'
                        ? 'bg-primary'
                        : day.busynessLevel === 'moderate'
                          ? 'bg-sky-500'
                          : 'bg-emerald-500'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <span className="mt-0.5 max-w-full truncate text-[8px] text-muted-foreground sm:mt-1 sm:text-[10px]">
            {day.eventCount} {day.eventCount === 1 ? 'evt' : 'evts'}
          </span>
        </div>
      </HoverCardTrigger>

      <HoverCardContent className="w-72 p-0" side="bottom" align="center">
        <div className="border border-b p-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-foreground">{day.dayName}</h4>
            <span className={`rounded-full px-2 py-0.5 text-xs ${BUSYNESS_COLORS[day.busynessLevel]} font-medium`}>
              {BUSYNESS_TEXT[day.busynessLevel]}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {day.eventCount} events • {day.totalHours} hours scheduled
          </p>
        </div>

        {day.events.length > 0 ? (
          <div className="max-h-48 overflow-y-auto">
            <div className="space-y-1 p-2">
              {day.events.slice(0, 5).map((event, idx) => (
                <div
                  key={`${event.id}-${idx}`}
                  className="flex items-start gap-2 rounded-md p-2 hover:bg-muted hover:bg-secondary/50"
                >
                  <div
                    className="h-full min-h-[2rem] w-1 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: event.calendarColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="flex-1 truncate text-sm font-medium text-foreground">{event.summary}</p>
                      {event.isRecurring && (
                        <span title="Recurring event">
                          <Repeat className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {event.isAllDay
                        ? 'All day'
                        : `${format(new Date(event.startTime), 'h:mm a')} • ${Math.round(event.durationMinutes)} min`}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{event.calendarName}</p>
                  </div>
                </div>
              ))}
              {day.events.length > 5 && (
                <p className="py-2 text-center text-xs text-muted-foreground">+{day.events.length - 5} more events</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">No events scheduled</div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}

const UpcomingWeekPreview: React.FC<UpcomingWeekPreviewProps> = ({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-background bg-secondary p-4 shadow-sm sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg sm:h-8 sm:w-8" />
          <Skeleton className="h-4 w-28 sm:h-5 sm:w-36" />
        </div>
        <Skeleton className="mb-4 h-3 w-40 sm:mb-6 sm:h-4 sm:w-48" />
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg sm:h-24" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-background bg-secondary p-4 shadow-sm sm:p-6">
        <div className="mb-3 flex items-center gap-2 sm:mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-900/50 sm:h-8 sm:w-8">
            <AlertCircle className="h-3.5 w-3.5 text-rose-400 sm:h-4 sm:w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground sm:text-base">Upcoming Week</h3>
        </div>
        <div className="py-6 text-center sm:py-8">
          <p className="mb-3 text-sm text-muted-foreground sm:mb-4 sm:text-base">Failed to load upcoming events</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="rounded-xl bg-background bg-secondary p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-secondary sm:h-8 sm:w-8">
            <CalendarDays className="h-3.5 w-3.5 text-foreground sm:h-4 sm:w-4" />
          </div>
          <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">Upcoming Week</h3>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
          <Clock className="h-3 w-3" />
          <span>{data.totalHours} hrs</span>
        </div>
      </div>
      <p className="mb-3 ml-9 truncate text-[10px] text-muted-foreground sm:mb-4 sm:ml-10 sm:text-xs">
        {data.totalEvents} events • Busiest: {data.busiestDay}
      </p>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {data.days.map((day) => (
          <DayCard key={day.dateStr} day={day} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border border-t pt-3 sm:mt-4 sm:gap-4 sm:pt-4">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <StatusDot color="green" size="xs" className="sm:h-2 sm:w-2" />
          <span className="text-[10px] text-muted-foreground sm:text-xs">Light</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <StatusDot color="blue" size="xs" className="sm:h-2 sm:w-2" />
          <span className="text-[10px] text-muted-foreground sm:text-xs">Moderate</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <StatusDot color="yellow" size="xs" className="sm:h-2 sm:w-2" />
          <span className="text-[10px] text-muted-foreground sm:text-xs">Busy</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <StatusDot color="red" size="xs" className="sm:h-2 sm:w-2" />
          <span className="text-[10px] text-muted-foreground sm:text-xs">Packed</span>
        </div>
      </div>

      {/* Alert for packed days */}
      {data.days.some((d) => d.busynessLevel === 'packed') && (
        <div className="-rose-800 mt-2 flex items-center gap-1.5 rounded-lg border-rose-200 bg-rose-900/20 p-1.5 sm:mt-3 sm:gap-2 sm:p-2">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-rose-500 sm:h-4 sm:w-4" />
          <p className="text-[10px] text-rose-300 sm:text-xs">
            You have packed days ahead. Consider rescheduling some events.
          </p>
        </div>
      )}
    </div>
  )
}

export default UpcomingWeekPreview
