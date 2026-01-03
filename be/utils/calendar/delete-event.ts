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
export async function deleteEvent({ calendarEvents, eventData, extra, req }: DeleteEventParams) {
  const calendarId = (extra?.calendarId as string) || (req?.body?.calendarId as string) || (req?.query?.calendarId as string) || "primary";

  const resp = await calendarEvents.delete({
    ...REQUEST_CONFIG_BASE,
    calendarId,
    eventId: (eventData?.id as string) || "",
  });
  return resp.data;
}
