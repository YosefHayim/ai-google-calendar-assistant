import { asyncHandler } from "@/utils/http";
import type { calendar_v3 } from "googleapis";
import { fetchCredentialsByEmail } from "@/utils/auth";
import { formatDate } from "@/utils/date";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "./init";
import type { ConflictingEvent, ConflictCheckResult } from "@/shared/types";

export type { ConflictingEvent, ConflictCheckResult };

export type ConflictCheckParams = {
  email: string;
  calendarId: string;
  startTime: string;
  endTime: string;
};

export type ConflictCheckAllCalendarsParams = {
  email: string;
  startTime: string;
  endTime: string;
  excludeEventId?: string;
};

/**
 * Checks for conflicting events in the specified time range.
 * Uses Google Calendar events.list API to find overlapping events.
 * @param {ConflictCheckParams} params - The parameters for the conflict check.
 * @returns {Promise<ConflictCheckResult>} The result of the conflict check.
 * @example
 * const result = await checkEventConflicts({ email: "test@example.com", calendarId: "primary", startTime: "2025-01-01", endTime: "2025-01-02" });
 *
 */
export const checkEventConflicts = asyncHandler(
  async (params: ConflictCheckParams): Promise<ConflictCheckResult> => {
    const { email, calendarId, startTime, endTime } = params;

    const credentials = await fetchCredentialsByEmail(email);
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);

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

    const conflictingEvents: ConflictingEvent[] = events
      .filter((event: calendar_v3.Schema$Event) => {
        if (!event.start || !event.end) return false;

        const eventStart = event.start.dateTime || event.start.date;
        const eventEnd = event.end.dateTime || event.end.date;

        if (!eventStart || !eventEnd) return false;

        const newStart = new Date(startTime).getTime();
        const newEnd = new Date(endTime).getTime();
        const existingStart = new Date(eventStart).getTime();
        const existingEnd = new Date(eventEnd).getTime();

        return newStart < existingEnd && newEnd > existingStart;
      })
      .map((event: calendar_v3.Schema$Event) => ({
        id: event.id || "",
        summary: event.summary || "Untitled Event",
        start:
          formatDate(event.start?.dateTime || event.start?.date || "", true) ||
          "",
        end:
          formatDate(event.end?.dateTime || event.end?.date || "", true) || "",
        calendarId: calendarId || "primary",
        calendarName,
      }));

    return {
      hasConflicts: conflictingEvents.length > 0,
      conflictingEvents,
    };
  },
);

export const checkEventConflictsAllCalendars = asyncHandler(
  async (
    params: ConflictCheckAllCalendarsParams,
  ): Promise<ConflictCheckResult> => {
    const { email, startTime, endTime, excludeEventId } = params;

    const credentials = await fetchCredentialsByEmail(email);
    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);

    const calendarListResponse = await calendar.calendarList.list({
      prettyPrint: true,
    });
    const allCalendars = calendarListResponse.data.items || [];

    const allConflicts: ConflictingEvent[] = [];

    await Promise.all(
      allCalendars.map(async (cal) => {
        const calId = cal.id || "primary";
        const calName = cal.summary || calId;

        try {
          const eventsResponse = await calendar.events.list({
            calendarId: calId,
            timeMin: startTime,
            timeMax: endTime,
            singleEvents: true,
            orderBy: "startTime",
            maxResults: 20,
          });

          const events = eventsResponse.data.items || [];

          events.forEach((event: calendar_v3.Schema$Event) => {
            if (excludeEventId && event.id === excludeEventId) return;
            if (!event.start || !event.end) return;

            const eventStart = event.start.dateTime || event.start.date;
            const eventEnd = event.end.dateTime || event.end.date;

            if (!eventStart || !eventEnd) return;

            const newStart = new Date(startTime).getTime();
            const newEnd = new Date(endTime).getTime();
            const existingStart = new Date(eventStart).getTime();
            const existingEnd = new Date(eventEnd).getTime();

            if (newStart < existingEnd && newEnd > existingStart) {
              allConflicts.push({
                id: event.id || "",
                summary: event.summary || "Untitled Event",
                start:
                  formatDate(
                    event.start?.dateTime || event.start?.date || "",
                    true,
                  ) || "",
                end:
                  formatDate(
                    event.end?.dateTime || event.end?.date || "",
                    true,
                  ) || "",
                calendarId: calId,
                calendarName: calName,
              });
            }
          });
        } catch (error) {
          console.error(
            `Failed to check conflicts for calendar ${calId}:`,
            error,
          );
        }
      }),
    );

    return {
      hasConflicts: allConflicts.length > 0,
      conflictingEvents: allConflicts,
    };
  },
);
