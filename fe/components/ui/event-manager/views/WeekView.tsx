'use client'

import type { ColorDefinition, Event } from '../types'
import { getEventsForDayAndHour, getWeekDays } from '../utils/calendar-utils'

import { CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { EventCard } from '../components/EventCard'
import React from 'react'
import { cn } from '@/lib/utils'

interface WeekViewProps {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  onDrop: (date: Date, hour: number) => void
  getColorClasses: (color: string) => ColorDefinition
}

export function WeekView({
  currentDate,
  events,
  onEventClick,
  onDragStart,
  onDragEnd,
  onDrop,
  getColorClasses,
}: WeekViewProps) {
  const weekDays = getWeekDays(currentDate)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const hasNoEvents = events.length === 0

  return (
    <Card className="overflow-auto relative">
      {hasNoEvents && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <EmptyState
            icon={<CalendarDays />}
            title="No events this week"
            description="Your week is open for scheduling."
            size="lg"
          />
        </div>
      )}
      <div className="grid grid-cols-8 border-b">
        <div className="border-r p-1.5 text-center text-[10px] font-medium sm:p-2 sm:text-xs md:text-sm">Time</div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className="border-r p-1.5 text-center text-[10px] font-medium last:border-r-0 sm:p-2 sm:text-xs md:text-sm"
          >
            <div className="hidden sm:block">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="block sm:hidden">{day.toLocaleDateString('en-US', { weekday: 'narrow' })}</div>
            <div className="text-[9px] text-muted-foreground sm:text-[10px] md:text-xs">
              {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-8">
        {hours.map((hour) => (
          <React.Fragment key={`hour-${hour}`}>
            <div className="border-b border-r p-0.5 text-[9px] text-muted-foreground sm:p-1 sm:text-[10px] md:p-2 md:text-xs">
              {hour.toString().padStart(2, '0')}:00
            </div>
            {weekDays.map((day) => {
              const dayEvents = getEventsForDayAndHour(events, day, hour)
              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className={cn(
                    'min-h-10 border-b border-r p-0.5 transition-colors last:border-r-0 touch-manipulation',
                    'sm:min-h-12 md:min-h-16',
                    'sm:p-0.5 md:p-1',
                    'hover:bg-accent/50 active:bg-accent/70',
                  )}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(day, hour)}
                >
                  <div className="space-y-0.5 sm:space-y-1">
                    {dayEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEventClick={onEventClick}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        getColorClasses={getColorClasses}
                        variant="default"
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </Card>
  )
}
