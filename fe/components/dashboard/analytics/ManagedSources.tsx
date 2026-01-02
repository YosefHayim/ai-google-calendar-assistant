"use client";

import React from "react";
import { CalendarDays } from "lucide-react";
import type { CalendarListEntry } from "@/types/api";

interface ManagedSourcesProps {
  calendars: CalendarListEntry[];
  calendarMap: Map<string, { name: string; color: string }>;
  onCalendarClick: (calendar: { id: string; name: string; color: string }) => void;
  onCreateCalendar: () => void;
}

const ManagedSources: React.FC<ManagedSourcesProps> = ({ calendars, calendarMap, onCalendarClick, onCreateCalendar }) => {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6">
      <div className="mb-6">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-zinc-400" /> Managed Sources
        </h3>
      </div>
      <div className="space-y-3">
        {calendars && calendars.length > 0 ? (
          calendars.map((calendar) => {
            const calendarInfo = calendarMap.get(calendar.id);
            const displayName = calendar.summary || calendar.id.split("@")[0];
            const color = calendar.backgroundColor || calendarInfo?.color || "#6366f1";

            return (
              <div
                key={calendar.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 group cursor-pointer"
                style={{ backgroundColor: `${color}08` }}
                onClick={() => {
                  onCalendarClick({
                    id: calendar.id,
                    name: displayName,
                    color: color,
                  });
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform" style={{ backgroundColor: color }} />
                <span className="flex-1 text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{displayName}</span>
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 uppercase tracking-tighter">
                  Active
                </span>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-zinc-500">No calendars found.</p>
        )}
      </div>
      <button
        onClick={onCreateCalendar}
        className="w-full mt-6 py-2 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900/30 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all active:scale-[0.98]"
      >
        Create new calendar
      </button>
    </div>
  );
};

export default ManagedSources;
