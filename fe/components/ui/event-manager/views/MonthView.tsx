'use client'

import type { ColorDefinition, Event } from '../types'

import { CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { EventCard } from '../components/EventCard'
import { cn } from '@/lib/utils'
import { getEventsForDay } from '../utils/calendar-utils'

interface MonthViewProps {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
  onDragStart: (event: Event) => void
  onDragEnd: () => void
  onDrop: (date: Date) => void
  getColorClasses: (color: string) => ColorDefinition
}

export function MonthView({
  currentDate,
  events,
  onEventClick,
  onDragStart,
  onDragEnd,
  onDrop,
  getColorClasses,
}: MonthViewProps) {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  const days = []
  const currentDay = new Date(startDate)

  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDay))
    currentDay.setDate(currentDay.getDate() + 1)
  }

  const hasNoEvents = events.length === 0

  return (
    <Card className="relative overflow-hidden">
      {hasNoEvents && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <EmptyState
            icon={<CalendarDays />}
            title="No events scheduled"
            description="Your calendar is clear for this month."
            size="lg"
          />
        </div>
      )}
      <div className="grid grid-cols-7 border-b">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="border-r p-2 text-center text-xs font-medium last:border-r-0 sm:text-sm">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(events, day)
          const isCurrentMonth = day.getMonth() === currentDate.getMonth()
          const isToday = day.toDateString() === new Date().toDateString()

          return (
            <div
              key={index}
              className={cn(
                'min-h-16 touch-manipulation border-b border-r p-1 transition-colors last:border-r-0',
                'sm:min-h-20 md:min-h-24',
                'sm:p-1.5 md:p-2',
                !isCurrentMonth && 'bg-muted/30',
                'hover:bg-accent/50 active:bg-accent/70',
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(day)}
            >
              <div
                className={cn(
                  'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  'sm:h-6 sm:w-6 sm:text-sm',
                  'md:h-7 md:w-7 md:text-sm',
                  isToday && 'bg-primary font-semibold text-primary-foreground',
                )}
              >
                {day.getDate()}
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                {dayEvents.slice(0, window.innerWidth < 640 ? 2 : 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEventClick={onEventClick}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    getColorClasses={getColorClasses}
                    variant="compact"
                  />
                ))}
                {dayEvents.length > (window.innerWidth < 640 ? 2 : 3) && (
                  <div className="truncate text-[9px] text-muted-foreground sm:text-[10px] md:text-xs">
                    +{dayEvents.length - (window.innerWidth < 640 ? 2 : 3)} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
