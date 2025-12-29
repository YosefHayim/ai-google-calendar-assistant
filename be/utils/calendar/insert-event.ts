import { REQUEST_CONFIG_BASE } from "@/config";
import type { calendar_v3 } from "googleapis";

type InsertEventParams = {
  calendarEvents: calendar_v3.Resource$Events;
  eventData?: calendar_v3.Schema$Event | Record<string, string>;
  extra?: Record<string, unknown>;
};

/**
 * Insert an event into the calendar
 *
 * @param {InsertEventParams} params - The parameters for inserting an event.
 * @returns {Promise<calendar_v3.Schema$Event>} The inserted event.
 * @description Inserts an event into the calendar and sends the response.
 * @example
 * const data = await insertEvent(params);
 * console.log(data);
 */
export async function insertEvent({ calendarEvents, eventData, extra }: InsertEventParams) {
  const body = (eventData as calendar_v3.Schema$Event & { calendarId?: string; email?: string }) || {};
  const calendarId = (extra?.calendarId as string) || body.calendarId || "primary";

  const { calendarId: _cid, email: _email, ...requestBody } = body;

  const createdEvent = await calendarEvents.insert({
    ...REQUEST_CONFIG_BASE,
    calendarId,
    requestBody,
  });
  return createdEvent.data;
}
