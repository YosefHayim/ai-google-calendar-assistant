'use client'

import { CalendarDays, CheckCircle, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { CalendarListEntry } from '@/types/api'
import React from 'react'

interface ManageCalendarsProps {
  calendars: CalendarListEntry[]
  calendarMap: Map<string, { name: string; color: string }>
  onCalendarClick: (calendar: { id: string; name: string; color: string }) => void
  onCreateCalendar: () => void
}

const ManageCalendars: React.FC<ManageCalendarsProps> = ({
  calendars,
  calendarMap,
  onCalendarClick,
  onCreateCalendar,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6">
      <div className="mb-6 flex items-center justify-between">
        {/* Left Side: Text Stack */}
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-zinc-400" /> Managed Calendars
          </h3>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            <span>Total calendars:</span> {calendars?.length}
          </div>
        </div>

        {/* Right Side: Button */}
        <Button
          title="Add new calendar"
          onClick={onCreateCalendar}
          size="icon"
          variant={'ghost'}
          className="h-8 w-8 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all active:scale-[0.98]"
        >
          <Plus size={14} />
        </Button>
      </div>

      <div className="space-y-2">
        {calendars && calendars.length > 0 ? (
          calendars.map((calendar) => {
            const calendarInfo = calendarMap.get(calendar.id)
            const displayName = calendar.summary || calendar.id.split('@')[0]
            const color = calendar.backgroundColor || calendarInfo?.color || '#6366f1'

            return (
              <div
                key={calendar.id}
                className="border border-transparent hover:border-black hover:border flex items-center gap-3 p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer"
                style={{ backgroundColor: `${color}08` }}
                onClick={() => {
                  onCalendarClick({
                    id: calendar.id,
                    name: displayName,
                    color: color,
                  })
                }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform"
                  style={{ backgroundColor: color }}
                />
                <span className="flex-1 text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {displayName}
                </span>
                <span className=" font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded border border-emerald-200 dark:border-emerald-800 uppercase tracking-tighter">
                  <CheckCircle size={12} />
                </span>
              </div>
            )
          })
        ) : (
          <p className="text-sm text-zinc-500">No calendars found.</p>
        )}
      </div>
    </div>
  )
}

export default ManageCalendars
