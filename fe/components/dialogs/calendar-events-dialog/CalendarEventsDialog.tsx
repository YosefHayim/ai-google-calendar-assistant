'use client'

import React, { useState, useMemo } from 'react'
import { CalendarDays, Search } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import type { CalendarEventsDialogProps } from '@/types/analytics'
import { useTranslation } from 'react-i18next'
import { useDebouncedCallback } from 'use-debounce'
import { DialogHeaderSection, SearchInput, EventListItem } from './components'
import { sortEventsByStartTime } from './utils'

export function CalendarEventsDialog({
  isOpen,
  calendarName,
  calendarColor,
  dateRange,
  events,
  isLoading,
  totalHours,
  onClose,
  onEventClick,
}: CalendarEventsDialogProps) {
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const debouncedSetQuery = useDebouncedCallback((value: string) => {
    setDebouncedQuery(value)
  }, 300)

  const handleSearchChange = (value: string) => {
    setInputValue(value)
    debouncedSetQuery(value)
  }

  const clearSearch = () => {
    setInputValue('')
    setDebouncedQuery('')
  }

  const filteredEvents = useMemo(() => {
    if (!debouncedQuery.trim()) return events
    const query = debouncedQuery.toLowerCase().trim()
    return events.filter((event) => {
      const summary = (event.summary || '').toLowerCase()
      const description = (event.description || '').toLowerCase()
      return summary.includes(query) || description.includes(query)
    })
  }, [events, debouncedQuery])

  const filteredHours = useMemo(() => {
    if (!debouncedQuery.trim()) return totalHours || 0
    return filteredEvents.reduce((acc, event) => {
      if (!event.start || !event.end) return acc
      const start = event.start.dateTime
        ? new Date(event.start.dateTime)
        : event.start.date
          ? new Date(event.start.date)
          : null
      const end = event.end.dateTime ? new Date(event.end.dateTime) : event.end.date ? new Date(event.end.date) : null
      if (!start || !end) return acc
      const durationMs = end.getTime() - start.getTime()
      return acc + durationMs / (1000 * 60 * 60)
    }, 0)
  }, [filteredEvents, debouncedQuery, totalHours])

  const isFiltering = debouncedQuery.trim().length > 0
  const sortedEvents = sortEventsByStartTime(filteredEvents)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="h-1 w-full shrink-0" style={{ backgroundColor: calendarColor }} />

        <DialogHeaderSection
          calendarName={calendarName}
          calendarColor={calendarColor}
          dateRange={dateRange}
          totalHours={totalHours}
          filteredHours={filteredHours}
          filteredCount={filteredEvents.length}
          totalCount={events.length}
          isFiltering={isFiltering}
        />

        {events.length > 0 && <SearchInput value={inputValue} onChange={handleSearchChange} onClear={clearSearch} />}

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={50} style={{ color: calendarColor }} />}
              title={t('dialogs.eventSearch.noEvents', 'No events found for this calendar in the selected date range.')}
            />
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon={<Search size={50} />}
              title={t('dialogs.eventSearch.noMatches', 'No events match your search.')}
              action={{ label: t('dialogs.eventSearch.clearSearch', 'Clear search'), onClick: clearSearch }}
            />
          ) : (
            <ul className="space-y-2">
              {sortedEvents.map((event) => (
                <EventListItem key={event.id} event={event} calendarColor={calendarColor} onEventClick={onEventClick} />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CalendarEventsDialog
