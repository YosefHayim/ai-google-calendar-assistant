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
    <div className="bg-background dark:bg-secondary rounded-lg p-3 space-y-2 mb-3 text-left">
      <div className="flex items-start gap-2">
        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Event</p>
          <p className="text-sm font-medium text-foreground dark:text-primary-foreground truncate">{event.summary}</p>
        </div>
      </div>
      {(event.date || event.time) && (
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">When</p>
            <p className="text-sm text-foreground dark:text-primary-foreground">
              {event.date} {event.time && `at ${event.time}`}
              {event.duration && ` (${event.duration})`}
            </p>
          </div>
        </div>
      )}
      {event.location && (
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm text-foreground dark:text-primary-foreground">{event.location}</p>
          </div>
        </div>
      )}
      {calendarName && (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Calendar</p>
            <p className="text-sm text-foreground dark:text-primary-foreground">{calendarName}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventPreview
