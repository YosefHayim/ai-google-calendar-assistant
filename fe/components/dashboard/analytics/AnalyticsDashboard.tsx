"use client";

import { BarChart3, Coffee, Info, RotateCw, Users, Zap } from "lucide-react";
import type { CalendarEvent, CalendarListEntry, EventQueryParams } from "@/types/api";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import React, { useState } from "react";
import { format, subDays } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Extracted components
import ActivityHeatmap from "./ActivityHeatmap";
import AnalyticsDashboardSkeleton from "./AnalyticsDashboardSkeleton";
import { CalendarEventSchema } from "@/types/analytics";
import CalendarEventsDialog from "@/components/dialogs/CalendarEventsDialog";
import CalendarSettingsDialog from "@/components/dialogs/CalendarSettingsDialog";
import CreateCalendarDialog from "@/components/dialogs/CreateCalendarDialog";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
// Dialogs
import EventDetailsDialog from "@/components/dialogs/EventDetailsDialog";
import InsightCard from "./InsightCard";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import KPICardsSection from "./KPICardsSection";
import LeverageGainChart from "./LeverageGainChart";
import ManagedSources from "./ManagedSources";
import RecentOperations from "./RecentOperations";
import TimeAllocationChart from "./TimeAllocationChart";
import type { TimeSavedDataPoint } from "@/types/analytics";
import { calendarsService } from "@/lib/api/services/calendars.service";
import { eventsService } from "@/lib/api/services/events.service";
import { useAnalyticsData } from "@/hooks/queries/analytics";
import type { z } from "zod";

interface AnalyticsDashboardProps {
  isLoading?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ isLoading: initialLoading }) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  // Event details dialog state
  const [selectedEvent, setSelectedEvent] = useState<z.infer<typeof CalendarEventSchema> | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedEventCalendarColor, setSelectedEventCalendarColor] = useState<string>("#6366f1");
  const [selectedEventCalendarName, setSelectedEventCalendarName] = useState<string>("");

  // Create calendar dialog state
  const [isCreateCalendarDialogOpen, setIsCreateCalendarDialogOpen] = useState(false);

  // Calendar settings dialog state
  const [selectedCalendarForSettings, setSelectedCalendarForSettings] = useState<{ id: string; name: string; color: string } | null>(null);
  const [isCalendarSettingsDialogOpen, setIsCalendarSettingsDialogOpen] = useState(false);

  // Calendar events dialog state
  const [isCalendarEventsDialogOpen, setIsCalendarEventsDialogOpen] = useState(false);
  const [selectedCalendarForEvents, setSelectedCalendarForEvents] = useState<{ id: string; name: string; color: string } | null>(null);

  const queryClient = useQueryClient();

  // Fetch calendars to match with events
  const { data: calendarsQueryData, isLoading: isCalendarsLoading } = useQuery({
    queryKey: ["calendars-list"],
    queryFn: async () => {
      const response = await calendarsService.getCalendarList({
        minAccessRole: "owner",
        showDeleted: false,
        showHidden: false,
      });
      if (response.status === "error" || !response.data) {
        throw new Error(response.message || "Failed to fetch calendars");
      }

      // Transform the calendar list items into a Map for quick lookup
      const calendarMap = new Map<string, { name: string; color: string }>();
      const items = response.data.items || [];

      items.forEach((entry) => {
        const calendarId = entry.id;
        const name = entry.summary || calendarId.split("@")[0];
        const color = entry.backgroundColor || "#6366f1";

        calendarMap.set(calendarId, { name, color });
      });

      return {
        calendarMap,
        items,
      };
    },
    retry: false,
  });

  const calendarMap = calendarsQueryData?.calendarMap || new Map<string, { name: string; color: string }>();
  const calendarsData = calendarsQueryData?.items || [];

  // Use the new analytics hook
  const {
    data: processedData,
    comparison,
    isLoading: isAnalyticsLoading,
    isError,
    error,
    refetch,
  } = useAnalyticsData({
    timeMin: date?.from || null,
    timeMax: date?.to || null,
    calendarMap,
    enabled: !!date?.from && !!date?.to,
  });

  // Fetch events for selected calendar in dialog
  const { data: calendarEventsData, isLoading: isCalendarEventsLoading } = useQuery({
    queryKey: ["calendar-events", selectedCalendarForEvents?.id, date?.from, date?.to],
    queryFn: async () => {
      if (!selectedCalendarForEvents || !date?.from || !date?.to) return null;

      const params: EventQueryParams = {
        calendarId: selectedCalendarForEvents.id,
        timeMin: date.from.toISOString(),
        timeMax: date.to.toISOString(),
      };

      const response = await eventsService.getEvents(params);

      if (response.status === "error" || !response.data) {
        throw new Error(response.message || "Failed to fetch events");
      }

      return response.data;
    },
    enabled: isCalendarEventsDialogOpen && !!selectedCalendarForEvents && !!date?.from && !!date?.to,
    retry: false,
  });

  const isLoading = initialLoading || isAnalyticsLoading || isCalendarsLoading;

  // Calculate total hours for selected calendar in dialog
  const calculateCalendarTotalHours = (events: CalendarEvent[]): number => {
    let totalMinutes = 0;
    events.forEach((event) => {
      if (event.start?.dateTime && event.end?.dateTime) {
        const start = new Date(event.start.dateTime);
        const end = new Date(event.end.dateTime);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60);
        totalMinutes += duration;
      }
    });
    return Math.round((totalMinutes / 60) * 10) / 10;
  };

  const calendarEvents = Array.isArray(calendarEventsData) ? calendarEventsData : [];
  const calendarTotalHours = isCalendarEventsDialogOpen ? calculateCalendarTotalHours(calendarEvents) : undefined;

  // Calculate previous period hours for comparison (simplified - would need to fetch previous period)
  const previousPeriodHours = undefined; // TODO: Calculate from comparison data
  const percentageChange = undefined; // TODO: Calculate from comparison data

  const weeklyInsights = [
    {
      icon: Zap,
      title: "Focus Velocity",
      value: "+15%",
      description: "Your deep work output increased this week.",
      color: "amber" as const,
    },
    {
      icon: Users,
      title: "Collaborative Load",
      value: "14h",
      description: "Balanced ratio of talk vs. execution time.",
      color: "sky" as const,
    },
    {
      icon: Coffee,
      title: "Refocus Window",
      value: "22 min",
      description: "Avg. time to resume focus after meetings.",
      color: "emerald" as const,
    },
    {
      icon: BarChart3,
      title: "Task Completion",
      value: "92%",
      description: "Nearly perfect hit rate on scheduled tasks.",
      color: "indigo" as const,
    },
  ];

  const timeSavedData: TimeSavedDataPoint[] = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      day: i + 1,
      date: date.toISOString(),
      hours: 1 + Math.sin(i / 4) * 1.5 + Math.random() * 1 + i * 0.15,
    };
  }).map((d) => ({ ...d, hours: Math.max(0, d.hours) }));

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto w-full p-6 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
          <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error Loading Analytics</h3>
          <p className="text-red-600 dark:text-red-300 text-sm mb-4">{(error as Error)?.message || "Failed to fetch analytics data. Please try again."}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading skeleton state
  if (isLoading) {
    return <AnalyticsDashboardSkeleton />;
  }

  const { totalEvents, totalDurationHours, averageEventDuration, busiestDayHours, calendarBreakdown, recentActivities } = processedData || {
    totalEvents: 0,
    totalDurationHours: 0,
    averageEventDuration: 0,
    busiestDayHours: 0,
    calendarBreakdown: [],
    recentActivities: [],
  };

  return (
    <div className="max-w-7xl mx-auto w-full p-2 animate-in fade-in duration-500 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 space-2-y">
      <header className=" flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex gap-2 items-center">
          <DatePickerWithRange date={date} setDate={setDate} />
          <InteractiveHoverButton
            text="Refresh"
            loadingText="Refreshing..."
            isLoading={isAnalyticsLoading}
            Icon={<RotateCw className="w-4 h-4" />}
            onClick={() => refetch()}
          />
        </div>
      </header>
      <div>
        {date?.from && date?.to && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Your analytics data for dates between {format(date.from, "MMM dd, yyyy")} and {format(date.to, "MMM dd, yyyy")} (
            {Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))} days)
          </p>
        )}
      </div>

      {/* KPI Cards Section */}
      <KPICardsSection
        totalEvents={totalEvents}
        totalDurationHours={totalDurationHours}
        averageEventDuration={averageEventDuration}
        busiestDayHours={busiestDayHours}
        comparison={comparison}
        isLoading={isAnalyticsLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leverage Gain Chart */}
        <LeverageGainChart data={timeSavedData} />

        {/* Intelligence Insights */}
        <div className="lg:col-span-3">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 px-2 flex items-center gap-2">
            Performance Intelligence
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Performance Intelligence</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    AI-powered insights about your productivity patterns, focus velocity, collaborative load, and task completion rates. These metrics help you
                    understand your work habits and optimize your schedule.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {weeklyInsights.map((insight) => (
              <InsightCard key={insight.title} {...insight} />
            ))}
          </div>
        </div>

        {/* Time Mix */}
        <div className="lg:col-span-2">
          <TimeAllocationChart
            data={calendarBreakdown}
            onCalendarClick={(calendarId, calendarName, calendarColor) => {
              setSelectedCalendarForEvents({ id: calendarId, name: calendarName, color: calendarColor });
              setIsCalendarEventsDialogOpen(true);
            }}
          />
        </div>

        {/* Ops & Calendars */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <RecentOperations
            activities={recentActivities}
            onActivityClick={(activity) => {
              if (activity.event) {
                setSelectedEvent(activity.event as z.infer<typeof CalendarEventSchema>);
                setSelectedEventCalendarColor(activity.calendarColor || "#6366f1");
                setSelectedEventCalendarName(activity.calendarName || "");
                setIsEventDialogOpen(true);
              }
            }}
          />

          <ManagedSources
            calendars={calendarsData}
            calendarMap={calendarMap}
            onCalendarClick={(calendar) => {
              setSelectedCalendarForSettings(calendar);
              setIsCalendarSettingsDialogOpen(true);
            }}
            onCreateCalendar={() => setIsCreateCalendarDialogOpen(true)}
          />
        </div>

        {/* Long term heatmap */}
        <div className="lg:col-span-3 mt-4">
          <ActivityHeatmap />
        </div>
      </div>

      {/* Dialogs */}
      <EventDetailsDialog
        isOpen={isEventDialogOpen}
        event={selectedEvent as CalendarEvent | null}
        calendarColor={selectedEventCalendarColor}
        calendarName={selectedEventCalendarName}
        onClose={() => {
          setIsEventDialogOpen(false);
          setSelectedEvent(null);
        }}
      />

      <CalendarEventsDialog
        isOpen={isCalendarEventsDialogOpen}
        calendarId={selectedCalendarForEvents?.id || ""}
        calendarName={selectedCalendarForEvents?.name || ""}
        calendarColor={selectedCalendarForEvents?.color || "#6366f1"}
        dateRange={date?.from && date?.to ? { from: date.from, to: date.to } : undefined}
        events={calendarEvents}
        isLoading={isCalendarEventsLoading}
        totalHours={calendarTotalHours}
        previousPeriodHours={previousPeriodHours}
        percentageChange={percentageChange}
        onClose={() => {
          setIsCalendarEventsDialogOpen(true);
          setSelectedCalendarForEvents(null);
        }}
        onEventClick={(event) => {
          setSelectedEvent(event as z.infer<typeof CalendarEventSchema>);
          setSelectedEventCalendarColor(selectedCalendarForEvents?.color || "#6366f1");
          setSelectedEventCalendarName(selectedCalendarForEvents?.name || "");
          setIsEventDialogOpen(true);
          setIsCalendarEventsDialogOpen(false);
        }}
      />

      <CalendarSettingsDialog
        isOpen={isCalendarSettingsDialogOpen}
        calendarId={selectedCalendarForSettings?.id || ""}
        calendarName={selectedCalendarForSettings?.name || ""}
        calendarColor={selectedCalendarForSettings?.color || "#6366f1"}
        onClose={() => {
          setIsCalendarSettingsDialogOpen(false);
          setSelectedCalendarForSettings(null);
        }}
      />

      <CreateCalendarDialog
        isOpen={isCreateCalendarDialogOpen}
        onClose={() => setIsCreateCalendarDialogOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["calendars-list"] });
        }}
      />
    </div>
  );
};

export default AnalyticsDashboard;
