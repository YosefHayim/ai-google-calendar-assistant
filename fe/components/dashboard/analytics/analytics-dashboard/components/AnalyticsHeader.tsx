'use client'

import { CalendarFilterSelect } from '../../CalendarFilterSelect'
import type { CalendarListEntry } from '@/types/api'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import type { DateRange } from 'react-day-picker'
import React from 'react'
import { Calendar, ChevronDown, Download, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

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
}: AnalyticsHeaderProps) {
  const router = useRouter()

  const handleAskAlly = () => {
    router.push('/dashboard')
  }

  const handleExport = () => {
    console.log('Export analytics')
  }

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground sm:text-[28px]">Analytics</h1>
        <p className="text-sm text-muted-foreground">AI-powered insights to maximize your time</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <DatePickerWithRange date={date} setDate={setDate} />

        <div className="hidden sm:block">
          <CalendarFilterSelect
            calendars={calendarsData}
            selectedCalendarIds={selectedCalendarIds}
            onSelectionChange={setSelectedCalendarIds}
            isLoading={isCalendarsLoading}
          />
        </div>

        <Button onClick={handleAskAlly} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Ask Ally
        </Button>

        <Button variant="secondary" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </header>
  )
}
