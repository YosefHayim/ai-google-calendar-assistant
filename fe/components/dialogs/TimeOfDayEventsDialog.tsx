'use client'

import { Clock, ExternalLink, Hash, Search, X, Timer } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React, { useMemo, useState } from 'react'

import type { TimeOfDayCategory, PatternEventSummary, EventDurationCategory } from '@/types/analytics'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { formatDuration } from '@/lib/formatUtils'
import { useDebouncedCallback } from 'use-debounce'
import { useTranslation } from 'react-i18next'

interface TimeOfDayEventsDialogProps {
  isOpen: boolean
  category: TimeOfDayCategory | null
  onClose: () => void
  onEventClick?: (event: PatternEventSummary) => void
}

interface EventDurationEventsDialogProps {
  isOpen: boolean
  category: EventDurationCategory | null
  onClose: () => void
  onEventClick?: (event: PatternEventSummary) => void
}

const TIME_PERIOD_ICONS: Record<string, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌆',
  night: '🌙',
}

const DURATION_ICONS: Record<string, string> = {
  short: '⚡',
  medium: '📅',
  long: '📊',
  extended: '🕐',
}

function EventItem({
  event,
  onEventClick,
}: {
  event: PatternEventSummary
  onEventClick?: (event: PatternEventSummary) => void
}) {
  const startTime = event.startTime ? format(new Date(event.startTime), 'h:mm a') : ''
  const endTime = event.endTime ? format(new Date(event.endTime), 'h:mm a') : ''
  const eventDate = event.eventDate ? format(new Date(event.eventDate), 'MMM d') : ''

  return (
    <li
      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted"
      onClick={() => onEventClick?.(event)}
    >
      <div className="h-10 w-1 shrink-0 rounded-full" style={{ backgroundColor: event.calendarColor }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-medium text-foreground">{event.summary || 'No Title'}</h4>
          {event.htmlLink && (
            <a
              href={event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{eventDate}</span>
          <span>
            {startTime} - {endTime}
          </span>
          <span>{formatDuration(event.durationMinutes)}</span>
          <span className="truncate">{event.calendarName}</span>
        </div>
      </div>
    </li>
  )
}

export function TimeOfDayEventsDialog({ isOpen, category, onClose, onEventClick }: TimeOfDayEventsDialogProps) {
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

  React.useEffect(() => {
    if (!isOpen) {
      setInputValue('')
      setDebouncedQuery('')
    }
  }, [isOpen])

  const events = category?.events || []

  const filteredEvents = useMemo(() => {
    if (!debouncedQuery.trim()) return events
    const query = debouncedQuery.toLowerCase().trim()
    return events.filter((event) => {
      const summary = (event.summary || '').toLowerCase()
      const calendarName = (event.calendarName || '').toLowerCase()
      return summary.includes(query) || calendarName.includes(query)
    })
  }, [events, debouncedQuery])

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (a.startTime && b.startTime) {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      }
      return 0
    })
  }, [filteredEvents])

  const isFiltering = debouncedQuery.trim().length > 0

  if (!category) return null

  const icon = TIME_PERIOD_ICONS[category.key] || '📅'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <div className="h-1 w-full shrink-0" style={{ backgroundColor: category.color }} />

        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xl"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {icon}
            </div>
            <div className="flex-1 text-left">
              <DialogTitle className="text-xl font-bold text-foreground">
                {category.label} Events ({category.timeRange})
              </DialogTitle>
              <DialogDescription className="sr-only">
                Events scheduled during {category.label.toLowerCase()} hours
              </DialogDescription>

              <div className="mt-2 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash size={12} style={{ color: category.color }} />
                  <span>
                    {isFiltering
                      ? t('dialogs.eventSearch.filteredCount', 'Events: {{filtered}} of {{total}}', {
                          filtered: filteredEvents.length,
                          total: events.length,
                        })
                      : `${category.count} events`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={12} style={{ color: category.color }} />
                  <span>{Math.round(category.percentage)}% of all events</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {events.length > 0 && (
          <div className="border-b px-6 py-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('dialogs.eventSearch.placeholder', 'Search by title or calendar...')}
                value={inputValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9 pl-9 pr-9 text-sm"
              />
              {inputValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {events.length === 0 ? (
            <EmptyState
              icon={<Clock size={50} style={{ color: category.color }} />}
              title={`No ${category.label.toLowerCase()} events`}
              description={`You don't have any events scheduled during ${category.label.toLowerCase()} hours (${category.timeRange}).`}
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
                <EventItem key={event.id} event={event} onEventClick={onEventClick} />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function EventDurationEventsDialog({ isOpen, category, onClose, onEventClick }: EventDurationEventsDialogProps) {
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

  React.useEffect(() => {
    if (!isOpen) {
      setInputValue('')
      setDebouncedQuery('')
    }
  }, [isOpen])

  const events = category?.events || []

  const filteredEvents = useMemo(() => {
    if (!debouncedQuery.trim()) return events
    const query = debouncedQuery.toLowerCase().trim()
    return events.filter((event) => {
      const summary = (event.summary || '').toLowerCase()
      const calendarName = (event.calendarName || '').toLowerCase()
      return summary.includes(query) || calendarName.includes(query)
    })
  }, [events, debouncedQuery])

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => b.durationMinutes - a.durationMinutes)
  }, [filteredEvents])

  const isFiltering = debouncedQuery.trim().length > 0

  if (!category) return null

  const icon = DURATION_ICONS[category.key] || '📅'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <div className="h-1 w-full shrink-0" style={{ backgroundColor: category.color }} />

        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xl"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {icon}
            </div>
            <div className="flex-1 text-left">
              <DialogTitle className="text-xl font-bold text-foreground">
                {category.label} Events ({category.range})
              </DialogTitle>
              <DialogDescription className="sr-only">
                Events with {category.label.toLowerCase()} duration
              </DialogDescription>

              <div className="mt-2 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash size={12} style={{ color: category.color }} />
                  <span>
                    {isFiltering
                      ? t('dialogs.eventSearch.filteredCount', 'Events: {{filtered}} of {{total}}', {
                          filtered: filteredEvents.length,
                          total: events.length,
                        })
                      : `${category.count} events`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Timer size={12} style={{ color: category.color }} />
                  <span>{Math.round(category.percentage)}% of all events</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {events.length > 0 && (
          <div className="border-b px-6 py-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('dialogs.eventSearch.placeholder', 'Search by title or calendar...')}
                value={inputValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9 pl-9 pr-9 text-sm"
              />
              {inputValue && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {events.length === 0 ? (
            <EmptyState
              icon={<Timer size={50} style={{ color: category.color }} />}
              title={`No ${category.label.toLowerCase()} events`}
              description={`You don't have any events with ${category.label.toLowerCase()} duration (${category.range}).`}
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
                <EventItem key={event.id} event={event} onEventClick={onEventClick} />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TimeOfDayEventsDialog
