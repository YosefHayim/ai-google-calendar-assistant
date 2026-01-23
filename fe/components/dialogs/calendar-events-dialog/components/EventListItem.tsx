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
          className="group -m-3 flex cursor-pointer items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted hover:bg-secondary/50"
          onClick={() => onEventClick(event)}
        >
          <div
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-opacity group-hover:opacity-80"
            style={{
              backgroundColor: calendarColor,
              opacity: 0.2,
            }}
          >
            <CalendarDays size={16} style={{ color: calendarColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-semibold text-foreground text-muted-foreground">
              {event.summary || 'N/A'}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                <Clock size={12} style={{ color: calendarColor }} />
                <span> {eventTime}</span>
              </div>
              <span className="text-xs font-bold text-muted-foreground">•</span>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Hourglass size={12} style={{ color: calendarColor }} />
                <span> {duration}</span>
              </div>
              {event.status && (
                <>
                  <span className="text-xs font-bold text-muted-foreground">•</span>
                  <span className="px-1.5 py-0.5 text-xs font-bold">
                    <span className="text-xs font-bold text-muted-foreground">
                      {event.status === 'confirmed' ? (
                        <CircleCheckBig size={12} className="text-primary" />
                      ) : (
                        <CircleX size={12} className="text-destructive" />
                      )}
                    </span>
                  </span>
                </>
              )}
            </div>
            {event.location && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{event.location}</p>}
          </div>
        </li>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">{event.summary || 'No Title'}</h4>
          <div className="space-y-2 text-xs text-muted-foreground">
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
                    <CircleCheckBig size={12} className="text-primary" />
                  ) : event.status === 'tentative' ? (
                    <CircleX size={12} className="text-destructive" />
                  ) : (
                    <CircleX size={12} className="text-destructive" />
                  )}
                </span>
              </div>
            )}
            {event.description && (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{event.description}</p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
