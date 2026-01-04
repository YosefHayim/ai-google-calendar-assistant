import { REQUEST_CONFIG_BASE } from "@/config";
import type { calendar_v3 } from "googleapis";

type UpdateEventParams = {
  calendarEvents: calendar_v3.Resource$Events;
  eventData?: calendar_v3.Schema$Event | Record<string, string>;
  extra?: Record<string, unknown>;
  req?: { query?: Record<string, unknown> } | null;
};

/**
 * Update an event in the calendar
 *
 * @param {UpdateEventParams} params - The parameters for updating an event.
 * @returns {Promise<calendar_v3.Schema$Event>} The updated event.
 * @description Updates an event in the calendar and sends the response.
 * @example
 * const data = await updateEvent(params);
 *
 */
// Helper to validate and normalize calendarId
function normalizeCalendarId(id: unknown): string | null {
  if (!id || typeof id !== "string") return null;
  const trimmed = id.trim();
  // Reject obviously invalid values
  if (trimmed === "" || trimmed === "/") return null;
  return trimmed;
}

export async function updateEvent({ calendarEvents, eventData, extra, req }: UpdateEventParams) {
  const body = (eventData as calendar_v3.Schema$Event & { calendarId?: string; email?: string }) || {};
  const calendarId =
    normalizeCalendarId(extra?.calendarId) || normalizeCalendarId(body.calendarId) || normalizeCalendarId(req?.query?.calendarId) || "primary";

  const resp = await calendarEvents.update({
    ...REQUEST_CONFIG_BASE,
    eventId: (eventData?.id as string) || "",
    requestBody: eventData,
    calendarId,
  });

  return resp.data;
}
