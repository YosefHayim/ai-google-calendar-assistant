"use client";

import React from "react";
import { X, CalendarDays, Info, Loader2 } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useCalendarById } from "@/hooks/queries/calendars/useCalendarById";
import type { CalendarSettingsDialogProps } from "@/types/analytics";

const CalendarSettingsDialog: React.FC<CalendarSettingsDialogProps> = ({ isOpen, calendarId, calendarName, calendarColor, onClose }) => {
  const { data: calendar, isLoading } = useCalendarById({
    id: calendarId,
    enabled: isOpen && !!calendarId,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ borderTop: `4px solid ${calendarColor}` }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: calendarColor, opacity: 0.2 }}>
                <CalendarDays className="w-5 h-5" style={{ color: calendarColor }} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{calendarName}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Calendar Settings</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  Calendar ID
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p className="font-medium mb-1">Unique Calendar Identifier</p>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        A unique ID assigned by Google Calendar to identify this calendar. Used internally for API calls and syncing.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono break-all">{calendarId}</p>
              </div>

              {calendar && (
                <>
                  {calendar.calendarDescription && (
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                        Description
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64 text-xs">
                            <p className="font-medium mb-1">Calendar Description</p>
                            <p className="text-zinc-500 dark:text-zinc-400">A user-defined description explaining the purpose or content of this calendar.</p>
                          </HoverCardContent>
                        </HoverCard>
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{calendar.calendarDescription}</p>
                    </div>
                  )}

                  {calendar.calendarLocation && (
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                        Location
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64 text-xs">
                            <p className="font-medium mb-1">Calendar Location</p>
                            <p className="text-zinc-500 dark:text-zinc-400">
                              The geographic location associated with this calendar. Useful for region-specific calendars.
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{calendar.calendarLocation}</p>
                    </div>
                  )}

                  {calendar.timeZoneForCalendar && (
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                        Timezone
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64 text-xs">
                            <p className="font-medium mb-1">Calendar Timezone</p>
                            <p className="text-zinc-500 dark:text-zinc-400">
                              The default timezone for events in this calendar. All-day events and recurring events use this timezone.
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{calendar.timeZoneForCalendar}</p>
                    </div>
                  )}

                  {calendar.accessRole && (
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                        Access Role
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64 text-xs">
                            <p className="font-medium mb-1">Your Access Level</p>
                            <p className="text-zinc-500 dark:text-zinc-400">
                              Your permission level: <strong>Owner</strong> (full control), <strong>Writer</strong> (edit events), <strong>Reader</strong> (view
                              only), or <strong>FreeBusyReader</strong> (availability only).
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">{calendar.accessRole}</p>
                    </div>
                  )}

                  {calendar.dataOwner && (
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                        Data Owner
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-64 text-xs">
                            <p className="font-medium mb-1">Calendar Data Owner</p>
                            <p className="text-zinc-500 dark:text-zinc-400">The email address of the Google account that owns this calendar&apos;s data.</p>
                          </HoverCardContent>
                        </HoverCard>
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{calendar.dataOwner}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                      Color
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64 text-xs">
                          <p className="font-medium mb-1">Display Color</p>
                          <p className="text-zinc-500 dark:text-zinc-400">
                            The color used to display this calendar and its events in the UI. Helps distinguish between multiple calendars.
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: calendarColor }} />
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">{calendarColor}</p>
                    </div>
                  </div>
                </>
              )}

              {!calendar && !isLoading && <p className="text-sm text-zinc-500 text-center py-4">No additional settings available for this calendar.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarSettingsDialog;
