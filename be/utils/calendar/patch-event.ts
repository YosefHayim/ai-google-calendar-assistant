import { REQUEST_CONFIG_BASE } from "@/config";
import type { calendar_v3 } from "googleapis";

type PatchEventParams = {
  calendarEvents: calendar_v3.Resource$Events;
  eventData?: calendar_v3.Schema$Event | Record<string, string>;
  extra?: Record<string, unknown>;
};

// Helper to validate and normalize calendarId
function normalizeCalendarId(id: unknown): string | null {
  if (!id || typeof id !== "string") return null;
  const trimmed = id.trim();
  // Reject obviously invalid values
  if (trimmed === "" || trimmed === "/") return null;
  return trimmed;
}

/**
 * Patch an event in the calendar (partial update - only updates provided fields)
 *
 * @param {PatchEventParams} params - The parameters for patching an event.
 * @returns {Promise<calendar_v3.Schema$Event>} The patched event.
 * @description Patches an event in the calendar - only the fields provided are updated,
 * other fields are preserved. This is the preferred method for partial updates.
 */
export async function patchEvent({ calendarEvents, eventData, extra }: PatchEventParams) {
  const body = (eventData as calendar_v3.Schema$Event & { calendarId?: string; email?: string }) || {};
  const calendarId = normalizeCalendarId(extra?.calendarId) || normalizeCalendarId(body.calendarId) || "primary";
  const eventId = (extra?.eventId as string) || body.id || "";

  if (!eventId) {
    throw new Error("eventId is required for patch operation");
  }

  const { calendarId: _cid, email: _email, id: _id, ...requestBody } = body;

  const patchedEvent = await calendarEvents.patch({
    ...REQUEST_CONFIG_BASE,
    calendarId,
    eventId,
    requestBody,
  });
  return patchedEvent.data;
}
