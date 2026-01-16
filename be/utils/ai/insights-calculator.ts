import type { calendar_v3 } from "googleapis";

/**
 * Raw metrics calculated from calendar events
 * These are passed to the AI to generate insights
 */
export type InsightsMetrics = {
  // Event counts
  totalEvents: number;
  recurringEventsCount: number;
  allDayEventsCount: number;

  // Time totals
  totalHours: number;
  averageEventDurationMinutes: number;

  // Day analysis
  busiestDay: { day: string; hours: number } | null;
  quietestDay: { day: string; hours: number } | null;
  dayDistribution: Record<string, number>; // Mon-Sun hours

  // Time of day patterns
  peakHours: { morning: number; afternoon: number; evening: number };
  earliestStart: string | null; // e.g., "7:30 AM"
  latestEnd: string | null; // e.g., "10:00 PM"

  // Work patterns
  weekendHours: number;
  weekdayHours: number;
  freeDaysCount: number;
  overloadedDaysCount: number; // 8+ hours

  // Event details
  longestEvent: { title: string; hours: number } | null;
  shortestEvent: { title: string; minutes: number } | null;

  // Meeting patterns
  backToBackCount: number;
  averageGapMinutes: number;
  multiAttendeeHours: number;
  soloEventHours: number;

  // Calendar breakdown
  calendarBreakdown: { name: string; hours: number; eventCount: number }[];

  // Period info
  totalDays: number;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * @description Calculates comprehensive metrics from a collection of calendar events for AI insights generation.
 * Analyzes events to determine patterns including time distribution, peak hours, busiest/quietest days,
 * back-to-back meetings, gap analysis, and calendar-specific breakdowns. Filters out cancelled events
 * and separates timed events from all-day events for accurate calculations.
 *
 * @param {calendar_v3.Schema$Event[]} events - Array of Google Calendar events to analyze
 * @param {Record<string, { name: string; color: string }>} calendarMap - Mapping of calendar IDs to their display names and colors
 * @returns {InsightsMetrics} Comprehensive metrics object containing event counts, time totals,
 *   day analysis, peak hours, work patterns, event details, meeting patterns, and calendar breakdown
 *
 * @example
 * const events = await calendar.events.list({ calendarId: 'primary' });
 * const calendarMap = { 'primary': { name: 'Work', color: '#4285f4' } };
 * const metrics = calculateInsightsMetrics(events.data.items, calendarMap);
 * console.log(`Total hours scheduled: ${metrics.totalHours}`);
 * console.log(`Busiest day: ${metrics.busiestDay?.day}`);
 */
export function calculateInsightsMetrics(
  events: calendar_v3.Schema$Event[],
  calendarMap: Record<string, { name: string; color: string }>
): InsightsMetrics {
  // Filter valid events with start/end times
  const timedEvents = events.filter(
    (e) => e.start?.dateTime && e.end?.dateTime && e.status !== "cancelled"
  );

  const allDayEvents = events.filter(
    (e) => e.start?.date && !e.start?.dateTime && e.status !== "cancelled"
  );

  // Initialize tracking structures
  const dayHours: Record<string, number> = {};
  const calendarHours: Record<string, { hours: number; eventCount: number }> =
    {};
  const peakHours = { morning: 0, afternoon: 0, evening: 0 };

  let totalMinutes = 0;
  let weekendMinutes = 0;
  let weekdayMinutes = 0;
  let multiAttendeeMinutes = 0;
  let soloEventMinutes = 0;
  let recurringCount = 0;
  let backToBackCount = 0;
  let totalGapMinutes = 0;
  let gapCount = 0;

  let longestEvent: { title: string; hours: number } | null = null;
  let shortestEvent: { title: string; minutes: number } | null = null;
  let earliestStart: Date | null = null;
  let latestEnd: Date | null = null;

  // Sort events by start time for gap analysis
  const sortedEvents = [...timedEvents].sort((a, b) => {
    const aStart = new Date(a.start?.dateTime!).getTime();
    const bStart = new Date(b.start?.dateTime!).getTime();
    return aStart - bStart;
  });

  let previousEventEnd: Date | null = null;

  for (const event of sortedEvents) {
    const start = new Date(event.start?.dateTime!);
    const end = new Date(event.end?.dateTime!);
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    if (durationMinutes <= 0) {
      continue;
    }

    totalMinutes += durationMinutes;

    // Day distribution
    const _dayName = DAY_NAMES[start.getDay()];
    const dateKey = start.toISOString().split("T")[0];
    dayHours[dateKey] = (dayHours[dateKey] || 0) + durationMinutes / 60;

    // Weekend vs weekday
    const dayOfWeek = start.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendMinutes += durationMinutes;
    } else {
      weekdayMinutes += durationMinutes;
    }

    // Peak hours analysis
    const hour = start.getHours();
    if (hour >= 6 && hour < 12) {
      peakHours.morning += durationMinutes / 60;
    } else if (hour >= 12 && hour < 18) {
      peakHours.afternoon += durationMinutes / 60;
    } else {
      peakHours.evening += durationMinutes / 60;
    }

    // Earliest/latest times
    if (
      !earliestStart ||
      start.getHours() * 60 + start.getMinutes() <
        earliestStart.getHours() * 60 + earliestStart.getMinutes()
    ) {
      earliestStart = start;
    }
    if (
      !latestEnd ||
      end.getHours() * 60 + end.getMinutes() >
        latestEnd.getHours() * 60 + latestEnd.getMinutes()
    ) {
      latestEnd = end;
    }

    // Longest/shortest events
    const durationHours = durationMinutes / 60;
    if (!longestEvent || durationHours > longestEvent.hours) {
      longestEvent = {
        title: event.summary || "Untitled",
        hours: Math.round(durationHours * 10) / 10,
      };
    }
    if (!shortestEvent || durationMinutes < shortestEvent.minutes) {
      shortestEvent = {
        title: event.summary || "Untitled",
        minutes: Math.round(durationMinutes),
      };
    }

    // Recurring events
    if (event.recurringEventId) {
      recurringCount++;
    }

    // Multi-attendee vs solo
    const attendeeCount = event.attendees?.length || 0;
    if (attendeeCount > 1) {
      multiAttendeeMinutes += durationMinutes;
    } else {
      soloEventMinutes += durationMinutes;
    }

    // Calendar breakdown
    // Extract calendar ID from organizer email or use "primary"
    const calendarId =
      (event as { calendarId?: string }).calendarId || "primary";
    const calendarInfo = calendarMap[calendarId] || {
      name: calendarId,
      color: "#6366f1",
    };
    if (!calendarHours[calendarInfo.name]) {
      calendarHours[calendarInfo.name] = { hours: 0, eventCount: 0 };
    }
    calendarHours[calendarInfo.name].hours += durationMinutes / 60;
    calendarHours[calendarInfo.name].eventCount++;

    // Back-to-back and gap analysis
    if (previousEventEnd) {
      const gapMinutes =
        (start.getTime() - previousEventEnd.getTime()) / (1000 * 60);
      if (gapMinutes <= 5 && gapMinutes >= 0) {
        backToBackCount++;
      } else if (gapMinutes > 0 && gapMinutes < 480) {
        // Count gaps less than 8 hours
        totalGapMinutes += gapMinutes;
        gapCount++;
      }
    }
    previousEventEnd = end;
  }

  // Calculate day-level metrics
  const dayHoursArray = Object.entries(dayHours).map(([date, hours]) => ({
    date,
    hours,
  }));
  const sortedDays = dayHoursArray.sort((a, b) => b.hours - a.hours);

  const busiestDay = sortedDays[0]
    ? {
        day: formatDayName(sortedDays[0].date),
        hours: Math.round(sortedDays[0].hours * 10) / 10,
      }
    : null;

  const daysWithEvents = dayHoursArray.filter((d) => d.hours > 0)
  const lastDayWithEvents = daysWithEvents.at(-1)
  const quietestDay = lastDayWithEvents
    ? {
        day: formatDayName(lastDayWithEvents.date),
        hours: Math.round(lastDayWithEvents.hours * 10) / 10,
      }
    : null

  // Count free days and overloaded days
  const uniqueDates = new Set<string>();
  const firstEventStart = sortedEvents[0]?.start?.dateTime;
  const lastEventEnd = sortedEvents.at(-1)?.end?.dateTime;
  const startDate = firstEventStart ? new Date(firstEventStart) : new Date();
  const endDate = lastEventEnd ? new Date(lastEventEnd) : new Date();

  const totalDays = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1
  );

  for (const date of Object.keys(dayHours)) {
    uniqueDates.add(date);
  }

  const freeDaysCount = Math.max(0, totalDays - uniqueDates.size);
  const overloadedDaysCount = dayHoursArray.filter((d) => d.hours >= 8).length;

  // Build day distribution (aggregate by day name)
  const dayDistribution: Record<string, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };

  for (const [dateStr, hours] of Object.entries(dayHours)) {
    const date = new Date(dateStr);
    const dayName = DAY_NAMES[date.getDay()];
    dayDistribution[dayName] += hours;
  }

  // Build calendar breakdown
  const calendarBreakdown = Object.entries(calendarHours)
    .map(([name, data]) => ({
      name,
      hours: Math.round(data.hours * 10) / 10,
      eventCount: data.eventCount,
    }))
    .sort((a, b) => b.hours - a.hours);

  return {
    totalEvents: timedEvents.length,
    recurringEventsCount: recurringCount,
    allDayEventsCount: allDayEvents.length,

    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    averageEventDurationMinutes:
      timedEvents.length > 0
        ? Math.round(totalMinutes / timedEvents.length)
        : 0,

    busiestDay,
    quietestDay,
    dayDistribution,

    peakHours: {
      morning: Math.round(peakHours.morning * 10) / 10,
      afternoon: Math.round(peakHours.afternoon * 10) / 10,
      evening: Math.round(peakHours.evening * 10) / 10,
    },
    earliestStart: earliestStart ? formatTime(earliestStart) : null,
    latestEnd: latestEnd ? formatTime(latestEnd) : null,

    weekendHours: Math.round((weekendMinutes / 60) * 10) / 10,
    weekdayHours: Math.round((weekdayMinutes / 60) * 10) / 10,
    freeDaysCount,
    overloadedDaysCount,

    longestEvent,
    shortestEvent,

    backToBackCount,
    averageGapMinutes:
      gapCount > 0 ? Math.round(totalGapMinutes / gapCount) : 0,
    multiAttendeeHours: Math.round((multiAttendeeMinutes / 60) * 10) / 10,
    soloEventHours: Math.round((soloEventMinutes / 60) * 10) / 10,

    calendarBreakdown,
    totalDays,
  };
}

/**
 * @description Formats an ISO date string into a human-readable day name with abbreviated month and day number.
 * Useful for displaying dates in a friendly format for calendar insights and reports.
 *
 * @param {string} dateStr - ISO date string (e.g., "2024-01-15" or "2024-01-15T10:00:00Z")
 * @returns {string} Formatted string with full day name, abbreviated month, and day number (e.g., "Monday, Jan 15")
 *
 * @example
 * formatDayName("2024-01-15"); // Returns "Monday, Jan 15"
 * formatDayName("2024-12-25T00:00:00Z"); // Returns "Wednesday, Dec 25"
 */
function formatDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const dayName = DAY_NAMES[date.getDay()];
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  return `${dayName}, ${month} ${day}`;
}

/**
 * @description Formats a JavaScript Date object into a localized 12-hour time string with AM/PM indicator.
 * Uses US English locale formatting for consistent display across different environments.
 *
 * @param {Date} date - JavaScript Date object to format
 * @returns {string} Formatted time string in 12-hour format with AM/PM (e.g., "9:30 AM", "2:00 PM")
 *
 * @example
 * formatTime(new Date("2024-01-15T09:30:00")); // Returns "9:30 AM"
 * formatTime(new Date("2024-01-15T14:00:00")); // Returns "2:00 PM"
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
