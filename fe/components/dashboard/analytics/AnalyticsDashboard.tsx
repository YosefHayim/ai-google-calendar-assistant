"use client";

import {
  BarChart3,
  Brain,
  Briefcase,
  CalendarDays,
  ChevronDown,
  Clock,
  Coffee,
  Dumbbell,
  Info,
  LineChart,
  ListChecks,
  Loader2,
  MessageSquare,
  RotateCw,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import type { CalendarEvent, EventQueryParams } from "@/types/api";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import React, { useEffect, useState } from "react";
import {
  Skeleton,
  SkeletonCalendarSources,
  SkeletonCard,
  SkeletonChart,
  SkeletonDonutChart,
  SkeletonHeatmap,
  SkeletonInsightCard,
  SkeletonLineChart,
  SkeletonList,
} from "@/components/ui/skeleton";
import { addDays, format, subDays } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import ActivityHeatmap from "@/components/dashboard/analytics/ActivityHeatmap";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { ENDPOINTS } from "@/lib/api/endpoints";
import TimeSavedChart from "@/components/dashboard/analytics/TimeSavedChart";
import TimeSavedColumnChart from "@/components/dashboard/analytics/TimeSavedColumnChart";
import { apiClient } from "@/lib/api/client";
import { calendarsService } from "@/lib/api/services/calendars.service";
import { eventsService } from "@/lib/api/services/events.service";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCalendarById } from "@/hooks/queries/calendars/useCalendarById";
import { z } from "zod";

// --- Zod Schema Definitions ---

const CalendarEventSchema = z.object({
  kind: z.string().optional(),
  etag: z.string().optional(),
  id: z.string(),
  status: z.string().optional(),
  htmlLink: z.string().optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  creator: z
    .object({
      email: z.string().optional(),
      self: z.boolean().optional(),
    })
    .optional(),
  organizer: z
    .object({
      email: z.string().optional(),
      self: z.boolean().optional(),
    })
    .optional(),
  start: z.object({
    date: z.string().optional(),
    dateTime: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  end: z.object({
    date: z.string().optional(),
    dateTime: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  recurringEventId: z.string().optional(),
  originalStartTime: z
    .object({
      date: z.string().optional(),
      dateTime: z.string().optional(),
      timeZone: z.string().optional(),
    })
    .optional(),
  iCalUID: z.string().optional(),
  sequence: z.number().optional(),
  attendees: z
    .array(
      z.object({
        email: z.string().optional(),
        organizer: z.boolean().optional(),
        self: z.boolean().optional(),
        responseStatus: z.string().optional(),
      })
    )
    .optional(),
  reminders: z
    .object({
      useDefault: z.boolean().optional(),
    })
    .optional(),
  eventType: z.string().optional(),
});

const CalendarEventsGroupSchema = z.object({
  calendarId: z.string(),
  events: z.array(CalendarEventSchema),
});

const AnalyticsResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    allEvents: z.array(CalendarEventsGroupSchema),
  }),
});

type AnalyticsData = z.infer<typeof AnalyticsResponseSchema>;

// --- Components ---

interface TimeAllocationChartProps {
  data: { category: string; hours: number; color: string; calendarId?: string }[];
  onCalendarClick?: (calendarId: string, calendarName: string, calendarColor: string) => void;
}

const TimeAllocationChart: React.FC<TimeAllocationChartProps> = ({ data, onCalendarClick }) => {
  const totalHours = data.reduce((acc, item) => acc + item.hours, 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 22;
  const defaultColor = "#6366f1";
  let accumulatedPercentage = 0;

  // Helper function to validate and ensure color is a valid hex string
  const getValidColor = (color: string | undefined | null): string => {
    if (!color || typeof color !== "string") return defaultColor;
    // Check if it's a valid hex color (starts with # and has 3 or 6 hex digits)
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return color;
    }
    return defaultColor;
  };

  // Handle case with no data
  if (totalHours === 0) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex items-center justify-center h-full">
        <p className="text-zinc-500">No time allocation data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex flex-col xl:flex-row items-center gap-2">
      <div className="relative w-44 h-44 flex-shrink-0">
        <svg className="w-full h-full" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} className="text-zinc-100 dark:text-zinc-800" />
          {data.map((item, index) => {
            const percentage = item.hours / totalHours;
            const dashArray = percentage * circumference;
            const rotation = accumulatedPercentage * 360;
            accumulatedPercentage += percentage;
            const safeColor = getValidColor(item.color);

            return (
              <motion.circle
                key={item.category}
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke={safeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={circumference}
                style={{ transform: `rotate(${rotation - 90}deg)`, transformOrigin: "center" }}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - dashArray }}
                transition={{ duration: 1, delay: index * 0.15, ease: "easeOut" }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{totalHours.toFixed(1)}h</span>
          <span className="text-xs font-medium text-zinc-500">Tracked</span>
        </div>
      </div>
      <div className="w-full">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          Time Allocation
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                <Info className="w-3 h-3" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Time Allocation</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Visual breakdown of how your time is distributed across different calendars. Each segment represents the total hours spent in that calendar
                  during the selected date range.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </h3>
        <ul className="space-y-2">
          {data.map((item) => {
            const safeColor = getValidColor(item.color);
            return (
              <li
                key={item.category}
                className={`flex items-center gap-3 text-sm rounded-md p-2 -m-2 transition-colors ${
                  onCalendarClick && item.calendarId ? "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/50" : ""
                }`}
                data-calendar-id={item.calendarId || ""}
                style={{ backgroundColor: `${safeColor}10` }}
                onClick={() => {
                  if (onCalendarClick && item.calendarId) {
                    onCalendarClick(item.calendarId, item.category, safeColor);
                  }
                }}
              >
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: safeColor }} />
                <span className="flex-1 font-medium text-zinc-800 dark:text-zinc-200 truncate">{item.category}</span>
                <span className="font-mono text-zinc-500 dark:text-zinc-400">{item.hours.toFixed(1)}h</span>
                <span className="text-xs text-zinc-400 w-10 text-right">{((item.hours / totalHours) * 100).toFixed(0)}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

interface InsightCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  color: "amber" | "sky" | "emerald" | "rose" | "indigo" | "orange";
}

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, title, value, description, color }) => {
  const colorClasses = {
    amber: { bg: "bg-amber-100/50 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-500" },
    sky: { bg: "bg-sky-100/50 dark:bg-sky-900/30", text: "text-sky-600 dark:text-sky-500" },
    emerald: { bg: "bg-emerald-100/50 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-500" },
    rose: { bg: "bg-rose-100/50 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-500" },
    indigo: { bg: "bg-indigo-100/50 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-500" },
    orange: { bg: "bg-orange-100/50 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-500" },
  };
  const selectedColor = colorClasses[color] || colorClasses.amber;

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6 flex flex-col gap-4 transition-all hover:shadow-md hover:-translate-y-1">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 flex items-center justify-center rounded-md shrink-0 ${selectedColor.bg} ${selectedColor.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-zinc-600 dark:text-zinc-400 text-sm">{title}</h3>
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
        <p className="text-sm text-zinc-500 leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
};

interface AnalyticsDashboardProps {
  isLoading?: boolean; // Keep for compatibility if used elsewhere, but we'll use query loading mostly
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
  const [calendarPrompt, setCalendarPrompt] = useState("");
  const [isCreatingCalendar, setIsCreatingCalendar] = useState(false);
  const queryClient = useQueryClient();

  // Calendar settings dialog state
  const [selectedCalendarForSettings, setSelectedCalendarForSettings] = useState<{ id: string; name: string; color: string } | null>(null);
  const [isCalendarSettingsDialogOpen, setIsCalendarSettingsDialogOpen] = useState(false);

  // Calendar events dialog state
  const [isCalendarEventsDialogOpen, setIsCalendarEventsDialogOpen] = useState(false);
  const [selectedCalendarForEvents, setSelectedCalendarForEvents] = useState<{ id: string; name: string; color: string } | null>(null);

  // Chart type state with localStorage persistence
  const [chartType, setChartType] = useState<"line" | "column">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("analytics-chart-type");
      return saved === "line" || saved === "column" ? saved : "column";
    }
    return "column";
  });

  const handleChartTypeChange = (type: "line" | "column") => {
    setChartType(type);
    if (typeof window !== "undefined") {
      localStorage.setItem("analytics-chart-type", type);
    }
  };

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

  const {
    data: analyticsData,
    isLoading: isQueryLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["events-analytics", date?.from, date?.to],
    queryFn: async () => {
      if (!date?.from || !date?.to) return null;

      const params = new URLSearchParams({
        timeMin: date.from.toISOString(),
        timeMax: date.to.toISOString(),
      });

      const response = await apiClient.get(`${ENDPOINTS.EVENTS_ANALYTICS}?${params.toString()}`);

      // Toast the status message
      if (response.data?.status && response.data?.message) {
        if (response.data.status === "success") {
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      }

      // Validate with Zod
      const result = AnalyticsResponseSchema.safeParse(response.data);
      if (!result.success) {
        // Try to handle case where response might be in a different format
        if (response.data?.allEvents && Array.isArray(response.data.allEvents)) {
          const normalizedData = {
            status: response.data.status || "success",
            message: response.data.message || "Events retrieved",
            data: {
              allEvents: response.data.allEvents,
            },
          };
          const retryResult = AnalyticsResponseSchema.safeParse(normalizedData);
          if (retryResult.success) {
            return retryResult.data;
          }
        }

        throw new Error(`Invalid API response format: ${result.error.message}`);
      }

      return result.data;
    },
    enabled: !!date?.from && !!date?.to,
    retry: false,
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

  const isLoading = initialLoading || isQueryLoading || isCalendarsLoading;

  // Process data for charts
  const processData = (data: AnalyticsData | undefined | null) => {
    if (!data) {
      return {
        totalEvents: 0,
        totalDurationHours: 0,
        calendarBreakdown: [],
        recentActivities: [],
      };
    }

    if (!data.data) {
      return {
        totalEvents: 0,
        totalDurationHours: 0,
        calendarBreakdown: [],
        recentActivities: [],
      };
    }

    if (!Array.isArray(data.data.allEvents)) {
      return {
        totalEvents: 0,
        totalDurationHours: 0,
        calendarBreakdown: [],
        recentActivities: [],
      };
    }

    let totalEvents = 0;
    let totalDurationMinutes = 0;
    const calendarDurationMap = new Map<string, { minutes: number; calendarId: string }>();
    const recentActivities: any[] = []; // Using any for simplicity in this transformation

    // Process the new structure: allEvents is now [{ calendarId, events: [...] }]
    data.data.allEvents.forEach((calendarGroup) => {
      // Defensive check: ensure calendarGroup has required properties
      if (!calendarGroup || !calendarGroup.calendarId) return;

      const calendarInfo = calendarMap.get(calendarGroup.calendarId);
      // Get calendar name - prefer from map, otherwise try to extract from ID
      let calendarName: string;
      if (calendarInfo?.name) {
        calendarName = calendarInfo.name;
      } else if (calendarGroup.calendarId.includes("@")) {
        // If it's an email-like ID, use the part before @
        calendarName = calendarGroup.calendarId.split("@")[0];
      } else if (calendarGroup.calendarId.length > 20) {
        // If it's a long hash, use a generic name
        calendarName = `Calendar ${calendarGroup.calendarId.slice(0, 8)}...`;
      } else {
        // Otherwise use the ID as-is (should be rare)
        calendarName = calendarGroup.calendarId;
      }
      const calendarColor = calendarInfo?.color || "#6366f1";

      // Defensive check: ensure events is an array
      if (!Array.isArray(calendarGroup.events)) {
        console.warn(`Calendar ${calendarGroup.calendarId} has invalid events array:`, calendarGroup.events);
        return;
      }

      calendarGroup.events.forEach((event) => {
        // Defensive check: ensure event has required properties
        if (!event || !event.start || !event.end) return;

        totalEvents++;

        // Duration calculation
        if (event.start.dateTime && event.end.dateTime) {
          const start = new Date(event.start.dateTime);
          const end = new Date(event.end.dateTime);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
          totalDurationMinutes += duration;

          // Use calendar name for categorization, but store calendar ID too
          const existing = calendarDurationMap.get(calendarName);
          if (existing) {
            existing.minutes += duration;
          } else {
            calendarDurationMap.set(calendarName, { minutes: duration, calendarId: calendarGroup.calendarId });
          }

          recentActivities.push({
            action: event.summary || "No Title",
            time: new Date(event.start.dateTime).toLocaleDateString(),
            icon: CalendarDays, // Default icon
            timestamp: start.getTime(),
            calendarName,
            calendarId: calendarGroup.calendarId,
            calendarColor,
            event, // Store full event object for details dialog
          });
        }
      });
    });

    // Sort recent activities by time
    recentActivities.sort((a, b) => b.timestamp - a.timestamp);

    // Format calendar breakdown for chart using calendar colors
    const defaultColors = ["#f26306", "#1489b4", "#2d9663", "#6366f1", "#64748b", "#e11d48"];
    const calendarBreakdown = Array.from(calendarDurationMap.entries())
      .map(([calendarName, data], index) => {
        // Get color from calendar map using calendarId (not name, as names might not be unique)
        const calendarInfo = calendarMap.get(data.calendarId);
        let color = calendarInfo?.color || defaultColors[index % defaultColors.length];

        // Ensure color is a valid hex string
        if (!color || typeof color !== "string" || !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
          color = defaultColors[index % defaultColors.length];
        }

        return {
          category: calendarName,
          hours: Math.round((data.minutes / 60) * 10) / 10,
          color,
          calendarId: data.calendarId,
        };
      })
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5); // Top 5

    return {
      totalEvents,
      totalDurationHours: Math.round((totalDurationMinutes / 60) * 10) / 10,
      calendarBreakdown,
      recentActivities: recentActivities.slice(0, 5),
    };
  };

  // Process data with error handling
  const processDataResult = React.useMemo(() => {
    try {
      return processData(analyticsData);
    } catch (error) {
      console.error("Error processing analytics data:", error);
      toast.error("Failed to process analytics data. Please refresh the page.");
      return {
        totalEvents: 0,
        totalDurationHours: 0,
        calendarBreakdown: [],
        recentActivities: [],
      };
    }
  }, [analyticsData, calendarMap]);

  const { totalEvents, totalDurationHours, calendarBreakdown, recentActivities: processedActivities } = processDataResult;

  const mainStats = [
    { label: "Total Events", value: totalEvents.toString(), icon: CalendarDays, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-900/30" },
    { label: "Total Duration", value: `${totalDurationHours}h`, icon: Clock, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
    {
      label: "Avg Event",
      value: totalEvents > 0 ? `${(totalDurationHours / totalEvents).toFixed(1)}h` : "0h",
      icon: BarChart3,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/30",
    },
  ];

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

  const timeSavedData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      day: i + 1,
      date: date.toISOString(),
      hours: 1 + Math.sin(i / 4) * 1.5 + Math.random() * 1 + i * 0.15,
    };
  }).map((d) => ({ ...d, hours: Math.max(0, d.hours) }));

  if (error) {
    return (
      <div className="max-w-7xl mx-auto w-full p-6 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md text-center">
          <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error Loading Analytics</h3>
          <p className="text-red-600 dark:text-red-300 text-sm mb-4">{(error as Error).message || "Failed to fetch analytics data. Please try again."}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Loading skeleton state
  if (isLoading) {
    // Get preferred chart type from localStorage
    const preferredChartType = typeof window !== "undefined" ? (localStorage.getItem("analytics-chart-type") === "line" ? "line" : "column") : "column";

    return (
      <div className="max-w-7xl mx-auto w-full p-6 animate-in fade-in duration-500 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-40 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </header>

        {/* Cognitive Metrics Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Analysis Skeleton */}
          <div className="lg:col-span-3">{preferredChartType === "line" ? <SkeletonLineChart /> : <SkeletonChart />}</div>

          {/* Intelligence Insights Skeleton */}
          <div className="lg:col-span-3">
            <Skeleton className="h-6 w-48 mb-6 ml-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonInsightCard key={i} />
              ))}
            </div>
          </div>

          {/* Time Mix Skeleton */}
          <div className="lg:col-span-2">
            <SkeletonDonutChart />
          </div>

          {/* Ops & Calendars Skeleton */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <SkeletonList items={4} className="flex-1" />
            <SkeletonCalendarSources items={4} />
          </div>

          {/* Long term heatmap Skeleton */}
          <div className="lg:col-span-3 mt-4">
            <SkeletonHeatmap />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full p-6 animate-in fade-in duration-500 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {date?.from && date?.to && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Your analytics data for dates between {format(date.from, "MMM dd, yyyy")} and {format(date.to, "MMM dd, yyyy")} (
              {Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))} days)
            </p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <DatePickerWithRange date={date} setDate={setDate} />
          <button
            onClick={() => refetch()}
            className="bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 p-2 px-4 rounded-md text-xs font-bold hover:opacity-90 transition-opacity shadow-sm h-10 flex items-center gap-2"
            title="Refresh analytics data"
          >
            <RotateCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </header>

      {/* Cognitive Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {mainStats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md p-6 shadow-sm transition-all hover:border-primary/30"
          >
            <div className={`w-10 h-10 rounded-md ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{stat.value}</p>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Analysis */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" /> Leverage Gain
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Leverage Gain</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        This chart measures the time that Ally has returned to your deep work pool by automating calendar management tasks. Higher values
                        indicate more time saved for focused work.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </h3>
              <p className="text-xs text-zinc-500 font-medium italic">Measuring the time Ally returned to your deep work pool.</p>
            </div>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
              <button
                onClick={() => handleChartTypeChange("column")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  chartType === "column"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
                title="Column Chart"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleChartTypeChange("line")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  chartType === "line"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
                title="Line Chart"
              >
                <LineChart className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64 overflow-visible">
            {chartType === "column" ? (
              <TimeSavedColumnChart data={timeSavedData} />
            ) : (
              <TimeSavedChart
                data={timeSavedData.map((d) => ({
                  day: `Day ${d.day}`,
                  hours: d.hours,
                }))}
              />
            )}
          </div>
        </div>

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
              {processedActivities.length > 0 ? (
                processedActivities.map((activity, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-md p-2 -m-2 transition-colors"
                    data-calendar-id={activity.calendarId || ""}
                    onClick={() => {
                      if (activity.event) {
                        setSelectedEvent(activity.event);
                        setSelectedEventCalendarColor(activity.calendarColor || "#6366f1");
                        setSelectedEventCalendarName(activity.calendarName || "");
                        setIsEventDialogOpen(true);
                      }
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-md group-hover:opacity-80 transition-opacity flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: activity.calendarColor || "#6366f1", opacity: 0.2 }}
                    >
                      <activity.icon className="w-4 h-4" style={{ color: activity.calendarColor || "#6366f1" }} />
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
                ))
              ) : (
                <p className="text-sm text-zinc-500">No recent activities found for this period.</p>
              )}
            </ul>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm p-6">
            <div className="mb-6">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-zinc-400" /> Managed Sources
              </h3>
            </div>
            {/* Display actual calendars from the data */}
            <div className="space-y-3">
              {calendarsData && calendarsData.length > 0 ? (
                calendarsData.map((calendar) => {
                  const calendarInfo = calendarMap.get(calendar.id);
                  const displayName = calendar.summary || calendar.id.split("@")[0];
                  const color = calendar.backgroundColor || calendarInfo?.color || "#6366f1";

                  return (
                    <div
                      key={calendar.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 group cursor-pointer"
                      style={{ backgroundColor: `${color}08` }}
                      onClick={() => {
                        setSelectedCalendarForSettings({
                          id: calendar.id,
                          name: displayName,
                          color: color,
                        });
                        setIsCalendarSettingsDialogOpen(true);
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
              onClick={() => setIsCreateCalendarDialogOpen(true)}
              className="w-full mt-6 py-2 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900/30 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all active:scale-[0.98]"
            >
              Create new calendar
            </button>
          </div>
        </div>

        {/* Long term heatmap */}
        <div className="lg:col-span-3 mt-4">
          <ActivityHeatmap />
        </div>
      </div>

      {/* Event Details Dialog */}
      {isEventDialogOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setIsEventDialogOpen(false)}>
          <div
            className="bg-zinc-50 dark:bg-zinc-900 rounded-lg shadow-xl max-w-2xl w-full relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ borderTop: `4px solid ${selectedEventCalendarColor}` }}
          >
            <button
              onClick={() => setIsEventDialogOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: selectedEventCalendarColor, opacity: 0.2 }}
                  >
                    <CalendarDays className="w-5 h-5" style={{ color: selectedEventCalendarColor }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{selectedEvent.summary || "No Title"}</h3>
                    {selectedEventCalendarName && (
                      <span
                        className="text-xs font-bold px-2 py-1 rounded border inline-block mt-1"
                        style={{
                          color: selectedEventCalendarColor,
                          borderColor: selectedEventCalendarColor,
                          backgroundColor: `${selectedEventCalendarColor}15`,
                        }}
                      >
                        {selectedEventCalendarName}
                      </span>
                    )}
                  </div>
                </div>
                {selectedEvent.status && (
                  <div className="mb-4">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{
                        color: selectedEvent.status === "confirmed" ? "#10b981" : selectedEvent.status === "tentative" ? "#f59e0b" : "#ef4444",
                        backgroundColor: selectedEvent.status === "confirmed" ? "#10b98120" : selectedEvent.status === "tentative" ? "#f59e0b20" : "#ef444420",
                      }}
                    >
                      {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {selectedEvent.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Description</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.location && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Location</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedEvent.location}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Start</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {selectedEvent.start.dateTime
                        ? format(new Date(selectedEvent.start.dateTime), "PPpp")
                        : selectedEvent.start.date
                        ? format(new Date(selectedEvent.start.date), "PPP")
                        : "N/A"}
                    </p>
                    {selectedEvent.start.timeZone && <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Timezone: {selectedEvent.start.timeZone}</p>}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">End</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {selectedEvent.end.dateTime
                        ? format(new Date(selectedEvent.end.dateTime), "PPpp")
                        : selectedEvent.end.date
                        ? format(new Date(selectedEvent.end.date), "PPP")
                        : "N/A"}
                    </p>
                    {selectedEvent.end.timeZone && <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Timezone: {selectedEvent.end.timeZone}</p>}
                  </div>
                </div>

                {selectedEvent.organizer && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Organizer</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedEvent.organizer.email || "N/A"}</p>
                  </div>
                )}

                {selectedEvent.creator && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Creator</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedEvent.creator.email || "N/A"}</p>
                  </div>
                )}

                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Attendees ({selectedEvent.attendees.length})</h4>
                    <ul className="space-y-1">
                      {selectedEvent.attendees.map((attendee, idx) => (
                        <li key={idx} className="text-sm text-zinc-600 dark:text-zinc-400">
                          {attendee.email}
                          {attendee.responseStatus && <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-500">({attendee.responseStatus})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedEvent.htmlLink && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Event Link</h4>
                    <a
                      href={selectedEvent.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
                      style={{ color: selectedEventCalendarColor }}
                    >
                      Open in Google Calendar
                    </a>
                  </div>
                )}

                {selectedEvent.created && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Created</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{format(new Date(selectedEvent.created), "PPpp")}</p>
                  </div>
                )}

                {selectedEvent.updated && (
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Last Updated</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{format(new Date(selectedEvent.updated), "PPpp")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Calendar Dialog */}
      {isCreateCalendarDialogOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setIsCreateCalendarDialogOpen(false)}
        >
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-xl max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsCreateCalendarDialogOpen(false)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">Create New Calendar</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Enter a name for your new calendar. It will be added to your Google Calendar account.
            </p>
            <input
              type="text"
              value={calendarPrompt}
              onChange={(e) => setCalendarPrompt(e.target.value)}
              placeholder="e.g., Work Projects, Personal Goals, Fitness"
              className="w-full p-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isCreatingCalendar}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreatingCalendar && calendarPrompt.trim()) {
                  e.preventDefault();
                  (e.target as HTMLInputElement).form?.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
                }
              }}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setIsCreateCalendarDialogOpen(false);
                  setCalendarPrompt("");
                }}
                disabled={isCreatingCalendar}
                className="flex-1 px-4 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!calendarPrompt.trim()) {
                    toast.error("Please enter a name for your calendar");
                    return;
                  }

                  setIsCreatingCalendar(true);
                  try {
                    const response = await calendarsService.createCalendar({
                      summary: calendarPrompt.trim(),
                      description: `Created from Analytics Dashboard`,
                    });

                    if (response.status === "success") {
                      toast.success("Calendar created successfully!");
                      setIsCreateCalendarDialogOpen(false);
                      setCalendarPrompt("");
                      // Refetch calendars to show the new one
                      queryClient.invalidateQueries({ queryKey: ["calendars-list"] });
                    } else {
                      toast.error(response.message || "Failed to create calendar");
                    }
                  } catch (error) {
                    console.error("Error creating calendar:", error);
                    toast.error("Failed to create calendar. Please try again.");
                  } finally {
                    setIsCreatingCalendar(false);
                  }
                }}
                disabled={isCreatingCalendar}
                className="flex-1 px-4 py-2 rounded-md bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingCalendar ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Calendar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Events Dialog */}
      {isCalendarEventsDialogOpen && selectedCalendarForEvents && (
        <CalendarEventsDialog
          calendarId={selectedCalendarForEvents.id}
          calendarName={selectedCalendarForEvents.name}
          calendarColor={selectedCalendarForEvents.color}
          dateRange={date}
          events={Array.isArray(calendarEventsData) ? calendarEventsData : []}
          isLoading={isCalendarEventsLoading}
          onClose={() => {
            setIsCalendarEventsDialogOpen(false);
            setSelectedCalendarForEvents(null);
          }}
          onEventClick={(event) => {
            // Cast CalendarEvent to Zod schema type (they're compatible)
            setSelectedEvent(event as z.infer<typeof CalendarEventSchema>);
            setSelectedEventCalendarColor(selectedCalendarForEvents.color);
            setSelectedEventCalendarName(selectedCalendarForEvents.name);
            setIsEventDialogOpen(true);
            // Close the calendar events dialog when opening event details
            setIsCalendarEventsDialogOpen(false);
          }}
        />
      )}

      {/* Calendar Settings Dialog */}
      {isCalendarSettingsDialogOpen && selectedCalendarForSettings && (
        <CalendarSettingsDialog
          calendarId={selectedCalendarForSettings.id}
          calendarName={selectedCalendarForSettings.name}
          calendarColor={selectedCalendarForSettings.color}
          onClose={() => {
            setIsCalendarSettingsDialogOpen(false);
            setSelectedCalendarForSettings(null);
          }}
        />
      )}
    </div>
  );
};

// Calendar Events Dialog Component
interface CalendarEventsDialogProps {
  calendarId: string;
  calendarName: string;
  calendarColor: string;
  dateRange: DateRange | undefined;
  events: CalendarEvent[];
  isLoading: boolean;
  onClose: () => void;
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarEventsDialog: React.FC<CalendarEventsDialogProps> = ({
  calendarId,
  calendarName,
  calendarColor,
  dateRange,
  events,
  isLoading,
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
            <ul className="space-y-3">
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
                          <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
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

// Calendar Settings Dialog Component
interface CalendarSettingsDialogProps {
  calendarId: string;
  calendarName: string;
  calendarColor: string;
  onClose: () => void;
}

const CalendarSettingsDialog: React.FC<CalendarSettingsDialogProps> = ({ calendarId, calendarName, calendarColor, onClose }) => {
  const { data: calendar, isLoading } = useCalendarById({
    id: calendarId,
    enabled: !!calendarId,
  });

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

export default AnalyticsDashboard;
