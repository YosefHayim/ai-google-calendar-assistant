'use client'

import type { ColorDefinition, Event } from '../types'

import { CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { EventCard } from '../components/EventCard'
import { getEventsForHour } from '../utils/calendar-utils'

interface DayViewProps {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  onDrop: (date: Date, hour: number) => void
  getColorClasses: (color: string) => ColorDefinition
}

export function DayView({
  currentDate,
  events,
  onEventClick,
  onDragStart,
  onDragEnd,
  onDrop,
  getColorClasses,
}: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const hasNoEvents = events.length === 0

  return (
    <Card className="relative overflow-auto">
      {hasNoEvents && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <EmptyState
            icon={<CalendarDays />}
            title="No events today"
            description="You have a free day ahead."
            size="lg"
          />
        </div>
      )}
      <div className="space-y-0">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(events, currentDate, hour)
          return (
            <div
              key={hour}
              className="flex touch-manipulation border-b last:border-b-0"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(currentDate, hour)}
            >
              <div className="w-12 flex-shrink-0 border-r p-1.5 text-[10px] text-muted-foreground sm:w-14 sm:p-2 sm:text-xs md:w-20 md:p-3 md:text-sm">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="min-h-12 flex-1 p-1 transition-colors hover:bg-accent/50 active:bg-accent/70 sm:min-h-16 sm:p-1.5 md:min-h-20 md:p-2">
                <div className="space-y-1 sm:space-y-2">
                  {hourEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEventClick={onEventClick}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      getColorClasses={getColorClasses}
                      variant="detailed"
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
