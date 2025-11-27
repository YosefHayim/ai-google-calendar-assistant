import type { Request } from "express";
import type { calendar_v3 } from "googleapis";
import { requestConfigBase } from "@/config/root-config";
import { extractCalendarId } from "../extractCalendarId";

/**
 * Handles INSERT action for calendar events
 */
export async function handleInsertEvent(
  calendarEvents: calendar_v3.Resource$Events,
  eventData?: calendar_v3.Schema$Event | Record<string, string>,
  req?: Request | null,
  extra?: Record<string, unknown>
): Promise<calendar_v3.Schema$Event> {
  const body = (eventData as calendar_v3.Schema$Event & { calendarId?: string; email?: string }) || {};
  const calendarId = extractCalendarId(req, extra, eventData);

  const { calendarId: _cid, email: _email, ...requestBody } = body;

  const createdEvent = await calendarEvents.insert({
    ...requestConfigBase,
    calendarId,
    requestBody,
  });

  return createdEvent.data;
}
