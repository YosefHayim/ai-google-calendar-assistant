'use client'

import React from 'react'
import { CalendarDays, CircleCheckBig, CircleX, Clock, Hourglass, MapPin } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { CalendarEvent } from '@/types/api'
import { getEventDuration, formatEventTime } from '../utils'

interface EventListItemProps {
  event: CalendarEvent
  calendarColor: string
  onEventClick: (event: CalendarEvent) => void
}

export function EventListItem({ event, calendarColor, onEventClick }: EventListItemProps) {
  const eventTime = formatEventTime(event)
  const duration = getEventDuration(event)

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <li
          className="flex items-start gap-3 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-md p-3 -m-3 transition-colors"
          onClick={() => onEventClick(event)}
        >
          <div
            className="w-8 h-8 rounded-md group-hover:opacity-80 transition-opacity flex items-center justify-center shrink-0 mt-0.5"
            style={{
              backgroundColor: calendarColor,
              opacity: 0.2,
            }}
          >
            <CalendarDays size={16} style={{ color: calendarColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">
              {event.summary || 'N/A'}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div className="text-xs text-zinc-400 font-bold uppercase flex items-center gap-2">
                <Clock size={12} style={{ color: calendarColor }} />
                <span> {eventTime}</span>
              </div>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">•</span>
              <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <Hourglass size={12} style={{ color: calendarColor }} />
                <span> {duration}</span>
              </div>
              {event.status && (
                <>
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">•</span>
                  <span className="text-xs font-bold px-1.5 py-0.5">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                      {event.status === 'confirmed' ? (
                        <CircleCheckBig size={12} className="text-green-500" />
                      ) : (
                        <CircleX size={12} className="text-red-500" />
                      )}
                    </span>
                  </span>
                </>
              )}
            </div>
            {event.location && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{event.location}</p>
            )}
          </div>
        </li>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{event.summary || 'No Title'}</h4>
          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{eventTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hourglass size={16} />
              <span>Duration: {duration}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            {event.status && (
              <div className="flex items-center gap-2">
                <span>
                  Status:{' '}
                  {event.status === 'confirmed'
                    ? 'Confirmed'
                    : event.status === 'tentative'
                      ? 'Tentative'
                      : 'Cancelled'}
                </span>
                <span>
                  {event.status === 'confirmed' ? (
                    <CircleCheckBig size={12} className="text-green-500" />
                  ) : event.status === 'tentative' ? (
                    <CircleX size={12} className="text-red-500" />
                  ) : (
                    <CircleX size={12} className="text-red-500" />
                  )}
                </span>
              </div>
            )}
            {event.description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2">{event.description}</p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
