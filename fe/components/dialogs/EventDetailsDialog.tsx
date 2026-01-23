'use client'

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
import { format, formatDistanceStrict } from 'date-fns'

import { Button } from '@/components/ui/button'
import type { EventDetailsDialogProps } from '@/types/analytics'
import React from 'react'
import { RescheduleDialog } from '@/components/dashboard/RescheduleDialog'
import { sanitizeHtml } from '@/lib/security/sanitize'
import { useState } from 'react'

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
        return { text: 'hsl(var(--primary))', bg: 'hsl(var(--primary) / 0.2)' }
      case 'tentative':
        return { text: 'hsl(var(--secondary))', bg: 'hsl(var(--secondary) / 0.2)' }
      case 'cancelled':
        return { text: 'hsl(var(--destructive))', bg: 'hsl(var(--destructive) / 0.2)' }
      default:
        return { text: 'hsl(var(--muted-foreground))', bg: 'hsl(var(--muted-foreground) / 0.2)' }
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
        className="w-full max-w-xl gap-0 overflow-hidden border-none p-0 shadow-xl"
        // Applying the dynamic border color to the top of the modal content
        style={{ borderTop: `4px solid ${calendarColor}` }}
      >
        {/* Scrollable Container */}
        <div className="max-h-[85vh] space-y-6 overflow-y-auto p-6">
          {/* Header Section */}
          <DialogHeader className="space-y-0 p-0 text-left">
            <div className="flex items-start gap-4 pr-8">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm"
                style={{ backgroundColor: `${calendarColor}20` }}
              >
                <CalendarDays className="h-6 w-6" style={{ color: calendarColor }} />
              </div>
              <div className="space-y-1.5">
                <DialogTitle className="text-xl font-bold leading-tight text-foreground">
                  {event.summary || 'No Title'}
                </DialogTitle>

                <div className="flex flex-wrap items-center gap-2">
                  {calendarName && (
                    <span
                      className="rounded border px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
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
                      className="flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
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
          <div className="space-y-2 rounded-lg border-border bg-muted bg-secondary/50 p-4">
            {/* Time Range */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex w-5 justify-center">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col gap-1 font-medium text-foreground sm:flex-row sm:items-center sm:gap-2">
                <span>{formatDate(event.start.dateTime || event.start.date)}</span>
                <ArrowRight className="hidden h-3 w-3 text-muted-foreground sm:block" />
                <span className="text-xs text-muted-foreground sm:hidden">to</span>
                <span>{formatDate(event.end.dateTime || event.end.date)}</span>
              </div>
            </div>

            {/* Duration & Timezone */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex w-5 justify-center">
                <Hourglass className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>
                  {formatDistanceStrict(
                    new Date(event.start.dateTime || event.start.date || ''),
                    new Date(event.end.dateTime || event.end.date || ''),
                  )}
                </span>
                {event.start.timeZone && (
                  <span className="rounded bg-accent bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                    {event.start.timeZone}
                  </span>
                )}
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3 pt-1 text-sm">
                <div className="mt-0.5 flex w-5 justify-center">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <a
                  href={`https://maps.google.com/?q=$?q=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-primary"
                >
                  {event.location}
                </a>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="flex gap-3">
              <div className="mt-1 flex w-5 shrink-0 justify-center">
                <AlignLeft className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="overflow-hidden whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }} />
              </div>
            </div>
          )}

          {/* People Section */}
          {(event.organizer || (event.attendees && event.attendees.length > 0)) && (
            <div className="space-y-4 border-t border-border pt-4">
              {event.organizer && (
                <div className="flex items-center gap-3">
                  <div className="flex w-5 justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="w-auto overflow-hidden text-sm">
                    <span className="mr-2 text-xs font-bold uppercase text-muted-foreground">Organizer</span>
                    <span className="font-medium text-foreground">{event.organizer.email}</span>
                  </div>
                </div>
              )}

              {event.attendees && event.attendees.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex w-5 justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 text-xs font-bold uppercase text-muted-foreground">
                      Attendees ({event.attendees.length})
                    </div>
                    <div className="custom-scrollbar grid max-h-32 grid-cols-1 gap-2 overflow-y-auto pr-2">
                      {event.attendees.map((attendee, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded bg-muted bg-secondary/50 px-2 py-1.5 text-sm"
                        >
                          <span className="max-w-[200px] truncate text-muted-foreground" title={attendee.email}>
                            {attendee.email}
                          </span>
                          {attendee.responseStatus && (
                            <span
                              className={`rounded px-1.5 py-0.5 text-xs capitalize ${
                                attendee.responseStatus === 'accepted'
                                  ? 'bg-primary/10 text-primary/30'
                                  : attendee.responseStatus === 'declined'
                                    ? 'bg-destructive/10 text-destructive/30'
                                    : 'bg-accent text-muted-foreground'
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
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {event.created && (
                <div className="flex items-center gap-1" title="Date Created">
                  <Info size={12} />
                  <span>Created {format(new Date(event.created), 'MMM d')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowReschedule(true)} className="text-xs">
                <RefreshCw size={12} className="mr-1.5" />
                Reschedule
              </Button>

              {event.htmlLink && (
                <a
                  href={event.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:underline"
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
