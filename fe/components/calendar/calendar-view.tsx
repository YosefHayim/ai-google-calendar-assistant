"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Calendar, type CalendarEvent } from "@/components/ui/calendar";
import { calendarClient } from "@/lib/api/client";
import type { CalendarEvent as ApiCalendarEvent } from "@/lib/api/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get events for the current month and next month
        const now = new Date();
        const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();

        const response = await calendarClient.getFilteredEvents({
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: "startTime",
        });

        if (response.error) {
          throw new Error(response.message || "Failed to fetch events");
        }

        // Transform API events to calendar events
        const calendarEvents: CalendarEvent[] = (response.data || []).map((event: ApiCalendarEvent) => ({
          id: event.id,
          summary: event.summary,
          start: event.start,
          end: event.end,
        }));

        setEvents(calendarEvents);
      } catch (err) {
        console.error("Error fetching calendar events:", err);
        setError(err instanceof Error ? err.message : "Failed to load calendar events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const selectedDateEvents = selectedDate
    ? events.filter((event) => {
        if (!event.start) return false;
        const eventDate = event.start.dateTime ? new Date(event.start.dateTime) : event.start.date ? new Date(event.start.date) : null;
        if (!eventDate) return false;
        return eventDate.toDateString() === selectedDate.toDateString();
      })
    : [];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading calendar events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Calendar</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">View and manage your calendar events</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Calendar events={events} onDateClick={handleDateClick} />
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? `Events on ${selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}`
                  : "Select a date"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateEvents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateEvents.map((event) => (
                      <div key={event.id} className="rounded-lg border p-3">
                        <h3 className="font-semibold">{event.summary || "Untitled Event"}</h3>
                        {event.start?.dateTime && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.start.dateTime).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                        {event.end?.dateTime && event.start?.dateTime && (
                          <p className="text-sm text-muted-foreground">
                            to{" "}
                            {new Date(event.end.dateTime).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No events scheduled for this date.</p>
                )
              ) : (
                <p className="text-sm text-muted-foreground">Click on a date to view events.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
