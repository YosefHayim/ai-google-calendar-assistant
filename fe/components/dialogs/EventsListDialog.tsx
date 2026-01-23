'use client'

import { Calendar, CalendarDays, Clock, ExternalLink, Hash, Hourglass } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { formatDate, formatDuration, formatHours, formatTimeRange } from '@/lib/formatUtils'

import { EmptyState } from '@/components/ui/empty-state'
import type { PatternEventSummary } from '@/types/analytics'
import { cn } from '@/lib/utils'

export interface EventsListDialogProps {
  isOpen: boolean
  title: string
  subtitle?: string
  events: PatternEventSummary[]
  onClose: () => void
}

function handleEventClick(htmlLink: string | undefined) {
  if (htmlLink) {
    window.open(htmlLink, '_blank', 'noopener,noreferrer')
  }
}

function calculateTotalHours(events: PatternEventSummary[]): number {
  return events.reduce((acc, event) => acc + event.durationMinutes / 60, 0)
}

const EventsListDialog: React.FC<EventsListDialogProps> = ({ isOpen, title, subtitle, events, onClose }) => {
  const totalHours = calculateTotalHours(events)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        <div className="h-1 w-full shrink-0 bg-primary" />

        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/20">
              <CalendarDays size={20} className="text-primary" />
            </div>
            <div className="flex-1 text-left">
              <DialogTitle className="text-xl font-bold text-foreground">{title}</DialogTitle>
              <DialogDescription className="sr-only">Events for {title}</DialogDescription>
              {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}

              <div className="mt-2 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash size={12} className="text-primary" />
                  <span>
                    {events.length} event{events.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hourglass size={12} className="text-primary" />
                  <span>Total: {formatHours(totalHours)}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-0">
          {events.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={50} />}
              title="No events"
              description="No events found for this period."
            />
          ) : (
            <ul className="space-y-2">
              {events.map((event) => (
                <li
                  key={event.id}
                  onClick={() => handleEventClick(event.htmlLink)}
                  className={cn(
                    'group flex items-start gap-3 rounded-lg bg-muted bg-secondary/50 p-3 transition-colors',
                    event.htmlLink && 'cursor-pointer hover:bg-secondary',
                  )}
                >
                  <div
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${event.calendarColor}20` }}
                  >
                    <CalendarDays size={16} style={{ color: event.calendarColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="flex-1 truncate text-sm font-semibold text-foreground">{event.summary}</p>
                      {event.htmlLink && (
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays size={12} />
                        <span>{formatDate(event.eventDate, 'WEEKDAY_SHORT')}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>{formatTimeRange(event.startTime, event.endTime)}</span>
                      </div>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Hourglass size={12} />
                        <span className="font-medium">{formatDuration(event.durationMinutes)}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        <span className="max-w-[150px] truncate">{event.calendarName}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EventsListDialog
