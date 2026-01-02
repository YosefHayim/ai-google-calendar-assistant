"use client";

import { Calendar, CalendarDays, Clock, Hourglass, Loader2, MapPin, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

import type { CalendarEvent } from "@/types/api";
import type { CalendarEventsDialogProps } from "@/types/analytics";
import React from "react";
import { format } from "date-fns";

// Helper component (Preserved from your original code)
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* We use 'p-0' and 'gap-0' to control the layout manually since we have a custom 
        top border and want a scrollable list inside.
      */}
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Decorative Top Border using calendar color */}
        <div className="h-1 w-full shrink-0" style={{ backgroundColor: calendarColor }} />

        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: calendarColor, opacity: 0.2 }}>
              <CalendarDays size={12} style={{ color: calendarColor }} />
            </div>
            <div className="flex-1 text-left">
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{calendarName}</DialogTitle>
              {/* Description for accessibility, visually hidden or styled as subtitle */}
              <DialogDescription className="sr-only">Details for {calendarName} events</DialogDescription>

              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex gap-2">
                <Calendar size={12} style={{ color: calendarColor }} />
                {dateRange?.from && dateRange?.to
                  ? `Events from ${format(dateRange.from, "MMM dd, yyyy")} to ${format(dateRange.to, "MMM dd, yyyy")}`
                  : "Events"}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <Clock size={12} style={{ color: calendarColor }} />
                Total hours: {totalHours?.toFixed(1) || "N/A"}h
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <CalendarDays size={50} style={{ color: calendarColor }} />
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
                            style={{
                              backgroundColor: calendarColor,
                              opacity: 0.2,
                            }}
                          >
                            <CalendarDays className="w-4 h-4" style={{ color: calendarColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-1">{event.summary || "No Title"}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <div className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-2">
                                <Clock size={12} style={{ color: calendarColor }} />
                                <span> {eventTime}</span>
                              </div>
                              <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">•</span>
                              <div className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                <Hourglass size={12} style={{ color: calendarColor }} />
                                <span> {duration}</span>
                              </div>
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
                                    <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">{event.status}</span>
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
                              <Hourglass className="w-3 h-3" />
                              <span>Duration: {duration}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3" />
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
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarEventsDialog;
