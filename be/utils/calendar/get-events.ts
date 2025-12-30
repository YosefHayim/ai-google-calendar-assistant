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

type FormattedEvent = {
  eventId: string;
  summary: string;
  description: string | null;
  location: string | null;
  durationOfEvent: string | null;
  start: string | null;
  end: string | null;
};

type CustomEventsResponse = {
  calendarId: string | undefined;
  totalNumberOfEventsFound: number;
  totalEventsFound: FormattedEvent[];
};

/**
 * Build list parameters for Google Calendar API
 */
function buildListParams(rawExtra: ListExtra): { listParams: calendar_v3.Params$Resource$Events$List; calendarId: string | undefined } {
  const { email: _omitEmail, customEvents: _omitCustom, calendarId, includeCalendarName: _omitIncludeCalendarName = false, ...listExtraRaw } = rawExtra;

  const listParams: calendar_v3.Params$Resource$Events$List = {
    ...REQUEST_CONFIG_BASE,
    prettyPrint: true,
    calendarId,
    ...listExtraRaw,
  };

  if (!listParams.q) {
    (listParams as Record<string, unknown>).q = undefined;
  }

  return { listParams, calendarId };
}

/**
 * Fetch raw events from Google Calendar API
 */
export async function fetchCalendarEvents(
  calendarEvents: calendar_v3.Resource$Events,
  params: calendar_v3.Params$Resource$Events$List
): Promise<calendar_v3.Schema$Events> {
  const response = await calendarEvents.list(params);
  return response.data;
}

/**
 * Format a single event into custom format
 */
export function formatSingleEvent(event: calendar_v3.Schema$Event): FormattedEvent {
  const startDate = event.start?.date || event.start?.dateTime || null;
  const endDate = event.end?.date || event.end?.dateTime || null;

  return {
    eventId: event.id || "No ID",
    summary: event.summary || "Untitled Event",
    description: event.description || null,
    location: event.location || null,
    durationOfEvent: startDate && endDate ? getEventDurationString(startDate, endDate) : null,
    start: formatDate(startDate, true) || null,
    end: formatDate(endDate, true) || null,
  };
}

/**
 * Format events into custom response format
 */
export function formatCustomEventsResponse(events: calendar_v3.Schema$Event[], calendarId: string | undefined): CustomEventsResponse {
  const items = events.slice().reverse();
  const totalEventsFound = items.map(formatSingleEvent);

  return {
    calendarId,
    totalNumberOfEventsFound: totalEventsFound.length,
    totalEventsFound,
  };
}

/**
 * Get events from the calendar
 *
 * @param {GetEventsParams} params - The parameters for getting events.
 * @returns {Promise<CustomEventsResponse | calendar_v3.Schema$Events>} The events.
 */
export async function getEvents({ calendarEvents, req, extra }: GetEventsParams) {
  const rawExtra: ListExtra = { ...(extra as ListExtra), ...(req?.body ?? {}), ...(req?.query ?? {}) };
  const customFlag = Boolean(rawExtra.customEvents);
  const { listParams, calendarId } = buildListParams(rawExtra);

  const eventsData = await fetchCalendarEvents(calendarEvents, listParams);

  if (customFlag) {
    return formatCustomEventsResponse(eventsData.items ?? [], calendarId);
  }

  return { data: eventsData };
}
