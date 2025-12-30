import { asyncHandler } from "@/utils/http";
import type { calendar_v3 } from "googleapis";
import { fetchCredentialsByEmail } from "@/utils/auth";
import { formatDate } from "@/utils/date";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "./init";

export type ConflictCheckParams = {
  email: string;
  calendarId: string;
  startTime: string; // ISO8601
  endTime: string; // ISO8601
};

export type ConflictingEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  calendarName: string;
};

export type ConflictCheckResult = {
  hasConflicts: boolean;
  conflictingEvents: ConflictingEvent[];
};

/**
 * Checks for conflicting events in the specified time range.
 * Uses Google Calendar events.list API to find overlapping events.
 * @param {ConflictCheckParams} params - The parameters for the conflict check.
 * @returns {Promise<ConflictCheckResult>} The result of the conflict check.
 * @example
 * const result = await checkEventConflicts({ email: "test@example.com", calendarId: "primary", startTime: "2025-01-01", endTime: "2025-01-02" });
 * console.log(result);
 */
export const checkEventConflicts = asyncHandler(async (params: ConflictCheckParams): Promise<ConflictCheckResult> => {
  const { email, calendarId, startTime, endTime } = params;

  const credentials = await fetchCredentialsByEmail(email);
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);

  // Get calendar name for display
  let calendarName = "Primary";
  if (calendarId && calendarId !== "primary") {
    try {
      const calendarInfo = await calendar.calendars.get({ calendarId });
      calendarName = calendarInfo.data.summary || calendarId;
    } catch {
      calendarName = calendarId;
    }
  }

  // Query events in the time range
  const eventsResponse = await calendar.events.list({
    calendarId: calendarId || "primary",
    timeMin: startTime,
    timeMax: endTime,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 10, // Limit to avoid too many results
  });

  const events = eventsResponse.data.items || [];

  // Filter out events that don't actually overlap (edge cases with exact boundaries)
  const conflictingEvents: ConflictingEvent[] = events
    .filter((event: calendar_v3.Schema$Event) => {
      // Skip events without start/end times
      if (!event.start || !event.end) return false;

      const eventStart = event.start.dateTime || event.start.date;
      const eventEnd = event.end.dateTime || event.end.date;

      if (!eventStart || !eventEnd) return false;

      // Check for actual overlap (not just touching boundaries)
      const newStart = new Date(startTime).getTime();
      const newEnd = new Date(endTime).getTime();
      const existingStart = new Date(eventStart).getTime();
      const existingEnd = new Date(eventEnd).getTime();

      // Events overlap if: newStart < existingEnd AND newEnd > existingStart
      return newStart < existingEnd && newEnd > existingStart;
    })
    .map((event: calendar_v3.Schema$Event) => ({
      id: event.id || "",
      summary: event.summary || "Untitled Event",
      start: formatDate(event.start?.dateTime || event.start?.date || "", true) || "",
      end: formatDate(event.end?.dateTime || event.end?.date || "", true) || "",
      calendarName,
    }));

  return {
    hasConflicts: conflictingEvents.length > 0,
    conflictingEvents,
  };
});
