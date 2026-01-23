'use client'

import type { ColorDefinition, Event } from '../types'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { groupEventsByDate } from '../utils/calendar-utils'

interface ListViewProps {
  events: Event[]
  onEventClick: (event: Event) => void
  getColorClasses: (color: string) => ColorDefinition
}

export function ListView({ events, onEventClick, getColorClasses }: ListViewProps) {
  const groupedEvents = groupEventsByDate(events)
  const sortedEvents = [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  return (
    <Card className="p-3 sm:p-4">
      <div className="space-y-4 sm:space-y-6">
        {Object.entries(groupedEvents).map(([date, dateEvents]) => (
          <div key={date} className="space-y-2 sm:space-y-3">
            <h3 className="px-1 text-xs font-semibold text-muted-foreground sm:text-sm">{date}</h3>
            <div className="space-y-2">
              {dateEvents.map((event) => {
                const colorClasses = getColorClasses(event.color)
                const useHexColor = !!event.hexColor
                const bgStyle = useHexColor ? { backgroundColor: event.hexColor } : undefined
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="group cursor-pointer touch-manipulation rounded-lg border bg-card p-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 hover:scale-[1.01] hover:shadow-md active:scale-[0.99] sm:p-4"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div
                        className={cn('mt-1 h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3', !useHexColor && colorClasses.bg)}
                        style={bgStyle}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold transition-colors group-hover:text-primary sm:text-base">
                              {event.title}
                            </h4>
                            {event.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {event.category && (
                              <Badge variant="secondary" className="text-xs">
                                {event.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground sm:gap-4 sm:text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.startTime.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {event.endTime.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {event.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="h-4 text-[10px] sm:h-5 sm:text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {sortedEvents.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground sm:text-base">No events found</div>
        )}
      </div>
    </Card>
  )
}
