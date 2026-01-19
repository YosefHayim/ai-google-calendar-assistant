'use client'

import { CalendarDays, Clock, Hash, Hourglass, Search, Sun, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EventListItem, TimelineVisualization } from './components'
import React, { useMemo, useState } from 'react'
import { calculateFilteredBusyHours, sortEventsByStartTime } from './utils'

import type { DayEventsDialogProps } from './types'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { WAKING_HOURS_PER_DAY } from './types'
import { format } from 'date-fns'
import { formatHours } from '@/lib/formatUtils'
import { useDebouncedCallback } from 'use-debounce'
import { useTranslation } from 'react-i18next'

export function DayEventsDialog({
  isOpen,
  date,
  availableHours,
  events,
  calendarMap,
  isLoading,
  onClose,
  onEventClick,
}: DayEventsDialogProps) {
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

  const filteredBusyHours = useMemo(() => {
    return calculateFilteredBusyHours(filteredEvents)
  }, [filteredEvents])

  const isFiltering = debouncedQuery.trim().length > 0

  if (isLoading) {
    return null
  }

  const busyHours = WAKING_HOURS_PER_DAY - availableHours
  const formattedDate = date ? format(new Date(date), 'EEEE, MMMM dd, yyyy') : ''
  const sortedFilteredEvents = sortEventsByStartTime(filteredEvents)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="h-1 w-full shrink-0 bg-primary" />

        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-primary/20">
              <Sun size={20} className="text-primary" />
            </div>
            <div className="flex-1 text-left">
              <DialogTitle className="text-xl font-bold text-foreground dark:text-primary-foreground">
                {formattedDate}
              </DialogTitle>
              <DialogDescription className="sr-only">Events and availability for {formattedDate}</DialogDescription>

              <div className="flex flex-wrap gap-4 mt-2">
                <div className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
                  <Clock size={12} className="text-primary" />
                  <span>
                    {t('dialogs.dayEvents.available', 'Available')}: {formatHours(availableHours)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
                  <Hourglass size={12} className="text-primary" />
                  <span>
                    {isFiltering
                      ? t('dialogs.eventSearch.filteredBusy', 'Filtered: {{filtered}}h (of {{total}}h)', {
                          filtered: filteredBusyHours.toFixed(1),
                          total: busyHours.toFixed(1),
                        })
                      : `${t('dialogs.dayEvents.busy', 'Busy')}: ${formatHours(busyHours)}`}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
                  <Hash size={12} className="text-primary" />
                  <span>
                    {isFiltering
                      ? t('dialogs.eventSearch.filteredCount', 'Events: {{filtered}} of {{total}}', {
                          filtered: filteredEvents.length,
                          total: events.length,
                        })
                      : `${t('dialogs.dayEvents.events', 'Events')}: ${events.length}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <TimelineVisualization events={events} calendarMap={calendarMap} />

        {events.length > 0 && (
          <div className="px-6 py-2 border-b border ">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('dialogs.eventSearch.placeholder', 'Search by title or description...')}
                value={inputValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-9 h-9 text-sm"
              />
              {inputValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            {t('dialogs.dayEvents.eventsTitle', 'Events')}
          </h4>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={50} className="text-emerald-500" />}
              title={t('dialogs.dayEvents.noEvents', 'No events scheduled')}
              description={t('dialogs.dayEvents.freeTime', 'You have {{hours}} hours of free time this day.', {
                hours: availableHours.toFixed(1),
              })}
            />
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              icon={<Search size={50} />}
              title={t('dialogs.eventSearch.noMatches', 'No events match your search.')}
              action={{ label: t('dialogs.eventSearch.clearSearch', 'Clear search'), onClick: clearSearch }}
            />
          ) : (
            <ul className="space-y-2">
              {sortedFilteredEvents.map((event) => (
                <EventListItem key={event.id} event={event} calendarMap={calendarMap} onEventClick={onEventClick} />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DayEventsDialog
