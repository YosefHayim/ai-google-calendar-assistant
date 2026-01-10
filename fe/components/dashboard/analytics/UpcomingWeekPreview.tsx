'use client'

import React from 'react'
import { CalendarDays, Clock, AlertCircle, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { UpcomingWeekData, UpcomingDayData } from '@/hooks/queries/analytics/useUpcomingWeekData'

interface UpcomingWeekPreviewProps {
  data: UpcomingWeekData | undefined
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

const BUSYNESS_COLORS = {
  free: 'bg-zinc-100 dark:bg-zinc-800',
  light: 'bg-emerald-100 dark:bg-emerald-900/40',
  moderate: 'bg-sky-100 dark:bg-sky-900/40',
  busy: 'bg-amber-100 dark:bg-amber-900/40',
  packed: 'bg-rose-100 dark:bg-rose-900/40',
}

const BUSYNESS_BORDER_COLORS = {
  free: 'border-zinc-200 dark:border-zinc-700',
  light: 'border-emerald-300 dark:border-emerald-800',
  moderate: 'border-sky-300 dark:border-sky-800',
  busy: 'border-amber-300 dark:border-amber-800',
  packed: 'border-rose-300 dark:border-rose-800',
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
          className={`
            relative flex flex-col items-center p-2 rounded-lg border cursor-pointer
            transition-all duration-200 hover:scale-105 hover:shadow-md
            ${BUSYNESS_COLORS[day.busynessLevel]}
            ${BUSYNESS_BORDER_COLORS[day.busynessLevel]}
            ${day.isToday ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-950' : ''}
          `}
        >
          {day.isToday && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-950 px-1 rounded">
              TODAY
            </span>
          )}
          {day.isTomorrow && !day.isToday && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-zinc-500 bg-white dark:bg-zinc-950 px-1 rounded">
              TMR
            </span>
          )}

          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{day.dayShort}</span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{format(day.date, 'd')}</span>

          {/* Busyness indicator */}
          <div className="mt-1 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
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
                        ? 'bg-amber-500'
                        : day.busynessLevel === 'moderate'
                          ? 'bg-sky-500'
                          : 'bg-emerald-500'
                    : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
              />
            ))}
          </div>

          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
            {day.eventCount} {day.eventCount === 1 ? 'event' : 'events'}
          </span>
        </div>
      </HoverCardTrigger>

      <HoverCardContent className="w-72 p-0" side="bottom" align="center">
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{day.dayName}</h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${BUSYNESS_COLORS[day.busynessLevel]} font-medium`}
            >
              {BUSYNESS_TEXT[day.busynessLevel]}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {day.eventCount} events • {day.totalHours} hours scheduled
          </p>
        </div>

        {day.events.length > 0 ? (
          <div className="max-h-48 overflow-y-auto">
            <div className="p-2 space-y-1">
              {day.events.slice(0, 5).map((event, idx) => (
                <div
                  key={`${event.id}-${idx}`}
                  className="flex items-start gap-2 p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                >
                  <div
                    className="w-1 h-full min-h-[2rem] rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.calendarColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate flex-1">{event.summary}</p>
                      {event.isRecurring && (
                        <span title="Recurring event"><Repeat className="w-3 h-3 text-zinc-400 flex-shrink-0" /></span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {event.isAllDay
                        ? 'All day'
                        : `${format(new Date(event.startTime), 'h:mm a')} • ${Math.round(event.durationMinutes)} min`}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{event.calendarName}</p>
                  </div>
                </div>
              ))}
              {day.events.length > 5 && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-2">
                  +{day.events.length - 5} more events
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">No events scheduled</div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}

const UpcomingWeekPreview: React.FC<UpcomingWeekPreviewProps> = ({ data, isLoading = false, isError = false, onRetry }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Upcoming Week</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">Failed to load upcoming events</p>
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
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Upcoming Week</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <Clock className="w-3 h-3" />
          <span>{data.totalHours} hrs</span>
        </div>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 ml-10">
        {data.totalEvents} events • Busiest: {data.busiestDay}
      </p>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {data.days.map((day) => (
          <DayCard key={day.dateStr} day={day} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Light</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Busy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Packed</span>
        </div>
      </div>

      {/* Alert for packed days */}
      {data.days.some((d) => d.busynessLevel === 'packed') && (
        <div className="mt-3 p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <p className="text-xs text-rose-700 dark:text-rose-300">
            You have packed days ahead. Consider rescheduling some events.
          </p>
        </div>
      )}
    </div>
  )
}

export default UpcomingWeekPreview
