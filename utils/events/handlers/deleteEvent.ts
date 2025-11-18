import type { Request } from "express";
import type { calendar_v3 } from "googleapis";
import { requestConfigBase } from "@/config/root-config";
import { extractCalendarId } from "../extractCalendarId";

/**
 * Handles DELETE action for calendar events
 */
export async function handleDeleteEvent(
  calendarEvents: calendar_v3.Resource$Events,
  eventData?: calendar_v3.Schema$Event | Record<string, string>,
  req?: Request | null,
  extra?: Record<string, unknown>
): Promise<void> {
  const calendarId = extractCalendarId(req, extra, eventData);

  const resp = await calendarEvents.delete({
    ...requestConfigBase,
    calendarId,
    eventId: (eventData?.id as string) || "",
  });

  return resp.data;
}
