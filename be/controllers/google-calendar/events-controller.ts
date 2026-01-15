import type { Request, Response } from "express";
import { generateInsightsWithRetry } from "@/ai-agents/insights-generator";
import { ACTION, REQUEST_CONFIG_BASE, STATUS_RESPONSE } from "@/config";
import { eventsHandler, formatDate } from "@/utils";
import { calculateInsightsMetrics } from "@/utils/ai/insights-calculator";
import { quickAddWithOrchestrator } from "@/utils/ai/quick-add-orchestrator";
import { fetchCredentialsByEmail } from "@/utils/auth/get-user-calendar-tokens";
import {
  getCachedEvents,
  invalidateEventsCache,
  setCachedEvents,
} from "@/utils/cache/events-cache";
import {
  getCachedInsights,
  setCachedInsights,
} from "@/utils/cache/insights-cache";
import { getEvents } from "@/utils/calendar/get-events";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar/init";
import {
  applyReschedule,
  findRescheduleSuggestions,
} from "@/utils/calendar/reschedule";
import { reqResAsyncHandler, sendR } from "@/utils/http";

/**
 * Get event by event ID
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets event by event ID from calendar and sends the response.
 * @example
 * const data = await getEventById(req, res);
 *
 */
const getEventById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User tokens are not found.");
  }

  if (!req.params.id) {
    return sendR(
      res,
      STATUS_RESPONSE.BAD_REQUEST,
      "Event ID is required in order to get specific event."
    );
  }

  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);

  const r = await calendar.events.get({
    ...REQUEST_CONFIG_BASE,
    calendarId: (req?.query?.calendarId as string) ?? "primary",
    eventId: req.params.id,
  });

  return sendR(
    res,
    STATUS_RESPONSE.SUCCESS,
    "Event retrieved successfully",
    r.data
  );
});

/**
 * Get all events
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets all events and sends the response.
 * @example
 * const data = await getAllEvents(req, res);
 *
 */
const getAllEvents = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User tokens not found.");
  }

  const calendarId = (req.query.calendarId as string) || "primary";
  const timeMin = req.query.timeMin as string | undefined;
  const timeMax = req.query.timeMax as string | undefined;

  if (userId) {
    const cached = await getCachedEvents(userId, calendarId, timeMin, timeMax);
    if (cached) {
      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Successfully retrieved all events",
        {
          type: "cached",
          calendarId: cached.calendarId,
          totalCount: cached.totalCount,
          events: cached.events,
          cachedAt: cached.cachedAt,
        }
      );
    }
  }

  const r = await eventsHandler(
    req as Request,
    ACTION.GET,
    undefined,
    req.query as Record<string, string>
  );

  if (userId && r && "type" in r && r.type === "standard" && r.data?.items) {
    await setCachedEvents(userId, calendarId, r.data.items, timeMin, timeMax);
  }

  return sendR(
    res,
    STATUS_RESPONSE.SUCCESS,
    "Successfully retrieved all events",
    r
  );
});

/**
 * Create event in calendar
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Creates an event in calendar and sends the response.
 * @example
 * const data = await createEvent(req, res);
 *
 */
const createEvent = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { addMeetLink, ...eventData } = req.body;
  const r = await eventsHandler(req, ACTION.INSERT, eventData, {
    calendarId: req.query.calendarId ?? "primary",
    email: req.body.email,
    addMeetLink: addMeetLink === true,
  });

  if (req.user?.id) {
    await invalidateEventsCache(req.user.id);
  }

  return sendR(res, STATUS_RESPONSE.CREATED, "Event created successfully", r);
});

/**
 * Update event by event ID
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Updates an event by event ID and sends the response.
 * @example
 * const data = await updateEvent(req, res);
 *
 */
const updateEvent = reqResAsyncHandler(async (req: Request, res: Response) => {
  const r = await eventsHandler(req, ACTION.UPDATE, {
    id: req.params.id,
    ...req.body,
  });

  if (req.user?.id) {
    await invalidateEventsCache(req.user.id);
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Event updated successfully", r);
});

/**
 * Delete event from calendar by event ID
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Deletes an event from calendar by event ID and sends the response.
 * @example
 * const data = await deleteEvent(req, res);
 *
 */
const deleteEvent = reqResAsyncHandler(async (req: Request, res: Response) => {
  const r = await eventsHandler(req, ACTION.DELETE, { id: req.params.id });

  if (req.user?.id) {
    await invalidateEventsCache(req.user.id);
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Event deleted successfully", r);
});

/**
 * Get events analytics by start date and end date
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets event analytics by start date and end date and sends the response.
 * @example
 * const data = await getEventAnalytics(req, res);
 *
 */
const getEventAnalytics = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const tokenData = await fetchCredentialsByEmail(req.user?.email!);
    if (!tokenData) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
    }

    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);

    // Support filtering by specific calendar IDs (comma-separated)
    const calendarIdsParam = req.query.calendarIds as string | undefined;
    let allCalendarIds: string[];

    if (calendarIdsParam) {
      // Parse comma-separated calendar IDs from query param
      allCalendarIds = calendarIdsParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    } else {
      // Default: fetch all calendars
      allCalendarIds = (await calendar.calendarList
        .list({ prettyPrint: true })
        .then((r) =>
          r.data.items
            ?.map((cal) => cal.id)
            .filter((id): id is string => Boolean(id))
        )) || ["primary"];
    }

    let totalEventsFound = 0;
    const totalNumberOfCalendars = allCalendarIds.length;

    const allEvents = await Promise.all(
      allCalendarIds.map(async (calendarId) => {
        const result = await getEvents({
          calendarEvents: calendar.events,
          req: undefined,
          extra: { calendarId, ...req.query },
        });
        if (result.type === "custom") {
          totalEventsFound = result.totalNumberOfEventsFound;
          return { calendarId, events: result.totalEventsFound };
        }
        if (result.type === "standard") {
          totalEventsFound += result.data.items?.length ?? 0;
          return { calendarId, events: result.data.items ?? [] };
        }
        return { calendarId, events: [] };
      })
    );

    sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      `${totalEventsFound} events retrieved successfully from ${totalNumberOfCalendars} calendars ${
        req.query.timeMin &&
        `from ${formatDate(new Date(req.query.timeMin as string), true)} to ${formatDate(new Date(req.query.timeMax as string), true)}`
      }`,
      { allEvents }
    );
  }
);

/**
 * Quick add an event to specific calendar
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Quick adds an event and sends the response.
 * @example
 * const data = await quickAddEvent(req, res);
 *
 */
const quickAddEvent = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const email = req.user?.email;
    if (!email) {
      return sendR(
        res,
        STATUS_RESPONSE.UNAUTHORIZED,
        "User not authenticated."
      );
    }

    const { text, forceCreate } = req.body as {
      text?: string;
      forceCreate?: boolean;
    };
    if (!text) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Event text is required.");
    }

    const result = await quickAddWithOrchestrator(email, text, { forceCreate });

    if (!result.success) {
      if (result.requiresConfirmation) {
        return sendR(
          res,
          STATUS_RESPONSE.CONFLICT,
          result.error ?? "Event conflicts detected",
          {
            parsed: result.parsed,
            conflicts: result.conflicts,
            calendarId: result.calendarId,
            calendarName: result.calendarName,
          }
        );
      }
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        result.error ?? "Failed to create event."
      );
    }

    return sendR(res, STATUS_RESPONSE.CREATED, "Event created successfully", {
      event: result.event,
      parsed: result.parsed,
      calendarId: result.calendarId,
      calendarName: result.calendarName,
      eventUrl: result.eventUrl,
    });
  }
);

/**
 * Watch an events
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Watches an event and sends the response.
 * @example
 * const data = await watchEvents(req, res);
 *
 */
const watchEvents = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
  }

  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.events.watch({
    ...req.body,
    ...REQUEST_CONFIG_BASE,
    calendarId: (req.query.calendarId as string) ?? "primary",
  });
  return sendR(res, STATUS_RESPONSE.SUCCESS, "Event watched successfully", r);
});

/**
 * Move an event from one calendar to another one
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Moves an event and sends the response.
 * @example
 * const data = await moveEvent(req, res);
 *
 */
const moveEvent = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
  }

  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.events.move({
    ...req.body,
    ...REQUEST_CONFIG_BASE,
    calendarId: (req.query.calendarId as string) ?? "primary",
  });
  return sendR(res, STATUS_RESPONSE.SUCCESS, "Event moved successfully", r);
});

/**
 * Get instances of a recurring event
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const getEventInstances = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const tokenData = await fetchCredentialsByEmail(req.user?.email!);
    if (!tokenData) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
    }

    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
    const r = await calendar.events.instances({
      ...REQUEST_CONFIG_BASE,
      calendarId: (req.query.calendarId as string) ?? "primary",
      eventId: req.params.id,
      timeMin: req.query.timeMin as string,
      timeMax: req.query.timeMax as string,
      timeZone: req.query.timeZone as string,
      originalStart: req.query.originalStart as string,
      showDeleted: req.query.showDeleted === "true",
    });

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Event instances retrieved successfully",
      r.data
    );
  }
);

/**
 * Import an event (creates a private copy)
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const importEvent = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
  }

  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.events.import({
    ...REQUEST_CONFIG_BASE,
    calendarId: (req.query.calendarId as string) ?? "primary",
    conferenceDataVersion: req.query.conferenceDataVersion
      ? Number(req.query.conferenceDataVersion)
      : undefined,
    requestBody: {
      iCalUID: req.body.iCalUID,
      summary: req.body.summary,
      description: req.body.description,
      location: req.body.location,
      start: req.body.start,
      end: req.body.end,
      attendees: req.body.attendees,
      reminders: req.body.reminders,
      recurrence: req.body.recurrence,
      status: req.body.status,
      transparency: req.body.transparency,
      visibility: req.body.visibility,
      organizer: req.body.organizer,
      sequence: req.body.sequence,
    },
  });

  return sendR(
    res,
    STATUS_RESPONSE.CREATED,
    "Event imported successfully",
    r.data
  );
});

/**
 * Get AI-powered insights for calendar events
 *
 * @param {Request} req - The request object with timeMin and timeMax query params
 * @param {Response} res - The response object
 * @returns {Promise<void>} The response object with 4 AI-generated insights
 * @description Generates AI insights based on calendar event metrics with Redis caching
 */
const getInsights = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { timeMin, timeMax } = req.query as {
    timeMin?: string;
    timeMax?: string;
  };
  const userEmail = req.user?.email;

  if (!userEmail) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  if (!(timeMin && timeMax)) {
    return sendR(
      res,
      STATUS_RESPONSE.BAD_REQUEST,
      "timeMin and timeMax query parameters are required"
    );
  }

  // Check Redis cache first
  const cached = await getCachedInsights(userEmail, timeMin, timeMax);
  if (cached) {
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Insights retrieved from cache",
      cached
    );
  }

  // Fetch user tokens
  const tokenData = await fetchCredentialsByEmail(userEmail);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found");
  }

  // Initialize calendar and get all calendar IDs
  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const calendarListResponse = await calendar.calendarList.list({
    prettyPrint: true,
  });
  const calendarItems = calendarListResponse.data.items || [];

  // Build calendar map for metrics calculation
  const calendarMap: Record<string, { name: string; color: string }> = {};
  for (const cal of calendarItems) {
    if (cal.id) {
      calendarMap[cal.id] = {
        name: cal.summary || cal.id,
        color: cal.backgroundColor || "#6366f1",
      };
    }
  }

  const allCalendarIds = calendarItems
    .map((c) => c.id)
    .filter(Boolean) as string[];
  if (allCalendarIds.length === 0) {
    allCalendarIds.push("primary");
  }

  // Fetch events from all calendars (use standard response for raw event data)
  const allEventsArrays = await Promise.all(
    allCalendarIds.map(async (calendarId) => {
      const result = await getEvents({
        calendarEvents: calendar.events,
        req: undefined,
        extra: { calendarId, timeMin, timeMax, customEvents: false },
      });

      // We only use standard response for insights (raw Google Calendar events)
      if (result.type === "standard") {
        const events = result.data.items ?? [];
        // Add calendarId to each event for breakdown calculation
        return events.map((event) => ({ ...event, calendarId }));
      }

      return [];
    })
  );

  // Flatten all events
  const allEvents = allEventsArrays.flat();

  if (allEvents.length === 0) {
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "No events found for the specified period",
      {
        insights: [],
        generatedAt: new Date().toISOString(),
        periodStart: timeMin,
        periodEnd: timeMax,
      }
    );
  }

  // Calculate metrics from events
  const metrics = calculateInsightsMetrics(allEvents, calendarMap);

  // Generate insights with retry logic (3 attempts)
  const aiResponse = await generateInsightsWithRetry(
    metrics,
    timeMin,
    timeMax,
    3
  );

  // Prepare response data
  const responseData = {
    insights: aiResponse.insights,
    generatedAt: new Date().toISOString(),
    periodStart: timeMin,
    periodEnd: timeMax,
  };

  // Cache the result
  await setCachedInsights(userEmail, timeMin, timeMax, responseData);

  return sendR(
    res,
    STATUS_RESPONSE.SUCCESS,
    "Insights generated successfully",
    responseData
  );
});

/**
 * Get reschedule suggestions for an event
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object with reschedule suggestions.
 * @description Finds optimal reschedule times for a specific event.
 */
const getRescheduleSuggestions = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const email = req.user?.email;
    if (!email) {
      return sendR(
        res,
        STATUS_RESPONSE.UNAUTHORIZED,
        "User not authenticated."
      );
    }

    const { eventId } = req.params;
    if (!eventId) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Event ID is required.");
    }

    const {
      calendarId = "primary",
      preferredTimeOfDay = "any",
      daysToSearch = "7",
      excludeWeekends = "false",
    } = req.query as {
      calendarId?: string;
      preferredTimeOfDay?: "morning" | "afternoon" | "evening" | "any";
      daysToSearch?: string;
      excludeWeekends?: string;
    };

    const result = await findRescheduleSuggestions({
      email,
      eventId,
      calendarId,
      preferredTimeOfDay,
      daysToSearch: Number.parseInt(daysToSearch, 10),
      excludeWeekends: excludeWeekends === "true",
    });

    if (!result.success) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        result.error ?? "Failed to find reschedule suggestions"
      );
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Reschedule suggestions generated",
      result
    );
  }
);

/**
 * Apply a reschedule to an event
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Reschedules an event to a new time.
 */
const rescheduleEvent = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const email = req.user?.email;
    if (!email) {
      return sendR(
        res,
        STATUS_RESPONSE.UNAUTHORIZED,
        "User not authenticated."
      );
    }

    const { eventId } = req.params;
    if (!eventId) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Event ID is required.");
    }

    const {
      newStart,
      newEnd,
      calendarId = "primary",
    } = req.body as {
      newStart: string;
      newEnd: string;
      calendarId?: string;
    };

    if (!(newStart && newEnd)) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "New start and end times are required."
      );
    }

    const result = await applyReschedule({
      email,
      eventId,
      calendarId,
      newStart,
      newEnd,
    });

    if (!result.success) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        result.error ?? "Failed to reschedule event"
      );
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Event rescheduled successfully",
      result.event
    );
  }
);

export default {
  moveEvent,
  watchEvents,
  quickAddEvent,
  getEventById,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAnalytics,
  getEventInstances,
  importEvent,
  getInsights,
  getRescheduleSuggestions,
  rescheduleEvent,
};
