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
            relative flex flex-col items-center p-1.5 sm:p-2 rounded-lg border cursor-pointer
            transition-all duration-200 hover:scale-105 hover:shadow-md
            ${BUSYNESS_COLORS[day.busynessLevel]}
            ${BUSYNESS_BORDER_COLORS[day.busynessLevel]}
            ${day.isToday ? 'ring-2 ring-indigo-500 ring-offset-1 sm:ring-offset-2 dark:ring-offset-zinc-950' : ''}
          `}
        >
          {day.isToday && (
            <span className="absolute -top-1.5 sm:-top-2 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-950 px-0.5 sm:px-1 rounded">
              TODAY
            </span>
          )}
          {day.isTomorrow && !day.isToday && (
            <span className="absolute -top-1.5 sm:-top-2 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] font-medium text-zinc-500 bg-white dark:bg-zinc-950 px-0.5 sm:px-1 rounded">
              TMR
            </span>
          )}

          <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">{day.dayShort}</span>
          <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">{format(day.date, 'd')}</span>

          {/* Busyness indicator */}
          <div className="mt-0.5 sm:mt-1 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-colors ${
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

          <span className="text-[8px] sm:text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1 truncate max-w-full">
            {day.eventCount} {day.eventCount === 1 ? 'evt' : 'evts'}
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
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
          <Skeleton className="h-4 sm:h-5 w-28 sm:w-36" />
        </div>
        <Skeleton className="h-3 sm:h-4 w-40 sm:w-48 mb-4 sm:mb-6" />
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-16 sm:h-24 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">Upcoming Week</h3>
        </div>
        <div className="text-center py-6 sm:py-8">
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4">Failed to load upcoming events</p>
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
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-1 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-900 dark:text-primary" />
          </div>
          <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 truncate">Upcoming Week</h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">
          <Clock className="w-3 h-3" />
          <span>{data.totalHours} hrs</span>
        </div>
      </div>
      <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 mb-3 sm:mb-4 ml-9 sm:ml-10 truncate">
        {data.totalEvents} events • Busiest: {data.busiestDay}
      </p>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {data.days.map((day) => (
          <DayCard key={day.dateStr} day={day} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Light</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-500" />
          <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Moderate</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" />
          <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Busy</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500" />
          <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">Packed</span>
        </div>
      </div>

      {/* Alert for packed days */}
      {data.days.some((d) => d.busynessLevel === 'packed') && (
        <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 sm:gap-2">
          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 flex-shrink-0" />
          <p className="text-[10px] sm:text-xs text-rose-700 dark:text-rose-300">
            You have packed days ahead. Consider rescheduling some events.
          </p>
        </div>
      )}
    </div>
  )
}

export default UpcomingWeekPreview
