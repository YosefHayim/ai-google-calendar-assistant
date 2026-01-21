import type { calendar_v3 } from "googleapis";
import { REQUEST_CONFIG_BASE } from "@/config";
import { getEventDurationString } from "@/domains/calendar/utils/duration";
import formatDate from "@/lib/date/format-date";

type ListExtra = Partial<calendar_v3.Params$Resource$Events$List> & {
  includeCalendarName?: boolean;
  email?: string;
  customEvents?: boolean;
};

type GetEventsParams = {
  calendarEvents: calendar_v3.Resource$Events;
  req?: {
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
  } | null;
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
 * @description Builds and normalizes list parameters for the Google Calendar events.list API.
 * Extracts calendar-specific options, applies base request configuration, and separates
 * the calendarId from other parameters for proper API formatting.
 * @param {ListExtra} rawExtra - Raw options including calendarId, customEvents flag, and list parameters.
 * @returns {{ listParams: calendar_v3.Params$Resource$Events$List; calendarId: string | undefined }} An object containing normalized list params and extracted calendarId.
 * @example
 * const { listParams, calendarId } = buildListParams({
 *   calendarId: "primary",
 *   timeMin: "2025-01-01T00:00:00Z",
 *   maxResults: 50
 * });
 */
function buildListParams(rawExtra: ListExtra): {
  listParams: calendar_v3.Params$Resource$Events$List;
  calendarId: string | undefined;
} {
  const {
    email: _omitEmail,
    customEvents: _omitCustom,
    calendarId,
    includeCalendarName: _omitIncludeCalendarName = false,
    ...listExtraRaw
  } = rawExtra;

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
 * @description Fetches raw events from the Google Calendar API using the events.list endpoint.
 * Returns the complete events data structure including items, nextPageToken, and metadata.
 * @param {calendar_v3.Resource$Events} calendarEvents - The Google Calendar events resource.
 * @param {calendar_v3.Params$Resource$Events$List} params - Parameters for the events.list API call.
 * @returns {Promise<calendar_v3.Schema$Events>} The raw events data from Google Calendar API.
 * @example
 * const eventsData = await fetchCalendarEvents(calendar.events, {
 *   calendarId: "primary",
 *   timeMin: "2025-01-01T00:00:00Z",
 *   maxResults: 100
 * });
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

/**
 * @description Fetches all events from Google Calendar with automatic pagination handling.
 * Continues fetching pages until no more results or maxPages limit is reached.
 * Consolidates all event items into a single response object.
 * @param {calendar_v3.Resource$Events} calendarEvents - The Google Calendar events resource.
 * @param {calendar_v3.Params$Resource$Events$List} params - Parameters for the events.list API call.
 * @param {number} [maxPages=50] - Maximum number of pages to fetch to prevent infinite loops.
 * @returns {Promise<calendar_v3.Schema$Events>} Consolidated events data with all items from all pages.
 * @example
 * const allEvents = await fetchAllCalendarEvents(calendar.events, {
 *   calendarId: "primary",
 *   timeMin: "2025-01-01T00:00:00Z"
 * }, 10);
 */
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
 * @description Formats a Google Calendar event into a simplified, display-friendly structure.
 * Extracts key fields and formats dates using the application's date formatting utilities.
 * @param {calendar_v3.Schema$Event} event - The raw Google Calendar event object.
 * @returns {FormattedEvent} A simplified event object with formatted dates and duration.
 * @example
 * const formatted = formatSingleEvent(calendarEvent);
 * // Returns { eventId: "abc123", summary: "Meeting", start: "Jan 15, 2025 10:00 AM", ... }
 */
export function formatSingleEvent(
  event: calendar_v3.Schema$Event
): FormattedEvent {
  const startDate = event.start?.date || event.start?.dateTime || null;
  const endDate = event.end?.date || event.end?.dateTime || null;

  return {
    eventId: event.id || "No ID",
    summary: event.summary || "Untitled Event",
    description: event.description || null,
    location: event.location || null,
    durationOfEvent:
      startDate && endDate ? getEventDurationString(startDate, endDate) : null,
    start: formatDate(startDate, true) || null,
    end: formatDate(endDate, true) || null,
  };
}

/**
 * @description Formats an array of events into a custom response structure for API responses.
 * Reverses the event order (newest first) and applies single event formatting to each.
 * @param {calendar_v3.Schema$Event[]} events - Array of raw Google Calendar events.
 * @param {string | undefined} calendarId - The calendar ID these events belong to.
 * @returns {CustomEventsResponse} A structured response with formatted events and metadata.
 * @example
 * const response = formatCustomEventsResponse(events, "primary");
 * // Returns { type: "custom", calendarId: "primary", totalNumberOfEventsFound: 5, totalEventsFound: [...] }
 */
export function formatCustomEventsResponse(
  events: calendar_v3.Schema$Event[],
  calendarId: string | undefined
): CustomEventsResponse {
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
 * @description Main entry point for retrieving events from a Google Calendar.
 * Supports both standard (raw) and custom (formatted) response formats based on the customEvents flag.
 * Merges parameters from extra options and request body/query.
 * @param {GetEventsParams} params - The parameters for getting events.
 * @param {calendar_v3.Resource$Events} params.calendarEvents - The Google Calendar events resource.
 * @param {object | null} [params.req] - Optional request object containing body/query parameters.
 * @param {Record<string, unknown>} [params.extra] - Additional options to merge with request params.
 * @returns {Promise<GetEventsResponse>} Either a CustomEventsResponse or StandardEventsResponse based on customEvents flag.
 * @example
 * // Get formatted events
 * const response = await getEvents({
 *   calendarEvents: calendar.events,
 *   extra: { calendarId: "primary", customEvents: true }
 * });
 *
 * // Get raw events
 * const rawResponse = await getEvents({
 *   calendarEvents: calendar.events,
 *   extra: { calendarId: "primary" }
 * });
 */
export async function getEvents({
  calendarEvents,
  req,
  extra,
}: GetEventsParams): Promise<GetEventsResponse> {
  const rawExtra: ListExtra = {
    ...(extra as ListExtra),
    ...(req?.body ?? {}),
    ...(req?.query ?? {}),
  };
  const customFlag = Boolean(rawExtra.customEvents);
  const { listParams, calendarId } = buildListParams(rawExtra);

  const eventsData = await fetchAllCalendarEvents(calendarEvents, listParams);

  if (customFlag) {
    return formatCustomEventsResponse(eventsData.items ?? [], calendarId);
  }

  return { type: "standard", data: eventsData };
}
