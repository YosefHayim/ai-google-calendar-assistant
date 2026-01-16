'use client'

import { Card } from '@/components/ui/card'
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

  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map((month) => {
          const monthEvents = getEventsForMonth(events, month)
          const days = getMonthDays(month)

          return (
            <div
              key={month.getTime()}
              className="cursor-pointer hover:bg-accent/50 rounded-lg p-2 transition-colors"
              onClick={() => onMonthClick(month)}
            >
              <h3 className="text-sm font-semibold mb-2 text-center">
                {month.toLocaleDateString('en-US', { month: 'short' })}
              </h3>
              <div className="grid grid-cols-7 gap-px text-[8px]">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-muted-foreground font-medium">
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
                        'aspect-square flex flex-col items-center justify-center relative text-[9px]',
                        !isCurrentMonth && 'text-muted-foreground/30',
                        isToday && 'bg-primary text-primary-foreground rounded-full font-bold'
                      )}
                    >
                      {day.getDate()}
                      {eventColors.length > 0 && (
                        <div className="absolute bottom-0 flex gap-px">
                          {eventColors.map((color, i) => (
                            <div
                              key={i}
                              className={cn(
                                'w-1 h-1 rounded-full',
                                typeof color === 'string' && !color.startsWith('#') && color
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
                <div className="mt-1 text-[10px] text-muted-foreground text-center">
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
