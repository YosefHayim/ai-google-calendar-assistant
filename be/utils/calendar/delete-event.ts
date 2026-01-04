import { REQUEST_CONFIG_BASE } from "@/config";
import type { calendar_v3 } from "googleapis";

type DeleteEventParams = {
  calendarEvents: calendar_v3.Resource$Events;
  eventData?: calendar_v3.Schema$Event | Record<string, string>;
  extra?: Record<string, unknown>;
  req?: { body?: Record<string, unknown>; query?: Record<string, unknown> } | null;
};

/**
 * Delete an event from the calendar
 *
 * @param {DeleteEventParams} params - The parameters for deleting an event.
 * @returns {Promise<calendar_v3.Schema$Event>} The deleted event.
 * @description Deletes an event from the calendar and sends the response.
 * @example
 * const data = await deleteEvent(params);
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

export async function deleteEvent({ calendarEvents, eventData, extra, req }: DeleteEventParams) {
  const calendarId =
    normalizeCalendarId(extra?.calendarId) || normalizeCalendarId(req?.body?.calendarId) || normalizeCalendarId(req?.query?.calendarId) || "primary";

  const resp = await calendarEvents.delete({
    ...REQUEST_CONFIG_BASE,
    calendarId,
    eventId: (eventData?.id as string) || "",
  });
  return resp.data;
}
