'use client'

import { CalendarFilterSelect } from '../../CalendarFilterSelect'
import type { CalendarListEntry } from '@/types/api'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import type { DateRange } from 'react-day-picker'
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button'
import React from 'react'
import { RotateCw } from 'lucide-react'
import { format } from 'date-fns'
import { getDaysBetween } from '@/lib/dateUtils'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  return (
    <header className="flex flex-col gap-2 sm:gap-3 md:gap-4">
      {date?.from && date?.to && (
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-1.5 md:gap-2">
          <span className="text-xs text-muted-foreground sm:text-sm md:text-base">{t('analytics.for')}</span>
          <span className="truncate text-xs font-semibold text-foreground sm:text-sm md:text-base">
            {format(date.from, 'MMM dd, yyyy')} - {format(date.to, 'MMM dd, yyyy')}
          </span>
          <span className="text-[10px] text-muted-foreground sm:text-xs md:text-sm">
            ({getDaysBetween(date.from, date.to)} days)
          </span>
        </div>
      )}
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 md:gap-3">
        <div className="w-full sm:w-auto sm:min-w-[240px]">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <CalendarFilterSelect
            calendars={calendarsData}
            selectedCalendarIds={selectedCalendarIds}
            onSelectionChange={setSelectedCalendarIds}
            isLoading={isCalendarsLoading}
          />
        </div>
        <div className="w-full sm:w-auto">
          <InteractiveHoverButton
            text="Refresh"
            loadingText="Refreshing..."
            isLoading={isAnalyticsFetching}
            Icon={<RotateCw size={16} />}
            onClick={onRefresh}
            className="w-full sm:w-auto"
          />
        </div>
      </div>
    </header>
  )
}
