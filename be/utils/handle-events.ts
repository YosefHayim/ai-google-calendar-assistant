import type { Request } from "express";
import type { calendar_v3 } from "googleapis";
import { requestConfigBase } from "@/config/root-config";
import { ACTION, type AuthedRequest, STATUS_RESPONSE } from "@/types";
import { asyncHandler } from "./async-handlers";
import errorTemplate from "./error-template";
import formatDate from "./format-date";
import { getEventDurationString } from "./get-event-duration-string";
import { fetchCredentialsByEmail } from "./get-user-calendar-tokens";
import { initCalendarWithUserTokensAndUpdateTokens } from "./init-calendar-with-user-tokens-and-update-tokens";

type ListExtra = Partial<calendar_v3.Params$Resource$Events$List> & {
  email?: string;
  customEvents?: boolean;
};

type GetEventsParams = {
  req?: Request | null;
  extra?: Record<string, unknown>;
};

type InsertEventParams = {
  req?: Request | null;
  eventData?: calendar_v3.Schema$Event | Record<string, string>;
  extra?: Record<string, unknown>;
};

type UpdateEventParams = {
  req?: Request | null;
  eventData?: calendar_v3.Schema$Event | Record<string, string>;
  extra?: Record<string, unknown>;
};

type DeleteEventParams = {
  req?: Request | null;
  eventData?: calendar_v3.Schema$Event | Record<string, string>;
  extra?: Record<string, unknown>;
};

/**
 * Helper function to get email from request or extra params
 */
const getEmailFromParams = (req?: Request | null, extra?: Record<string, unknown>): string => {
  const email = (req as AuthedRequest | undefined)?.user?.email ?? (typeof extra?.email === "string" ? (extra.email as string) : undefined);
  if (!email) {
    throw new Error("Email is required to resolve calendar credentials");
  }
  return email;
};

/**
 * Helper function to initialize calendar with user credentials
 */
const getCalendarInstance = asyncHandler(async (email: string) => {
  const credentials = await fetchCredentialsByEmail(email);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(credentials);
  return calendar;
});

/**
 * Parse calendarId - support comma-separated string, array, or "all"
 */
const parseCalendarIds = async (calendarId: unknown, calendar: calendar_v3.Calendar): Promise<string[]> => {
  if (!calendarId) return ["primary"];
  if (Array.isArray(calendarId)) return calendarId;
  if (typeof calendarId === "string") {
    const trimmedId = calendarId.trim().toLowerCase();
    // If calendarId is "all", fetch all calendars for the user
    if (trimmedId === "all") {
      const calendarListResponse = await calendar.calendarList.list({ prettyPrint: true });
      const allCalendarIds =
        calendarListResponse.data.items?.map((item: calendar_v3.Schema$CalendarListEntry) => item.id).filter((id): id is string => Boolean(id)) ?? [];
      return allCalendarIds.length > 0 ? allCalendarIds : ["primary"];
    }
    // Otherwise, treat as comma-separated list
    return calendarId
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  }
  return [String(calendarId)];
};

/**
 * Get events from one or more calendars
 */
export const getEvents = asyncHandler(async (params: GetEventsParams) => {
  const { req, extra } = params;
  const email = getEmailFromParams(req, extra);
  const calendar = await getCalendarInstance(email);
  const calendarEvents = calendar.events;

  // Normalize extra/list params
  const rawExtra: ListExtra = { ...(extra as ListExtra), ...(req?.body ?? {}), ...(req?.query ?? {}) };

  const customFlag = Boolean(rawExtra.customEvents);
  const { email: _omitEmail, customEvents: _omitCustom, calendarId, orderBy, ...listExtraRaw } = rawExtra;

  // Parse calendarId - support comma-separated string, array, or "all"
  const calendarIds = await parseCalendarIds(calendarId, calendar);

  // Default orderBy to "updated" if not provided
  const orderByValue = orderBy ?? "updated";

  // Helper function to fetch events for a single calendar
  const fetchEventsForCalendar = async (calId: string): Promise<calendar_v3.Schema$Event[]> => {
    const listExtra: calendar_v3.Params$Resource$Events$List = {
      ...requestConfigBase,
      prettyPrint: true,
      maxResults: 2499,
      calendarId: calId,
      orderBy: orderByValue as "startTime" | "updated",
      ...listExtraRaw,
    };

    // Drop falsy q instead of sending null
    if (!listExtra.q) {
      (listExtra as Record<string, unknown>).q = undefined;
    }

    const events = await calendarEvents.list(listExtra);
    return events.data.items ?? [];
  };

  // Fetch events from all calendars in parallel
  const eventsPromises = calendarIds.map((calId) => fetchEventsForCalendar(calId));
  const eventsArrays = await Promise.all(eventsPromises);
  const allEvents = eventsArrays.flat();

  // Sort merged events based on orderBy
  if (orderByValue === "updated") {
    allEvents.sort((a, b) => {
      const aUpdated = a.updated ? new Date(a.updated).getTime() : 0;
      const bUpdated = b.updated ? new Date(b.updated).getTime() : 0;
      return bUpdated - aUpdated; // Descending (most recently updated first)
    });
  } else if (orderByValue === "startTime") {
    allEvents.sort((a, b) => {
      const aStart = a.start?.dateTime || a.start?.date || "";
      const bStart = b.start?.dateTime || b.start?.date || "";
      return new Date(aStart).getTime() - new Date(bStart).getTime(); // Ascending (earliest first)
    });
  }

  // Create response object matching Google Calendar API format
  const response: calendar_v3.Schema$Events = {
    kind: "calendar#events",
    etag: `"${Date.now()}"`,
    items: allEvents,
  };

  if (customFlag) {
    const items = allEvents.slice().reverse();
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
    return { totalNumberOfEventsFound: totalEventsFound.length, totalEventsFound };
  }

  // Return in the same format as the original Google Calendar API response
  // This matches the GaxiosResponse<calendar_v3.Schema$Events> format
  return response;
});

/**
 * Insert a new event
 */
export const insertEvent = asyncHandler(async (params: InsertEventParams) => {
  const { req, eventData, extra } = params;
  const email = getEmailFromParams(req, extra);
  const calendar = await getCalendarInstance(email);
  const calendarEvents = calendar.events;

  const body = (eventData as calendar_v3.Schema$Event & { calendarId?: string; email?: string }) || {};
  const calendarId = (extra?.calendarId as string) || body.calendarId || "primary";

  const { calendarId: _cid, email: _email, ...requestBody } = body;

  const createdEvent = await calendarEvents.insert({
    ...requestConfigBase,
    calendarId,
    requestBody,
  });
  return createdEvent.data;
});

/**
 * Update an existing event
 */
export const updateEvent = asyncHandler(async (params: UpdateEventParams) => {
  const { req, eventData, extra } = params;
  const email = getEmailFromParams(req, extra);
  const calendar = await getCalendarInstance(email);
  const calendarEvents = calendar.events;

  if (!eventData?.id) {
    throw new Error("Event ID is required for update action");
  }

  const body = (eventData as calendar_v3.Schema$Event & { calendarId?: string; email?: string }) || {};
  const calendarId = (extra?.calendarId as string) || body.calendarId || (req?.query.calendarId as string) || "primary";

  const resp = await calendarEvents.update({
    ...requestConfigBase,
    eventId: (eventData?.id as string) || "",
    requestBody: eventData,
    calendarId,
  });

  return resp.data;
});

/**
 * Delete an event
 */
export const deleteEvent = asyncHandler(async (params: DeleteEventParams) => {
  const { req, eventData, extra } = params;
  const email = getEmailFromParams(req, extra);
  const calendar = await getCalendarInstance(email);
  const calendarEvents = calendar.events;

  if (!eventData?.id) {
    throw new Error("Event ID is required for delete action");
  }

  const calendarId = (extra?.calendarId as string) || (req?.body.calendarId as string) || (req?.query.calendarId as string) || "primary";

  const resp = await calendarEvents.delete({
    ...requestConfigBase,
    calendarId,
    eventId: (eventData?.id as string) || "",
  });
  return resp.data;
});

/**
 * Legacy wrapper function for backward compatibility
 * @deprecated Use getEvents, insertEvent, updateEvent, or deleteEvent instead
 */
export const eventsHandler = asyncHandler(
  async (req?: Request | null, action?: ACTION, eventData?: calendar_v3.Schema$Event | Record<string, string>, extra?: Record<string, unknown>) => {
    switch (action) {
      case ACTION.GET:
        return getEvents({ req, extra });
      case ACTION.INSERT:
        return insertEvent({ req, eventData, extra });
      case ACTION.UPDATE:
        return updateEvent({ req, eventData, extra });
      case ACTION.DELETE:
        return deleteEvent({ req, eventData, extra });
      default:
        throw errorTemplate("Unsupported calendar action", STATUS_RESPONSE.BAD_REQUEST);
    }
  }
);
