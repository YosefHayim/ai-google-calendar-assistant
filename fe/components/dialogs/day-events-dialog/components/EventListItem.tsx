'use client'

import React from 'react'
import { CalendarDays, CircleCheckBig, CircleX, Clock, Hourglass, MapPin } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import type { CalendarEvent } from '@/types/api'
import type { CalendarInfo } from '../types'
import { getEventDuration, formatEventTimeRange, getCalendarInfo } from '../utils'

interface EventListItemProps {
  event: CalendarEvent
  calendarMap: Map<string, CalendarInfo>
  onEventClick: (event: CalendarEvent, calendarColor: string, calendarName: string) => void
}

export function EventListItem({ event, calendarMap, onEventClick }: EventListItemProps) {
  const eventTimeRange = formatEventTimeRange(event)
  const duration = getEventDuration(event)
  const { name: calendarName, color: calendarColor } = getCalendarInfo(event, calendarMap)

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <li
          className="flex items-start gap-3 group cursor-pointer hover:bg-muted dark:hover:bg-secondary/50 rounded-md p-3 -mx-3 transition-colors"
          onClick={() => onEventClick(event, calendarColor, calendarName)}
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
              {event.summary || 'No Title'}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div className="text-xs text-muted-foreground font-bold uppercase flex items-center gap-2">
                <Clock size={12} style={{ color: calendarColor }} />
                <span>{eventTimeRange}</span>
              </div>
              <span className="text-xs font-bold text-muted-foreground dark:text-muted-foreground">•</span>
              <div className="text-xs font-bold text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
                <Hourglass size={12} style={{ color: calendarColor }} />
                <span>{duration}</span>
              </div>
              {event.status && (
                <>
                  <span className="text-xs font-bold text-muted-foreground dark:text-muted-foreground">•</span>
                  <span className="text-xs font-bold px-1.5 py-0.5">
                    {event.status === 'confirmed' ? (
                      <CircleCheckBig size={12} className="text-green-600" />
                    ) : (
                      <CircleX size={12} className="text-destructive" />
                    )}
                  </span>
                </>
              )}
            </div>
            {event.location && (
              <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1 line-clamp-1">
                <MapPin size={10} className="inline mr-1" />
                {event.location}
              </p>
            )}
          </div>
        </li>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-foreground dark:text-primary-foreground">{event.summary || 'No Title'}</h4>
          <div className="space-y-2 text-xs text-zinc-600 dark:text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{eventTimeRange}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hourglass size={16} />
              <span>Duration: {duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} style={{ color: calendarColor }} />
              <span>{calendarName}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            {event.description && (
              <p className="text-xs text-muted-foreground dark:text-muted-foreground line-clamp-2 mt-2">{event.description}</p>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
