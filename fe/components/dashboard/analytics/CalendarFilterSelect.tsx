'use client'

import { Calendar, Check, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import type { CalendarListEntry } from '@/types/api'

interface CalendarFilterSelectProps {
  calendars: CalendarListEntry[]
  selectedCalendarIds: string[]
  onSelectionChange: (ids: string[]) => void
  isLoading?: boolean
}

export function CalendarFilterSelect({
  calendars,
  selectedCalendarIds,
  onSelectionChange,
  isLoading = false,
}: CalendarFilterSelectProps) {
  const { t } = useTranslation()

  const isAllSelected = selectedCalendarIds.length === 0
  const selectedCount = selectedCalendarIds.length

  const handleToggleCalendar = (calendarId: string) => {
    if (selectedCalendarIds.includes(calendarId)) {
      // Remove from selection
      const newSelection = selectedCalendarIds.filter((id) => id !== calendarId)
      onSelectionChange(newSelection)
    } else {
      // Add to selection
      onSelectionChange([...selectedCalendarIds, calendarId])
    }
  }

  const handleSelectAll = () => {
    onSelectionChange([])
  }

  const handleClearSelection = () => {
    // If nothing is selected (all calendars), do nothing
    if (isAllSelected) return
    // Clear selection to show all calendars
    onSelectionChange([])
  }

  const getSelectedCalendarNames = () => {
    if (isAllSelected) return t('analytics.calendarFilter.allCalendars', 'All Calendars')
    if (selectedCount === 1) {
      const calendar = calendars.find((c) => c.id === selectedCalendarIds[0])
      return calendar?.summary || calendar?.id || t('analytics.calendarFilter.oneCalendar', '1 Calendar')
    }
    return t('analytics.calendarFilter.multipleCalendars', '{{count}} Calendars', { count: selectedCount })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          disabled={isLoading}
        >
          <Calendar className="h-4 w-4 text-zinc-500" />
          <span className="max-w-[150px] truncate text-zinc-700 dark:text-zinc-300">
            {getSelectedCalendarNames()}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('analytics.calendarFilter.filterByCalendar', 'Filter by Calendar')}
            </span>
            {!isAllSelected && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                onClick={handleClearSelection}
              >
                <X className="h-3 w-3 mr-1" />
                {t('analytics.calendarFilter.clear', 'Clear')}
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto p-1">
          {/* All Calendars option */}
          <button
            type="button"
            onClick={handleSelectAll}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
              'hover:bg-zinc-100 dark:hover:bg-zinc-800',
              isAllSelected && 'bg-zinc-100 dark:bg-zinc-800'
            )}
          >
            <div
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded border',
                isAllSelected
                  ? 'border-primary bg-primary text-white'
                  : 'border-zinc-300 dark:border-zinc-600'
              )}
            >
              {isAllSelected && <Check className="h-3 w-3" />}
            </div>
            <Calendar className="h-4 w-4 text-zinc-500" />
            <span className="text-zinc-700 dark:text-zinc-300">
              {t('analytics.calendarFilter.allCalendars', 'All Calendars')}
            </span>
          </button>

          <div className="my-1 h-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Individual calendars */}
          {calendars.map((calendar) => {
            const isSelected = !isAllSelected && selectedCalendarIds.includes(calendar.id)
            const calendarColor = calendar.backgroundColor || '#6366f1'

            return (
              <button
                key={calendar.id}
                type="button"
                onClick={() => handleToggleCalendar(calendar.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                  'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  isSelected && 'bg-zinc-100 dark:bg-zinc-800'
                )}
              >
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border',
                    isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-zinc-300 dark:border-zinc-600'
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: calendarColor }}
                />
                <span className="truncate text-zinc-700 dark:text-zinc-300">
                  {calendar.summary || calendar.id}
                </span>
              </button>
            )
          })}

          {calendars.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-zinc-500">
              {t('analytics.calendarFilter.noCalendars', 'No calendars available')}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
