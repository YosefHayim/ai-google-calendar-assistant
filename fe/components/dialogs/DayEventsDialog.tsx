'use client'

import {
  CalendarDays,
  CircleCheckBig,
  CircleX,
  Clock,
  Hash,
  Hourglass,
  Loader2,
  MapPin,
  Sun,
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

import type { CalendarEvent } from '@/types/api'
import React from 'react'
import { format } from 'date-fns'

export interface DayEventsDialogProps {
  isOpen: boolean
  date: string
  availableHours: number
  events: CalendarEvent[]
  calendarMap: Map<string, { name: string; color: string }>
  isLoading?: boolean
  onClose: () => void
  onEventClick: (event: CalendarEvent, calendarColor: string, calendarName: string) => void
}

const WAKING_HOURS_PER_DAY = 16

const DayEventsDialog: React.FC<DayEventsDialogProps> = ({
  isOpen,
  date,
  availableHours,
  events,
  calendarMap,
  isLoading,
  onClose,
  onEventClick,
}) => {
  const busyHours = WAKING_HOURS_PER_DAY - availableHours

  const getEventDuration = (event: CalendarEvent): string => {
    if (!event.start || !event.end) return 'N/A'

    const start = event.start.dateTime
      ? new Date(event.start.dateTime)
      : event.start.date
        ? new Date(event.start.date)
        : null
    const end = event.end.dateTime ? new Date(event.end.dateTime) : event.end.date ? new Date(event.end.date) : null

    if (!start || !end) return 'N/A'

    const durationMs = end.getTime() - start.getTime()
    const durationHours = durationMs / (1000 * 60 * 60)

    if (durationHours < 1) {
      const minutes = Math.round(durationMs / (1000 * 60))
      return `${minutes}m`
    }
    return `${durationHours.toFixed(1)}h`
  }

  const formatEventTime = (event: CalendarEvent): string => {
    if (!event.start) return 'N/A'

    if (event.start.dateTime) {
      return format(new Date(event.start.dateTime), 'h:mm a')
    }
    if (event.start.date) {
      return 'All day'
    }
    return 'N/A'
  }

  const formatEventTimeRange = (event: CalendarEvent): string => {
    if (!event.start || !event.end) return 'N/A'

    if (event.start.dateTime && event.end.dateTime) {
      const start = format(new Date(event.start.dateTime), 'h:mm a')
      const end = format(new Date(event.end.dateTime), 'h:mm a')
      return `${start} - ${end}`
    }
    if (event.start.date) {
      return 'All day'
    }
    return 'N/A'
  }

  const getCalendarInfo = (event: CalendarEvent): { name: string; color: string } => {
    // Try to find calendar info from organizer email
    if (event.organizer?.email) {
      const info = calendarMap.get(event.organizer.email)
      if (info) return info
    }
    return { name: 'Calendar', color: '#6366f1' }
  }

  const formattedDate = date ? format(new Date(date), 'EEEE, MMMM dd, yyyy') : ''

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Decorative Top Border */}
        <div className="h-1 w-full shrink-0 bg-primary" />

        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0 bg-primary/20">
              <Sun size={20} className="text-primary" />
            </div>
            <div className="flex-1 text-left">
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{formattedDate}</DialogTitle>
              <DialogDescription className="sr-only">Events and availability for {formattedDate}</DialogDescription>

              <div className="flex flex-wrap gap-4 mt-2">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Clock size={12} className="text-primary" />
                  <span>Available: {availableHours.toFixed(1)}h</span>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Hourglass size={12} className="text-primary" />
                  <span>Busy: {busyHours.toFixed(1)}h</span>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Hash size={12} className="text-primary" />
                  <span>Events: {events.length}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 24h Timeline Visualization */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Day Overview</span>
          </div>
          <div className="relative h-8 bg-zinc-100 dark:bg-zinc-800 rounded-md overflow-hidden">
            {/* Base available time */}
            <div
              className="absolute inset-y-0 left-0 bg-emerald-100 dark:bg-emerald-900/30"
              style={{ width: '100%' }}
            />
            {/* Event blocks */}
            {events.map((event, index) => {
              if (!event.start?.dateTime || !event.end?.dateTime) return null
              const start = new Date(event.start.dateTime)
              const end = new Date(event.end.dateTime)
              const startHour = start.getHours() + start.getMinutes() / 60
              const endHour = end.getHours() + end.getMinutes() / 60
              const leftPercent = (startHour / 24) * 100
              const widthPercent = ((endHour - startHour) / 24) * 100
              const { color } = getCalendarInfo(event)

              return (
                <div
                  key={event.id || index}
                  className="absolute inset-y-0 opacity-80"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${Math.max(widthPercent, 1)}%`,
                    backgroundColor: color,
                  }}
                  title={event.summary || 'Event'}
                />
              )
            })}
            {/* Hour markers */}
            <div className="absolute inset-0 flex">
              {[6, 12, 18].map((hour) => (
                <div
                  key={hour}
                  className="absolute h-full border-l border-zinc-300 dark:border-zinc-600"
                  style={{ left: `${(hour / 24) * 100}%` }}
                >
                  <span className="absolute -top-5 -translate-x-1/2 text-[10px] text-zinc-400">
                    {hour === 12 ? '12pm' : hour < 12 ? `${hour}am` : `${hour - 12}pm`}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-zinc-400">12am</span>
            <span className="text-[10px] text-zinc-400">12pm</span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Events</h4>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <CalendarDays size={50} className="text-emerald-500 mb-3" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No events scheduled</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                You have {availableHours.toFixed(1)} hours of free time this day.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {[...events]
                .sort((a, b) => {
                  const aStart = a.start?.dateTime
                    ? new Date(a.start.dateTime).getTime()
                    : a.start?.date
                      ? new Date(a.start.date).getTime()
                      : 0
                  const bStart = b.start?.dateTime
                    ? new Date(b.start.dateTime).getTime()
                    : b.start?.date
                      ? new Date(b.start.date).getTime()
                      : 0
                  return aStart - bStart
                })
                .map((event) => {
                  const eventTimeRange = formatEventTimeRange(event)
                  const duration = getEventDuration(event)
                  const { name: calendarName, color: calendarColor } = getCalendarInfo(event)

                  return (
                    <HoverCard key={event.id}>
                      <HoverCardTrigger asChild>
                        <li
                          className="flex items-start gap-3 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-md p-3 -mx-3 transition-colors"
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
                              <div className="text-xs text-zinc-400 font-bold uppercase flex items-center gap-2">
                                <Clock size={12} style={{ color: calendarColor }} />
                                <span>{eventTimeRange}</span>
                              </div>
                              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">•</span>
                              <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Hourglass size={12} style={{ color: calendarColor }} />
                                <span>{duration}</span>
                              </div>
                              {event.status && (
                                <>
                                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">•</span>
                                  <span className="text-xs font-bold px-1.5 py-0.5">
                                    {event.status === 'confirmed' ? (
                                      <CircleCheckBig size={12} className="text-green-500" />
                                    ) : (
                                      <CircleX size={12} className="text-red-500" />
                                    )}
                                  </span>
                                </>
                              )}
                            </div>
                            {event.location && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
                                <MapPin size={10} className="inline mr-1" />
                                {event.location}
                              </p>
                            )}
                          </div>
                        </li>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                            {event.summary || 'No Title'}
                          </h4>
                          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
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
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )
                })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DayEventsDialog
