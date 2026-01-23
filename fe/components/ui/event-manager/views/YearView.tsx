'use client'

import { CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import type { Event, ColorDefinition } from '../types'
import { getEventsForMonth, getMonthDays, getEventColorsForDay } from '../utils/calendar-utils'

interface YearViewProps {
  currentDate: Date
  events: Event[]
  onEventClick: (event: Event) => void
  onMonthClick: (month: Date) => void
  getColorClasses: (color: string) => ColorDefinition
}

export function YearView({ currentDate, events, onEventClick, onMonthClick, getColorClasses }: YearViewProps) {
  const year = currentDate.getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1))
  const hasNoEvents = events.length === 0

  return (
    <Card className="relative p-4">
      {hasNoEvents && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
          <EmptyState
            icon={<CalendarDays />}
            title="No events this year"
            description="Start scheduling to see events on your calendar."
            size="lg"
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {months.map((month) => {
          const monthEvents = getEventsForMonth(events, month)
          const days = getMonthDays(month)

          return (
            <div
              key={month.getTime()}
              className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-accent/50"
              onClick={() => onMonthClick(month)}
            >
              <h3 className="mb-2 text-center text-sm font-semibold">
                {month.toLocaleDateString('en-US', { month: 'short' })}
              </h3>
              <div className="grid grid-cols-7 gap-px text-[8px]">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
                {days.slice(0, 35).map((day, idx) => {
                  const isCurrentMonth = day.getMonth() === month.getMonth()
                  const isToday = day.toDateString() === new Date().toDateString() && isCurrentMonth
                  const eventColors = isCurrentMonth ? getEventColorsForDay(day, monthEvents, getColorClasses) : []

                  return (
                    <div
                      key={idx}
                      className={cn(
                        'relative flex aspect-square flex-col items-center justify-center text-[9px]',
                        !isCurrentMonth && 'text-muted-foreground/30',
                        isToday && 'rounded-full bg-primary font-bold text-primary-foreground',
                      )}
                    >
                      {day.getDate()}
                      {eventColors.length > 0 && (
                        <div className="absolute bottom-0 flex gap-px">
                          {eventColors.map((color, i) => (
                            <div
                              key={i}
                              className={cn(
                                'h-1 w-1 rounded-full',
                                typeof color === 'string' && !color.startsWith('#') && color,
                              )}
                              style={color.startsWith('#') ? { backgroundColor: color } : undefined}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {monthEvents.length > 0 && (
                <div className="mt-1 text-center text-[10px] text-muted-foreground">
                  {monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
