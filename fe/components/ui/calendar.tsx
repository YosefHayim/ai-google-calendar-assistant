"use client";

import * as React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isSameDay, isSameMonth, startOfMonth, subMonths } from "date-fns";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id?: string;
  summary?: string | null;
  start?: {
    date?: string;
    dateTime?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
  };
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  className?: string;
}

export function Calendar({ events = [], onDateClick, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = getDay(monthStart);
  const lastDayOfWeek = getDay(monthEnd);

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      if (!event.start) return false;
      const eventDate = event.start.dateTime ? new Date(event.start.dateTime) : event.start.date ? new Date(event.start.date) : null;
      if (!eventDate) return false;
      return isSameDay(eventDate, date);
    });
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get days from previous month to fill the first week
  const previousMonthDays: Date[] = [];
  if (firstDayOfWeek > 0) {
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setDate(0); // Last day of previous month
    const daysToShow = firstDayOfWeek;
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(prevMonthEnd);
      date.setDate(prevMonthEnd.getDate() - i);
      previousMonthDays.push(date);
    }
  }

  // Get days from next month to fill the last week
  const nextMonthDays: Date[] = [];
  const daysNeeded = 6 - lastDayOfWeek;
  if (daysNeeded > 0) {
    const nextMonthStart = new Date(monthEnd);
    nextMonthStart.setDate(monthEnd.getDate() + 1);
    for (let i = 0; i < daysNeeded; i++) {
      const date = new Date(nextMonthStart);
      date.setDate(nextMonthStart.getDate() + i);
      nextMonthDays.push(date);
    }
  }

  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={previousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px border-t bg-muted">
        {weekDays.map((day) => (
          <div key={day} className="bg-background p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {previousMonthDays.map((date) => {
          const dayEvents = getEventsForDate(date);
          return (
            <div key={`prev-${date.getDate()}`} className="min-h-[80px] bg-muted/30 p-1 text-sm text-muted-foreground">
              <div className="text-center">{format(date, "d")}</div>
            </div>
          );
        })}

        {daysInMonth.map((date) => {
          const dayEvents = getEventsForDate(date);
          const isToday = isSameDay(date, new Date());
          return (
            <div
              key={date.toISOString()}
              className={cn("min-h-[80px] bg-background p-1 transition-colors hover:bg-accent", isToday && "bg-accent")}
              onClick={() => onDateClick?.(date)}
            >
              <div className={cn("text-center text-sm font-medium", isToday && "text-primary")}>{format(date, "d")}</div>
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <div key={event.id || Math.random()} className="truncate rounded bg-primary/10 px-1 text-xs text-primary" title={event.summary || undefined}>
                    {event.summary}
                  </div>
                ))}
                {dayEvents.length > 3 && <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>}
              </div>
            </div>
          );
        })}

        {nextMonthDays.map((date) => {
          const dayEvents = getEventsForDate(date);
          return (
            <div key={`next-${date.getDate()}`} className="min-h-[80px] bg-muted/30 p-1 text-sm text-muted-foreground">
              <div className="text-center">{format(date, "d")}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
