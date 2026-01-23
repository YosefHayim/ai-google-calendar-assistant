'use client'

import { Calendar, Clock, FileText, MapPin } from 'lucide-react'

import type { ParsedEventData } from '@/types/api'
import React from 'react'

interface EventPreviewProps {
  event: ParsedEventData
  calendarName?: string
}

export const EventPreview: React.FC<EventPreviewProps> = ({ event, calendarName }) => {
  return (
    <div className="mb-3 space-y-2 rounded-lg bg-background bg-secondary p-3 text-left">
      <div className="flex items-start gap-2">
        <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Event</p>
          <p className="truncate text-sm font-medium text-foreground">{event.summary}</p>
        </div>
      </div>
      {(event.date || event.time) && (
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">When</p>
            <p className="text-sm text-foreground">
              {event.date} {event.time && `at ${event.time}`}
              {event.duration && ` (${event.duration})`}
            </p>
          </div>
        </div>
      )}
      {event.location && (
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm text-foreground">{event.location}</p>
          </div>
        </div>
      )}
      {calendarName && (
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Calendar</p>
            <p className="text-sm text-foreground">{calendarName}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventPreview
