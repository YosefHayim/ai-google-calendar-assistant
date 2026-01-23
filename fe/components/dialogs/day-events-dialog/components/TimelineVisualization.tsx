'use client'

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

import type { CalendarEvent } from '@/types/api'
import type { CalendarInfo } from '../types'
import React from 'react'
import { getCalendarInfo } from '../utils'

interface TimelineVisualizationProps {
  events: CalendarEvent[]
  calendarMap: Map<string, CalendarInfo>
}

export function TimelineVisualization({ events, calendarMap }: TimelineVisualizationProps) {
  return (
    <div className="px-6 py-4 border-b border ">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-muted-foreground dark:text-muted-foreground">Day Overview</span>
      </div>
      <div className="relative h-8 bg-secondary dark:bg-secondary rounded-md overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-primary/10 dark:bg-primary/30" style={{ width: '100%' }} />
        {events.map((event, index) => {
          if (!event.start?.dateTime || !event.end?.dateTime) return null
          const start = new Date(event.start.dateTime)
          const end = new Date(event.end.dateTime)
          const startHour = start.getHours() + start.getMinutes() / 60
          const endHour = end.getHours() + end.getMinutes() / 60
          const leftPercent = (startHour / 24) * 100
          const widthPercent = ((endHour - startHour) / 24) * 100
          const { color } = getCalendarInfo(event, calendarMap)
          const maxChars = Math.max(Math.floor(widthPercent / 3), 3)
          const displayName = event.summary
            ? event.summary.length > maxChars
              ? `${event.summary.slice(0, maxChars)}...`
              : event.summary
            : ''

          return (
            <HoverCard key={event.id || index} openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <div
                  className="absolute inset-y-0 opacity-80 overflow-hidden cursor-pointer hover:opacity-100 transition-opacity"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${Math.max(widthPercent, 1)}%`,
                    backgroundColor: color,
                  }}
                >
                  <span className="text-xs text-black truncate block px-0.5 leading-8">{displayName}</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent side="top" className="w-auto max-w-xs p-2">
                <p className="text-sm font-medium">{event.summary || 'No Title'}</p>
              </HoverCardContent>
            </HoverCard>
          )
        })}
        <div className="absolute inset-0 flex">
          {[6, 12, 18].map((hour) => (
            <div
              key={hour}
              className="absolute h-full border-l border-border"
              style={{ left: `${(hour / 24) * 100}%` }}
            >
              <span className="absolute -top-5 -translate-x-1/2 text-[10px] text-muted-foreground">
                {hour === 12 ? '12pm' : hour < 12 ? `${hour}am` : `${hour - 12}pm`}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">12am</span>
        <span className="text-[10px] text-muted-foreground">12pm</span>
      </div>
    </div>
  )
}
