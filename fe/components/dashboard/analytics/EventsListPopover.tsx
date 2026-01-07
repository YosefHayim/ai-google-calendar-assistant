'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Clock, Calendar, CalendarDays, ExternalLink } from 'lucide-react'
import type { PatternEventSummary } from '@/types/analytics'

interface EventsListPopoverProps {
  events: PatternEventSummary[]
  title: string
  maxHeight?: number
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

function formatEventTime(startTime: string, endTime: string): string {
  const start = new Date(startTime)
  const end = new Date(endTime)
  return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  return format(date, 'EEE, MMM d')
}

function handleEventClick(htmlLink: string | undefined) {
  if (htmlLink) {
    window.open(htmlLink, '_blank', 'noopener,noreferrer')
  }
}

export const EventsListPopover: React.FC<EventsListPopoverProps> = ({
  events,
  title,
  maxHeight = 300,
}) => {
  if (events.length === 0) {
    return (
      <div className="p-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No events</p>
      </div>
    )
  }

  return (
    <div className="w-[300px]">
      <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
        <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{title}</h4>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{events.length} event{events.length !== 1 ? 's' : ''}</p>
      </div>
      <div style={{ maxHeight }} className="p-2 overflow-y-auto">
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event.htmlLink)}
              className={`p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${event.htmlLink ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: event.calendarColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate flex-1">
                      {event.summary}
                    </p>
                    {event.htmlLink && (
                      <ExternalLink className="w-3 h-3 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <CalendarDays className="w-3 h-3" />
                    <span>{formatEventDate(event.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatEventTime(event.startTime, event.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-medium">{formatDuration(event.durationMinutes)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                    <Calendar className="w-3 h-3" />
                    <span className="truncate">{event.calendarName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EventsListPopover
