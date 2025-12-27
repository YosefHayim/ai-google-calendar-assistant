import { REQUEST_CONFIG_BASE } from "@/config";
import type { calendar_v3 } from "googleapis";

type InsertEventParams = {
  calendarEvents: calendar_v3.Resource$Events;
  eventData?: calendar_v3.Schema$Event | Record<string, string>;
  extra?: Record<string, unknown>;
};

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
