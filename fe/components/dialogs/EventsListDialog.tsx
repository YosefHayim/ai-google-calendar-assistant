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
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="h-1 w-full shrink-0 bg-primary" />

        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-primary/20">
              <CalendarDays size={20} className="text-primary" />
            </div>
            <div className="flex-1 text-left">
              <DialogTitle className="text-xl font-bold text-foreground dark:text-primary-foreground">{title}</DialogTitle>
              <DialogDescription className="sr-only">Events for {title}</DialogDescription>
              {subtitle && <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-0.5">{subtitle}</p>}

              <div className="flex flex-wrap gap-4 mt-2">
                <div className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
                  <Hash size={12} className="text-primary" />
                  <span>
                    {events.length} event{events.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
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
                    'flex items-start gap-3 group rounded-lg p-3 bg-muted dark:bg-secondary/50 transition-colors',
                    event.htmlLink && 'cursor-pointer hover:bg-secondary dark:hover:bg-secondary'
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${event.calendarColor}20` }}
                  >
                    <CalendarDays size={16} style={{ color: event.calendarColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate flex-1">
                        {event.summary}
                      </p>
                      {event.htmlLink && (
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground dark:text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-1">
                        <CalendarDays size={12} />
                        <span>{formatDate(event.eventDate, 'WEEKDAY_SHORT')}</span>
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-600">•</span>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        <span>{formatTimeRange(event.startTime, event.endTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-1">
                        <Hourglass size={12} />
                        <span className="font-medium">{formatDuration(event.durationMinutes)}</span>
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-600">•</span>
                      <div className="text-xs text-muted-foreground dark:text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} />
                        <span className="truncate max-w-[150px]">{event.calendarName}</span>
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
