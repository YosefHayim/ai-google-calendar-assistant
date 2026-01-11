'use client'

import { useState } from 'react'
import {
  AlignLeft,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  Hourglass,
  Info,
  Link as LinkIcon,
  MapPin,
  RefreshCw,
  User,
  Users,
  X,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format, formatDistanceStrict } from 'date-fns'

import type { EventDetailsDialogProps } from '@/types/analytics'
import React from 'react'
import { RescheduleDialog } from '@/components/dashboard/RescheduleDialog'

const EventDetailsDialog: React.FC<EventDetailsDialogProps> = ({
  isOpen,
  event,
  calendarColor,
  calendarName,
  onClose,
}) => {
  const [showReschedule, setShowReschedule] = useState(false)

  if (!event) return null

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A'
    return format(new Date(dateStr), 'PP p') // e.g., Nov 29, 2023 10:00 AM
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return { text: '#10b981', bg: '#10b98120' }
      case 'tentative':
        return { text: '#f59e0b', bg: '#f59e0b20' }
      case 'cancelled':
        return { text: '#ef4444', bg: '#ef444420' }
      default:
        return { text: '#71717a', bg: '#71717a20' }
    }
  }

  const statusStyle = getStatusColor(event.status)

  // Handle Shadcn's onOpenChange
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-xl w-full p-0 overflow-hidden gap-0 border-none shadow-xl"
        // Applying the dynamic border color to the top of the modal content
        style={{ borderTop: `4px solid ${calendarColor}` }}
      >
        {/* Scrollable Container */}
        <div className="max-h-[85vh] overflow-y-auto p-6 space-y-6">
          {/* Header Section */}
          <DialogHeader className="p-0 space-y-0 text-left">
            <div className="flex items-start gap-4 pr-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: `${calendarColor}20` }}
              >
                <CalendarDays className="w-6 h-6" style={{ color: calendarColor }} />
              </div>
              <div className="space-y-1.5">
                <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {event.summary || 'No Title'}
                </DialogTitle>

                <div className="flex flex-wrap gap-2 items-center">
                  {calendarName && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider"
                      style={{
                        color: calendarColor,
                        borderColor: `${calendarColor}40`,
                        backgroundColor: `${calendarColor}10`,
                      }}
                    >
                      {calendarName}
                    </span>
                  )}
                  {event.status && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider flex items-center gap-1"
                      style={{
                        color: statusStyle.text,
                        borderColor: `${statusStyle.text}40`,
                        backgroundColor: statusStyle.bg,
                      }}
                    >
                      {event.status === 'confirmed' ? (
                        <Check size={14} />
                      ) : event.status === 'tentative' ? (
                        <Clock size={14} />
                      ) : (
                        <X size={14} />
                      )}
                      {event.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Primary Info Grid (Time & Location) */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
            {/* Time Range */}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-5 flex justify-center">
                <CalendarClock className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-zinc-700 dark:text-zinc-300 font-medium">
                <span>{formatDate(event.start.dateTime || event.start.date)}</span>
                <ArrowRight className="w-3 h-3 text-zinc-400 hidden sm:block" />
                <span className="sm:hidden text-xs text-zinc-400">to</span>
                <span>{formatDate(event.end.dateTime || event.end.date)}</span>
              </div>
            </div>

            {/* Duration & Timezone */}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-5 flex justify-center">
                <Hourglass className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <span>
                  {formatDistanceStrict(
                    new Date(event.start.dateTime || event.start.date || ''),
                    new Date(event.end.dateTime || event.end.date || ''),
                  )}
                </span>
                {event.start.timeZone && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                    {event.start.timeZone}
                  </span>
                )}
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3 text-sm pt-1">
                <div className="w-5 flex justify-center mt-0.5">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                </div>
                <a
                  href={`https://maps.google.com/?q=$?q=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-primary underline decoration-dotted underline-offset-4"
                >
                  {event.location}
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="flex gap-3">
              <div className="w-5 flex justify-center shrink-0 mt-1">
                <AlignLeft className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: event.description }} />
              </div>
            </div>
          )}

          {/* People Section */}
          {(event.organizer || (event.attendees && event.attendees.length > 0)) && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-4">
              {event.organizer && (
                <div className="flex items-center gap-3">
                  <div className="w-5 flex justify-center">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="text-sm w-auto overflow-hidden">
                    <span className="text-zinc-500 dark:text-zinc-500 text-xs uppercase font-bold mr-2">Organizer</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium ">{event.organizer.email}</span>
                  </div>
                </div>
              )}

              {event.attendees && event.attendees.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-5 flex justify-center mt-1">
                    <Users className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-zinc-500 dark:text-zinc-500 text-xs uppercase font-bold mb-2">
                      Attendees ({event.attendees.length})
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                      {event.attendees.map((attendee, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm bg-zinc-50 dark:bg-zinc-800/50 rounded px-2 py-1.5"
                        >
                          <span
                            className="text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]"
                            title={attendee.email}
                          >
                            {attendee.email}
                          </span>
                          {attendee.responseStatus && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                                attendee.responseStatus === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : attendee.responseStatus === 'declined'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                    : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                              }`}
                            >
                              {attendee.responseStatus}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              {event.created && (
                <div className="flex items-center gap-1" title="Date Created">
                  <Info size={12} />
                  <span>Created {format(new Date(event.created), 'MMM d')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReschedule(true)}
                className="text-xs"
              >
                <RefreshCw size={12} className="mr-1.5" />
                Reschedule
              </Button>

              {event.htmlLink && (
                <a
                  href={event.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline transition-colors"
                  style={{ color: calendarColor }}
                >
                  Open in Google Calendar
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Reschedule Dialog */}
      {event.id && (
        <RescheduleDialog
          open={showReschedule}
          onOpenChange={setShowReschedule}
          eventId={event.id}
          eventSummary={event.summary || 'Event'}
          onSuccess={onClose}
        />
      )}
    </Dialog>
  )
}

export default EventDetailsDialog
