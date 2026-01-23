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
      <div className="rounded-md bg-background bg-secondary p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-28 sm:h-5 sm:w-36" />
            </div>
            <Skeleton className="mt-1 h-3 w-20 sm:w-24" />
          </div>
          <Skeleton className="h-7 w-7 flex-shrink-0 rounded-md sm:h-8 sm:w-8" />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-md p-1.5 sm:gap-3 sm:p-2">
              <Skeleton className="h-2 w-2 flex-shrink-0 rounded-full sm:h-2.5 sm:w-2.5" />
              <Skeleton className="h-3 flex-1 sm:h-4" />
              <Skeleton className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md bg-background bg-secondary p-4 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6">
        {/* Left Side: Text Stack */}
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground sm:text-base">
            <CalendarDays className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground sm:h-4 sm:w-4" />
            <span className="truncate">Managed Calendars</span>
          </h3>
          <div className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-xs">
            <span>Total calendars:</span> {calendars?.length}
          </div>
        </div>

        {/* Right Side: Button */}
        <Button
          title="Add new calendar"
          onClick={onCreateCalendar}
          size="icon"
          variant={'ghost'}
          className="h-7 w-7 flex-shrink-0 rounded-md border-dashed border-muted text-muted-foreground transition-all hover:bg-muted hover:bg-secondary/30 hover:text-foreground hover:text-primary-foreground active:scale-[0.98] sm:h-8 sm:w-8"
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
            const isHexColor = color.startsWith('#')
            const bgColor = isHexColor ? `${color}08` : 'transparent'

            return (
              <div
                key={calendar.id}
                className="group flex cursor-pointer items-center gap-2 rounded-md border-transparent p-1.5 transition-colors hover:border hover:border-black hover:bg-muted hover:bg-secondary/50 sm:gap-3 sm:p-2"
                style={{ backgroundColor: bgColor }}
                onClick={() => {
                  onCalendarClick(calendar)
                }}
              >
                <div
                  className="h-2 w-2 flex-shrink-0 rounded-full shadow-sm transition-transform group-hover:scale-125 sm:h-2.5 sm:w-2.5"
                  style={{ backgroundColor: color }}
                />
                <span className="flex-1 truncate text-xs font-bold text-foreground text-muted-foreground sm:text-sm">
                  {displayName}
                </span>
                <span className="bg-primary/10/30 flex-shrink-0 rounded border-primary/20 font-bold uppercase tracking-tighter text-primary">
                  <CheckCircle size={10} className="sm:hidden" />
                  <CheckCircle size={12} className="hidden sm:block" />
                </span>
              </div>
            )
          })
        ) : (
          <p className="text-xs text-muted-foreground sm:text-sm">No calendars found.</p>
        )}
      </div>
    </div>
  )
}

export default ManageCalendars
