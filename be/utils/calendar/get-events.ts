import { REQUEST_CONFIG_BASE } from "@/config";
import type { calendar_v3 } from "googleapis";
import formatDate from "@/utils/date/format-date";
import { getEventDurationString } from "@/utils/calendar/duration";

type ListExtra = Partial<calendar_v3.Params$Resource$Events$List> & {
  includeCalendarName?: boolean;
  email?: string;
  customEvents?: boolean;
};

type GetEventsParams = {
  calendarEvents: calendar_v3.Resource$Events;
  req?: { body?: Record<string, unknown>; query?: Record<string, unknown> } | null;
  extra?: Record<string, unknown>;
};

/**
 * Get events from the calendar
 *
 * @param {GetEventsParams} params - The parameters for getting events.
 * @returns {Promise<calendar_v3.Schema$Event>} The events.
 * @description Gets events from the calendar and sends the response.
 * @example
 * const data = await getEvents(params);
 * console.log(data);
 */
export async function getEvents({ calendarEvents, req, extra }: GetEventsParams) {
  const rawExtra: ListExtra = { ...(extra as ListExtra), ...(req?.body ?? {}), ...(req?.query ?? {}) };

  const customFlag = Boolean(rawExtra.customEvents);
  const { email: _omitEmail, customEvents: _omitCustom, calendarId, includeCalendarName: _omitIncludeCalendarName = false, ...listExtraRaw } = rawExtra;

  const listExtra: calendar_v3.Params$Resource$Events$List = {
    ...REQUEST_CONFIG_BASE,
    prettyPrint: true,
    calendarId,
    ...listExtraRaw,
  };

  if (!listExtra.q) {
    (listExtra as Record<string, unknown>).q = undefined;
  }
  const events = await calendarEvents.list(listExtra);

  if (customFlag) {
    const items = (events.data.items ?? []).slice().reverse();
    const totalEventsFound = items.map((event: calendar_v3.Schema$Event) => {
      const startDate = event.start?.date || event.start?.dateTime || null;
      const endDate = event.end?.date || event.end?.dateTime || null;
      return {
        eventId: event.id || "No ID",
        summary: event.summary || "Untitled Event",
        description: event.description || null,
        location: event.location || null,
        durationOfEvent: startDate && endDate ? getEventDurationString(startDate as string, endDate as string) : null,
        start: formatDate(startDate, true) || null,
        end: formatDate(endDate, true) || null,
      };
    });
    return { calendarId, totalNumberOfEventsFound: totalEventsFound.length, totalEventsFound };
  }
  return events;
}
