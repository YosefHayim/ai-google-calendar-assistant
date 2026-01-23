'use client'

import React from 'react'
import { Calendar, CalendarDays, Clock, Hash } from 'lucide-react'
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

interface DialogHeaderSectionProps {
  calendarName: string
  calendarColor: string
  dateRange?: { from: Date; to: Date }
  totalHours?: number
  filteredHours: number
  filteredCount: number
  totalCount: number
  isFiltering: boolean
}

export function DialogHeaderSection({
  calendarName,
  calendarColor,
  dateRange,
  totalHours,
  filteredHours,
  filteredCount,
  totalCount,
  isFiltering,
}: DialogHeaderSectionProps) {
  const { t } = useTranslation()

  return (
    <DialogHeader className="p-6 pb-2">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: calendarColor, opacity: 0.2 }}
        >
          <CalendarDays size={12} style={{ color: calendarColor }} />
        </div>
        <div className="flex-1 text-left">
          <DialogTitle className="text-xl font-bold text-foreground">{calendarName}</DialogTitle>
          <DialogDescription className="sr-only">Details for {calendarName} events</DialogDescription>

          <div className="flex gap-2 text-xs text-muted-foreground">
            <Calendar size={12} style={{ color: calendarColor }} />
            {dateRange?.from && dateRange?.to
              ? `Events from ${format(dateRange.from, 'MMM dd, yyyy')} to ${format(dateRange.to, 'MMM dd, yyyy')}`
              : 'Events'}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock size={12} style={{ color: calendarColor }} />
            <span>
              {isFiltering
                ? t('dialogs.eventSearch.filteredHours', 'Filtered hours: {{filtered}}h (of {{total}}h)', {
                    filtered: filteredHours.toFixed(1),
                    total: totalHours?.toFixed(1) || '0',
                  })
                : `${t('dialogs.eventSearch.totalHours', 'Total hours')}: ${totalHours?.toFixed(1) || 'N/A'}h`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Hash size={12} style={{ color: calendarColor }} />
            <span>
              {isFiltering
                ? t('dialogs.eventSearch.filteredEvents', 'Filtered events: {{filtered}} (of {{total}})', {
                    filtered: filteredCount,
                    total: totalCount,
                  })
                : `${t('dialogs.eventSearch.totalEvents', 'Total events')}: ${totalCount}`}
            </span>
          </div>
        </div>
      </div>
    </DialogHeader>
  )
}
