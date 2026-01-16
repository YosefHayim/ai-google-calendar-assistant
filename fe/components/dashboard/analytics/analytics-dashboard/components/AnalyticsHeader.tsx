'use client'

import React from 'react'
import { format } from 'date-fns'
import { RotateCw } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { CalendarFilterSelect } from '../CalendarFilterSelect'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import { getDaysBetween } from '@/lib/dateUtils'
import type { CalendarListEntry } from '@/types/api'

interface AnalyticsHeaderProps {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  calendarsData: CalendarListEntry[]
  selectedCalendarIds: string[]
  setSelectedCalendarIds: (ids: string[]) => void
  isCalendarsLoading: boolean
  isAnalyticsFetching: boolean
  onRefresh: () => void
}

export function AnalyticsHeader({
  date,
  setDate,
  calendarsData,
  selectedCalendarIds,
  setSelectedCalendarIds,
  isCalendarsLoading,
  isAnalyticsFetching,
  onRefresh,
}: AnalyticsHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:gap-4">
      {date?.from && date?.to && (
        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
          <span className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">Analytics for</span>
          <span className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {format(date.from, 'MMM dd, yyyy')} - {format(date.to, 'MMM dd, yyyy')}
          </span>
          <span className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500">
            ({getDaysBetween(date.from, date.to)} days)
          </span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center">
        <DatePickerWithRange date={date} setDate={setDate} />
        <CalendarFilterSelect
          calendars={calendarsData}
          selectedCalendarIds={selectedCalendarIds}
          onSelectionChange={setSelectedCalendarIds}
          isLoading={isCalendarsLoading}
        />
        <InteractiveHoverButton
          text="Refresh"
          loadingText="Refreshing..."
          isLoading={isAnalyticsFetching}
          Icon={<RotateCw size={16} />}
          onClick={onRefresh}
        />
      </div>
    </header>
  )
}
