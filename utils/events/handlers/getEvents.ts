import type { Request } from "express";
import type { calendar_v3 } from "googleapis";
import { normalizeListParams } from "../normalizeListParams";
import { transformEventList } from "../transformEvent";

/**
 * Handles GET action for calendar events
 */
export async function handleGetEvents(
  calendarEvents: calendar_v3.Resource$Events,
  req?: Request | null,
  extra?: Record<string, unknown>
): Promise<calendar_v3.Schema$Events | ReturnType<typeof transformEventList>> {
  const { listParams, customFlag } = normalizeListParams(req, extra);
  const events = await calendarEvents.list(listParams);

  if (customFlag) {
    return transformEventList(events.data.items ?? []);
  }

  return events;
}
