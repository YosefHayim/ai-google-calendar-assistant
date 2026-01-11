import { asyncHandler } from "@/utils/http";
import type { calendar_v3 } from "googleapis";
import { fetchCredentialsByEmail } from "@/utils/auth";
import { formatDate } from "@/utils/date";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "./init";
import type { ConflictingEvent } from "@/shared/types";

export interface RescheduleSuggestion {
  start: string;
  end: string;
  startFormatted: string;
  endFormatted: string;
  dayOfWeek: string;
  score: number;
  reason: string;
}

export interface RescheduleParams {
  email: string;
  eventId: string;
  calendarId?: string;
  preferredTimeOfDay?: "morning" | "afternoon" | "evening" | "any";
  daysToSearch?: number;
  excludeWeekends?: boolean;
}

export interface RescheduleResult {
  success: boolean;
  event?: {
    id: string;
    summary: string;
    start: string;
    end: string;
    duration: number; // in minutes
  };
  suggestions: RescheduleSuggestion[];
  conflicts?: ConflictingEvent[];
  error?: string;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIME_PREFERENCES = {
  morning: { start: 8, end: 12, label: "Morning (8AM-12PM)" },
  afternoon: { start: 12, end: 17, label: "Afternoon (12PM-5PM)" },
  evening: { start: 17, end: 21, label: "Evening (5PM-9PM)" },
  any: { start: 8, end: 21, label: "Any time" },
};

/**
 * Find optimal reschedule times for an event
 */
export const findRescheduleSuggestions = asyncHandler(
  async (params: RescheduleParams): Promise<RescheduleResult> => {
    const {
      email,
      eventId,
      calendarId = "primary",
      preferredTimeOfDay = "any",
      daysToSearch = 7,
      excludeWeekends = false,
    } = params;

    const credentials = await fetchCredentialsByEmail(email);
    const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);

    // Get the event to reschedule
    let eventToReschedule: calendar_v3.Schema$Event;
    try {
      const eventResponse = await calendar.events.get({
        calendarId,
        eventId,
      });
      eventToReschedule = eventResponse.data;
    } catch (error) {
      return {
        success: false,
        suggestions: [],
        error: "Event not found or access denied",
      };
    }

    if (!eventToReschedule.start || !eventToReschedule.end) {
      return {
        success: false,
        suggestions: [],
        error: "Event has no start or end time",
      };
    }

    // Calculate event duration
    const eventStart = new Date(eventToReschedule.start.dateTime || eventToReschedule.start.date || "");
    const eventEnd = new Date(eventToReschedule.end.dateTime || eventToReschedule.end.date || "");
    const durationMinutes = Math.round((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60));

    // Search window: from tomorrow to daysToSearch days
    const searchStart = new Date();
    searchStart.setDate(searchStart.getDate() + 1);
    searchStart.setHours(0, 0, 0, 0);

    const searchEnd = new Date(searchStart);
    searchEnd.setDate(searchEnd.getDate() + daysToSearch);

    // Get all events in search window across all calendars
    const calendarListResponse = await calendar.calendarList.list({ prettyPrint: true });
    const allCalendars = calendarListResponse.data.items || [];

    const allBusySlots: { start: Date; end: Date }[] = [];

    await Promise.all(
      allCalendars.map(async (cal) => {
        if (!cal.id) return;
        try {
          const eventsResponse = await calendar.events.list({
            calendarId: cal.id,
            timeMin: searchStart.toISOString(),
            timeMax: searchEnd.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
          });

          const events = eventsResponse.data.items || [];
          for (const event of events) {
            if (event.id === eventId) continue; // Exclude the event being rescheduled
            if (!event.start || !event.end) continue;

            const start = new Date(event.start.dateTime || event.start.date || "");
            const end = new Date(event.end.dateTime || event.end.date || "");
            allBusySlots.push({ start, end });
          }
        } catch {
          // Skip calendars that fail
        }
      })
    );

    // Sort busy slots by start time
    allBusySlots.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Find free slots
    const suggestions: RescheduleSuggestion[] = [];
    const timePrefs = TIME_PREFERENCES[preferredTimeOfDay];

    for (let dayOffset = 1; dayOffset <= daysToSearch && suggestions.length < 5; dayOffset++) {
      const checkDate = new Date(searchStart);
      checkDate.setDate(searchStart.getDate() + dayOffset - 1);

      // Skip weekends if requested
      if (excludeWeekends && (checkDate.getDay() === 0 || checkDate.getDay() === 6)) {
        continue;
      }

      const dayOfWeek = DAYS_OF_WEEK[checkDate.getDay()];

      // Check each hour in the preferred time range
      for (let hour = timePrefs.start; hour <= timePrefs.end - Math.ceil(durationMinutes / 60); hour++) {
        const slotStart = new Date(checkDate);
        slotStart.setHours(hour, 0, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + durationMinutes);

        // Check if this slot conflicts with any busy time
        const hasConflict = allBusySlots.some((busy) => {
          return slotStart < busy.end && slotEnd > busy.start;
        });

        if (!hasConflict) {
          // Calculate score based on various factors
          let score = 100;
          let reason = "";

          // Prefer earlier days
          score -= dayOffset * 5;

          // Prefer preferred time of day
          if (preferredTimeOfDay !== "any") {
            if (hour >= timePrefs.start && hour < timePrefs.end) {
              score += 20;
              reason = `${timePrefs.label}`;
            }
          }

          // Prefer business hours (9-5)
          if (hour >= 9 && hour < 17) {
            score += 10;
            reason = reason || "Business hours";
          }

          // Prefer not too early or late
          if (hour >= 10 && hour <= 15) {
            score += 5;
            reason = reason || "Optimal time";
          }

          // Generate readable reason
          if (!reason) {
            reason = dayOffset === 1 ? "Tomorrow" : `${dayOfWeek}, ${dayOffset} days from now`;
          }

          suggestions.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            startFormatted: formatDate(slotStart.toISOString(), true) || "",
            endFormatted: formatDate(slotEnd.toISOString(), true) || "",
            dayOfWeek,
            score,
            reason,
          });

          // Only take the best slot per day
          break;
        }
      }
    }

    // Sort by score (highest first)
    suggestions.sort((a, b) => b.score - a.score);

    // Limit to top 5
    const topSuggestions = suggestions.slice(0, 5);

    return {
      success: true,
      event: {
        id: eventToReschedule.id || "",
        summary: eventToReschedule.summary || "Untitled Event",
        start: formatDate(eventToReschedule.start.dateTime || eventToReschedule.start.date || "", true) || "",
        end: formatDate(eventToReschedule.end.dateTime || eventToReschedule.end.date || "", true) || "",
        duration: durationMinutes,
      },
      suggestions: topSuggestions,
    };
  }
);

export interface ApplyRescheduleParams {
  email: string;
  eventId: string;
  calendarId?: string;
  newStart: string;
  newEnd: string;
}

export interface ApplyRescheduleResult {
  success: boolean;
  event?: calendar_v3.Schema$Event;
  error?: string;
}

/**
 * Apply a reschedule suggestion to an event
 */
export const applyReschedule = asyncHandler(
  async (params: ApplyRescheduleParams): Promise<ApplyRescheduleResult> => {
    const { email, eventId, calendarId = "primary", newStart, newEnd } = params;

    const credentials = await fetchCredentialsByEmail(email);
    const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);

    try {
      const patchedEvent = await calendar.events.patch({
        calendarId,
        eventId,
        requestBody: {
          start: { dateTime: newStart },
          end: { dateTime: newEnd },
        },
      });

      return {
        success: true,
        event: patchedEvent.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reschedule event",
      };
    }
  }
);
