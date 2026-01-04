/**
 * Calendar Message Templates
 * Pre-built templates for calendar-related responses
 */

import { ResponseBuilder } from "../core/response-builder";
import type { CalendarEvent, DaySchedule, WeekSchedule } from "../core/types";

/**
 * Generate weekly calendar view response
 */
export function weeklyCalendarTemplate(schedule: WeekSchedule, userName?: string): ResponseBuilder {
  const greeting = userName ? `${userName}'s Week` : "Your Week at a Glance";

  return ResponseBuilder.telegram().type("calendar").header("📊", greeting).weekSchedule(schedule).footer("A well-planned week is a productive week!");
}

/**
 * Generate today's schedule response
 */
export function todayScheduleTemplate(schedule: DaySchedule, userName?: string): ResponseBuilder {
  const greeting = userName ? `${userName}'s Schedule` : "Today's Schedule";

  const builder = ResponseBuilder.telegram().type("calendar").header("📅", greeting);

  if (schedule.events.length === 0) {
    return builder.text("Your calendar is clear today! ✨").footer("Perfect time for some deep work or self-care.");
  }

  return builder.daySchedule(schedule).footer("Have a productive day!");
}

/**
 * Generate tomorrow's schedule response
 */
export function tomorrowScheduleTemplate(schedule: DaySchedule, userName?: string): ResponseBuilder {
  const greeting = userName ? `${userName}'s Tomorrow` : "Tomorrow's Agenda";

  const builder = ResponseBuilder.telegram().type("calendar").header("🌅", greeting);

  if (schedule.events.length === 0) {
    return builder.text("Tomorrow is looking free! ✨").footer("Stay ahead by planning your day the night before!");
  }

  return builder.daySchedule(schedule).footer("Stay ahead by planning your day the night before!");
}

/**
 * Generate a simple event list
 */
export function eventListTemplate(events: CalendarEvent[], title: string, emoji: string = "📋"): ResponseBuilder {
  const builder = ResponseBuilder.telegram().type("list").header(emoji, title);

  if (events.length === 0) {
    return builder.text("No events found.");
  }

  const items = events.map((event) => ({
    bullet: "emoji" as const,
    bulletEmoji: "📌",
    text: event.summary,
    detail: formatEventDateTime(event),
  }));

  return builder.list(items);
}

/**
 * Generate free time slots response
 */
export function freeTimeTemplate(slots: Array<{ start: Date | string; end: Date | string }>, period: string = "today"): ResponseBuilder {
  const builder = ResponseBuilder.telegram().type("info").header("🕐", `Free Time ${period}`);

  if (slots.length === 0) {
    return builder.text(`No free slots found ${period}.`).footer("Try looking at a different day!");
  }

  const items = slots.map((slot) => ({
    bullet: "emoji" as const,
    bulletEmoji: "✨",
    text: `${formatTime(new Date(slot.start))} - ${formatTime(new Date(slot.end))}`,
  }));

  return builder.list(items).footer("Perfect for scheduling that important meeting!");
}

/**
 * Generate busy times response
 */
export function busyTimeTemplate(events: CalendarEvent[], period: string = "today"): ResponseBuilder {
  const builder = ResponseBuilder.telegram().type("info").header("🔴", `Busy Times ${period}`);

  if (events.length === 0) {
    return builder.text(`You're completely free ${period}!`).footer("Use /free to find available slots instead!");
  }

  const items = events.map((event) => ({
    bullet: "emoji" as const,
    bulletEmoji: "📌",
    text: event.summary,
    detail: formatEventTime(event),
  }));

  return builder.list(items).footer("Use /free to find available slots instead!");
}

/**
 * Generate monthly overview response
 */
export function monthlyOverviewTemplate(totalEvents: number, totalHours: number, busiestWeek?: string): ResponseBuilder {
  const items = [
    { bullet: "dot" as const, text: `${totalEvents} events scheduled` },
    { bullet: "dot" as const, text: `${totalHours}h total time` },
  ];

  if (busiestWeek) {
    items.push({ bullet: "dot" as const, text: `Busiest week: ${busiestWeek}` });
  }

  return ResponseBuilder.telegram().type("calendar").header("📆", "Monthly Overview").list(items).footer("Use /analytics for detailed time breakdowns!");
}

// ============================================
// Helper Functions
// ============================================

function formatEventDateTime(event: CalendarEvent): string {
  const date = new Date(event.start);
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (event.isAllDay) {
    return `${dateStr} (All day)`;
  }

  return `${dateStr} at ${formatTime(date)}`;
}

function formatEventTime(event: CalendarEvent): string {
  if (event.isAllDay) {
    return "All day";
  }

  const start = new Date(event.start);
  const end = new Date(event.end);

  return `${formatTime(start)} - ${formatTime(end)}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
