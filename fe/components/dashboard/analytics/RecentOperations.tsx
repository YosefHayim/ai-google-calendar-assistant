"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info, ListChecks } from "lucide-react";

import type { ProcessedActivity } from "@/types/analytics";
import React from "react";

interface RecentOperationsProps {
  activities: ProcessedActivity[];
  onActivityClick: (activity: ProcessedActivity) => void;
}

const RecentOperations: React.FC<RecentOperationsProps> = ({ activities, onActivityClick }) => {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex-1">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-zinc-400" /> Recent Operations
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                <Info className="w-3 h-3" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Recent Operations</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  A real-time feed of your most recent calendar events and activities. Click on any item to view detailed information about the event.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </h3>
        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">
          Real-time
        </span>
      </div>
      <ul className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, i) => {
            const Icon = activity.icon;
            return (
              <li
                key={i}
                className="border border-transparent hover:border-black hover:border flex items-start gap-3 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-md p-2 -m-2 transition-colors"
                data-calendar-id={activity.calendarId || ""}
                onClick={() => onActivityClick(activity)}
              >
                <div
                  className="w-8 h-8 rounded-md group-hover:opacity-80 transition-opacity flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: activity.calendarColor || "#6366f1", opacity: 0.2 }}
                >
                  <Icon className="w-4 h-4" style={{ color: activity.calendarColor || "#6366f1" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">{activity.action}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{activity.time}</p>
                    {activity.calendarName && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                        style={{
                          color: activity.calendarColor || "#6366f1",
                          borderColor: activity.calendarColor || "#6366f1",
                          backgroundColor: `${activity.calendarColor || "#6366f1"}15`,
                        }}
                      >
                        {activity.calendarName}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })
        ) : (
          <p className="text-sm text-zinc-500">No recent activities found for this period.</p>
        )}
      </ul>
    </div>
  );
};

export default RecentOperations;
