import { REQUEST_CONFIG_BASE } from "@/config";
import type { calendar_v3 } from "googleapis";

type PatchEventParams = {
  calendarEvents: calendar_v3.Resource$Events;
  eventData?: calendar_v3.Schema$Event | Record<string, string>;
  extra?: Record<string, unknown>;
};

/**
 * Patch an event in the calendar
 *
 * @param {PatchEventParams} params - The parameters for patching an event.
 * @returns {Promise<calendar_v3.Schema$Event>} The patched event.
 * @description Patches an event in the calendar and sends the response.
 * @example
 * const data = await patchEvent(params);
 *
 */
export async function patchEvent({ calendarEvents, eventData, extra }: PatchEventParams) {
  const body = (eventData as calendar_v3.Schema$Event & { calendarId?: string; email?: string }) || {};
  const calendarId = (extra?.calendarId as string) || body.calendarId || "primary";

  const { calendarId: _cid, email: _email, ...requestBody } = body;

  const patchedEvent = await calendarEvents.patch({
    ...REQUEST_CONFIG_BASE,
    calendarId,
    requestBody,
  });
  return patchedEvent.data;
}
