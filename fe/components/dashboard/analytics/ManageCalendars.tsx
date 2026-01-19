'use client'

import { CalendarDays, CheckCircle, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { CalendarListEntry } from '@/types/api'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface ManageCalendarsProps {
  calendars: CalendarListEntry[]
  calendarMap: Map<string, { name: string; color: string }>
  onCalendarClick: (calendar: CalendarListEntry) => void
  onCreateCalendar: () => void
  isLoading?: boolean
}

const ManageCalendars: React.FC<ManageCalendarsProps> = ({
  calendars,
  calendarMap,
  onCalendarClick,
  onCreateCalendar,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-background dark:bg-secondary rounded-md shadow-sm p-4 sm:p-6">
        <div className="gap-2 mb-4 sm:mb-6 flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4" />
              <Skeleton className="h-4 sm:h-5 w-28 sm:w-36" />
            </div>
            <Skeleton className="h-3 w-20 sm:w-24 mt-1" />
          </div>
          <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-md flex-shrink-0" />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-md">
              <Skeleton className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0" />
              <Skeleton className="flex-1 h-3 sm:h-4" />
              <Skeleton className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background dark:bg-secondary rounded-md shadow-sm p-4 sm:p-6">
      <div className="gap-2 mb-4 sm:mb-6 flex items-center justify-between">
        {/* Left Side: Text Stack */}
        <div className="min-w-0">
          <h3 className="font-bold text-sm sm:text-base text-foreground dark:text-primary-foreground flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">Managed Calendars</span>
          </h3>
          <div className="text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground mt-0.5 sm:mt-1">
            <span>Total calendars:</span> {calendars?.length}
          </div>
        </div>

        {/* Right Side: Button */}
        <Button
          title="Add new calendar"
          onClick={onCreateCalendar}
          size="icon"
          variant={'ghost'}
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-md border-dashed border-zinc-300 -zinc-700 text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-secondary/30 hover:text-foreground dark:hover:text-primary-foreground transition-all active:scale-[0.98] flex-shrink-0"
        >
          <Plus size={12} className="sm:hidden" />
          <Plus size={14} className="hidden sm:block" />
        </Button>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        {calendars && calendars.length > 0 ? (
          calendars.map((calendar) => {
            const calendarInfo = calendarMap.get(calendar.id)
            const displayName = calendar.summary || calendar.id.split('@')[0]
            const color = calendar.backgroundColor || calendarInfo?.color || '#6366f1'

            return (
              <div
                key={calendar.id}
                className="border-transparent hover:border-black hover:border flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-md hover:bg-muted dark:hover:bg-secondary/50 transition-colors group cursor-pointer"
                style={{ backgroundColor: `${color}08` }}
                onClick={() => {
                  onCalendarClick(calendar)
                }}
              >
                <div
                  className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="flex-1 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {displayName}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded border-emerald-200 -emerald-800 uppercase tracking-tighter flex-shrink-0">
                  <CheckCircle size={10} className="sm:hidden" />
                  <CheckCircle size={12} className="hidden sm:block" />
                </span>
              </div>
            )
          })
        ) : (
          <p className="text-xs sm:text-sm text-muted-foreground">No calendars found.</p>
        )}
      </div>
    </div>
  )
}

export default ManageCalendars
