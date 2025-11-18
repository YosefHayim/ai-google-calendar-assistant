import type { Request } from "express";
import type { calendar_v3 } from "googleapis";
import { requestConfigBase } from "@/config/root-config";
import { extractCalendarId } from "../extractCalendarId";

/**
 * Handles UPDATE action for calendar events
 */
export async function handleUpdateEvent(
  calendarEvents: calendar_v3.Resource$Events,
  eventData?: calendar_v3.Schema$Event | Record<string, string>,
  req?: Request | null,
  extra?: Record<string, unknown>
): Promise<calendar_v3.Schema$Event> {
  const calendarId = extractCalendarId(req, extra, eventData);

  const resp = await calendarEvents.update({
    ...requestConfigBase,
    eventId: (eventData?.id as string) || "",
    requestBody: eventData,
    calendarId,
  });

  return resp.data;
}
