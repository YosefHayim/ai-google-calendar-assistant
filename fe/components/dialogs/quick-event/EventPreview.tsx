'use client'

import React from 'react'
import { Calendar, Clock, FileText, MapPin } from 'lucide-react'
import type { ParsedEventData } from '@/types/api'

interface EventPreviewProps {
  event: ParsedEventData
  calendarName?: string
}

export const EventPreview: React.FC<EventPreviewProps> = ({ event, calendarName }) => {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-800 space-y-2 mb-3 text-left">
      <div className="flex items-start gap-2">
        <FileText className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-zinc-400">Event</p>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{event.summary}</p>
        </div>
      </div>
      {(event.date || event.time) && (
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-zinc-400">When</p>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">
              {event.date} {event.time && `at ${event.time}`}
              {event.duration && ` (${event.duration})`}
            </p>
          </div>
        </div>
      )}
      {event.location && (
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-zinc-400">Location</p>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">{event.location}</p>
          </div>
        </div>
      )}
      {calendarName && (
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-zinc-400">Calendar</p>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">{calendarName}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventPreview
