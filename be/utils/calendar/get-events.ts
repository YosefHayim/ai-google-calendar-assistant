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

export type FormattedEvent = {
  eventId: string;
  summary: string;
  description: string | null;
  location: string | null;
  durationOfEvent: string | null;
  start: string | null;
  end: string | null;
};

export type CustomEventsResponse = {
  type: "custom";
  calendarId: string | undefined;
  totalNumberOfEventsFound: number;
  totalEventsFound: FormattedEvent[];
};

export type StandardEventsResponse = {
  type: "standard";
  data: calendar_v3.Schema$Events;
};

export type GetEventsResponse = CustomEventsResponse | StandardEventsResponse;

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
  const { data } = await calendarEvents.list(params);
  return data;
}

const GOOGLE_CALENDAR_MAX_RESULTS = 2500;
const DEFAULT_MAX_PAGINATION_PAGES = 50;

export async function fetchAllCalendarEvents(
  calendarEvents: calendar_v3.Resource$Events,
  params: calendar_v3.Params$Resource$Events$List,
  maxPages = DEFAULT_MAX_PAGINATION_PAGES
): Promise<calendar_v3.Schema$Events> {
  const allItems: calendar_v3.Schema$Event[] = [];
  let pageToken: string | undefined;
  let pageCount = 0;
  let lastResponse: calendar_v3.Schema$Events | null = null;

  const paginatedParams: calendar_v3.Params$Resource$Events$List = {
    ...params,
    maxResults: params.maxResults ?? GOOGLE_CALENDAR_MAX_RESULTS,
  };

  do {
    const { data } = await calendarEvents.list({
      ...paginatedParams,
      pageToken,
    });

    lastResponse = data;

    if (data.items) {
      allItems.push(...data.items);
    }

    pageToken = data.nextPageToken ?? undefined;
    pageCount++;

    if (pageCount >= maxPages) {
      break;
    }
  } while (pageToken);

  return {
    ...lastResponse,
    items: allItems,
    nextPageToken: undefined,
  };
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
    type: "custom",
    calendarId,
    totalNumberOfEventsFound: totalEventsFound.length,
    totalEventsFound,
  };
}

/**
 * Get events from the calendar
 *
 * @param {GetEventsParams} params - The parameters for getting events.
 * @returns {Promise<GetEventsResponse>} The events response with type discriminator.
 */
export async function getEvents({ calendarEvents, req, extra }: GetEventsParams): Promise<GetEventsResponse> {
  const rawExtra: ListExtra = { ...(extra as ListExtra), ...(req?.body ?? {}), ...(req?.query ?? {}) };
  const customFlag = Boolean(rawExtra.customEvents);
  const { listParams, calendarId } = buildListParams(rawExtra);

  const eventsData = await fetchAllCalendarEvents(calendarEvents, listParams);

  if (customFlag) {
    return formatCustomEventsResponse(eventsData.items ?? [], calendarId);
  }

  return { type: "standard", data: eventsData };
}
