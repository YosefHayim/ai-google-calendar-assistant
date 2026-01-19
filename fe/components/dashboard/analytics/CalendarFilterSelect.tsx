'use client'

import { Calendar, Check, ChevronDown, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { Button } from '@/components/ui/button'
import type { CalendarListEntry } from '@/types/api'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

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
          className="h-9 w-full gap-2 border dark:border bg-background dark:bg-secondary hover:bg-muted dark:hover:bg-secondary touch-manipulation"
          disabled={isLoading}
        >
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate text-muted-foreground text-sm">{getSelectedCalendarNames()}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-64 p-0" align="start">
        <div className="p-3 border-b border dark:border sm:p-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {t('analytics.calendarFilter.filterByCalendar', 'Filter by Calendar')}
            </span>
            {!isAllSelected && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground touch-manipulation sm:h-6"
                onClick={handleClearSelection}
              >
                <X className="h-3 w-3 mr-1" />
                {t('analytics.calendarFilter.clear', 'Clear')}
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-1 sm:max-h-64">
          {/* All Calendars option */}
          <button
            type="button"
            onClick={handleSelectAll}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
              'hover:bg-secondary dark:hover:bg-secondary',
              isAllSelected && 'bg-secondary dark:bg-secondary',
            )}
          >
            <div
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded border',
                isAllSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
              )}
            >
              {isAllSelected && <Check className="h-3 w-3" />}
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('analytics.calendarFilter.allCalendars', 'All Calendars')}
            </span>
          </button>

          <div className="my-1 h-px bg-accent dark:bg-secondary" />

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
                  'flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors touch-manipulation',
                  'hover:bg-secondary dark:hover:bg-secondary active:bg-accent/70',
                  'sm:px-2 sm:py-2',
                  isSelected && 'bg-secondary dark:bg-secondary',
                )}
              >
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded border flex-shrink-0',
                    'sm:h-4 sm:w-4',
                    isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 sm:h-3 sm:w-3" />}
                </div>
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: calendarColor }} />
                <span className="truncate text-muted-foreground text-sm sm:text-sm">{calendar.summary || calendar.id}</span>
              </button>
            )
          })}

          {calendars.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              {t('analytics.calendarFilter.noCalendars', 'No calendars available')}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
