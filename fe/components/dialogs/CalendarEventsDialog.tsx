"use client";

import { CalendarDays, Clock, X } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import type { CalendarEvent } from "@/types/api";
import type { CalendarEventsDialogProps } from "@/types/analytics";
import { Loader2 } from "lucide-react";
import React from "react";
import { format } from "date-fns";

const TrendBadge: React.FC<{ direction: "up" | "down" | "neutral"; percentage: number }> = ({ direction, percentage }) => {
  if (direction === "neutral") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500">
        <Minus className="w-3 h-3" />
        <span>0%</span>
      </span>
    );
  }

  const isPositive = direction === "up";
  const colorClass = isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
  const bgClass = isPositive ? "bg-emerald-50 dark:bg-emerald-900/30" : "bg-rose-50 dark:bg-rose-900/30";
  const borderClass = isPositive ? "border-emerald-200 dark:border-emerald-800" : "border-rose-200 dark:border-rose-800";

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-bold ${colorClass} ${bgClass} ${borderClass}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{Math.abs(percentage).toFixed(1)}%</span>
    </span>
  );
};

const CalendarEventsDialog: React.FC<CalendarEventsDialogProps> = ({
  isOpen,
  calendarId,
  calendarName,
  calendarColor,
  dateRange,
  events,
  isLoading,
  totalHours,
  previousPeriodHours,
  percentageChange,
  onClose,
  onEventClick,
}) => {
  if (!isOpen) return null;

  const getEventDuration = (event: CalendarEvent): string => {
    if (!event.start || !event.end) return "N/A";

    const start = event.start.dateTime ? new Date(event.start.dateTime) : event.start.date ? new Date(event.start.date) : null;
    const end = event.end.dateTime ? new Date(event.end.dateTime) : event.end.date ? new Date(event.end.date) : null;

    if (!start || !end) return "N/A";

    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    if (durationHours < 1) {
      const minutes = Math.round(durationMs / (1000 * 60));
      return `${minutes}m`;
    }
    return `${durationHours.toFixed(1)}h`;
  };

  const formatEventTime = (event: CalendarEvent): string => {
    if (!event.start) return "N/A";

    if (event.start.dateTime) {
      return format(new Date(event.start.dateTime), "MMM dd, yyyy 'at' h:mm a");
    }
    if (event.start.date) {
      return format(new Date(event.start.date), "MMM dd, yyyy");
    }
    return "N/A";
  };

  // Calculate trend direction
  const trendDirection = percentageChange !== undefined ? (percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "neutral") : undefined;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-3xl w-full relative max-h-[90vh] overflow-y-auto"
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
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {dateRange?.from && dateRange?.to
                    ? `Events from ${format(dateRange.from, "MMM dd, yyyy")} to ${format(dateRange.to, "MMM dd, yyyy")}`
                    : "Events"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total hours: {totalHours?.toFixed(1) || "N/A"}h</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="w-12 h-12 text-zinc-400 mb-4" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No events found for this calendar in the selected date range.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {[...events]
                .sort((a, b) => {
                  const aStart = a.start?.dateTime ? new Date(a.start.dateTime).getTime() : a.start?.date ? new Date(a.start.date).getTime() : 0;
                  const bStart = b.start?.dateTime ? new Date(b.start.dateTime).getTime() : b.start?.date ? new Date(b.start.date).getTime() : 0;
                  return aStart - bStart;
                })
                .map((event) => {
                  const eventTime = formatEventTime(event);
                  const duration = getEventDuration(event);
                  const statusColor = event.status === "confirmed" ? "#10b981" : event.status === "tentative" ? "#f59e0b" : "#ef4444";

                  return (
                    <HoverCard key={event.id}>
                      <HoverCardTrigger asChild>
                        <li
                          className="flex items-start gap-3 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-md p-3 -m-3 transition-colors"
                          onClick={() => onEventClick(event)}
                        >
                          <div
                            className="w-8 h-8 rounded-md group-hover:opacity-80 transition-opacity flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: calendarColor, opacity: 0.2 }}
                          >
                            <CalendarDays className="w-4 h-4" style={{ color: calendarColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">{event.summary || "No Title"}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <p className="text-[10px] text-zinc-400 font-bold uppercase">{eventTime}</p>
                              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">•</span>
                              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">{duration}</span>
                              {event.status && (
                                <>
                                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">•</span>
                                  <span
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                                    style={{
                                      color: statusColor,
                                      borderColor: statusColor,
                                      backgroundColor: `${statusColor}15`,
                                    }}
                                  >
                                    {event.status}
                                  </span>
                                </>
                              )}
                            </div>
                            {event.location && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{event.location}</p>}
                          </div>
                        </li>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{event.summary || "No Title"}</h4>
                          <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>{eventTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>Duration: {duration}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            {event.status && (
                              <div className="flex items-center gap-2">
                                <span>Status: {event.status}</span>
                              </div>
                            )}
                            {event.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2">{event.description}</p>}
                          </div>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-2 italic">Click to view full details</p>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarEventsDialog;
