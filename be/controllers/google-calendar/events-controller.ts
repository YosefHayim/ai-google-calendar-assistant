import { ACTION, REQUEST_CONFIG_BASE, STATUS_RESPONSE } from "@/config";
import { Request, Response } from "express";
import { eventsHandler, formatDate, getEventDurationString } from "@/utils";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { fetchCredentialsByEmail } from "@/utils/auth/get-user-calendar-tokens";
import { getEvents } from "@/utils/calendar/get-events";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar/init";

/**
 * Get event by event ID
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets event by event ID from calendar and sends the response.
 * @example
 * const data = await getEventById(req, res);
 * console.log(data);
 */
const getEventById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User tokens are not found.");
  }

  if (!req.params.id) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Event ID is required in order to get specific event.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);

  const r = await calendar.events.get({
    ...REQUEST_CONFIG_BASE,
    calendarId: (req?.query?.calendarId as string) ?? "primary",
    eventId: req.params.id,
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Event retrieved successfully", r.data);
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
 * console.log(data);
 */
const getAllEvents = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User tokens not found.");
  }

  const r = await eventsHandler(req as Request, ACTION.GET, undefined, req.query as Record<string, string>);
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved all events", r);
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
 * console.log(data);
 */
const createEvent = reqResAsyncHandler(async (req: Request, res: Response) => {
  const r = await eventsHandler(req, ACTION.INSERT, req.body, { calendarId: req.query.calendarId ?? "primary", email: req.body.email });
  sendR(res, STATUS_RESPONSE.CREATED, "Event created successfully", r);
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
 * console.log(data);
 */
const updateEvent = reqResAsyncHandler(async (req: Request, res: Response) => {
  const r = await eventsHandler(req, ACTION.UPDATE, {
    id: req.params.id,
    ...req.body,
  });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Event updated successfully", r);
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
 * console.log(data);
 */
const deleteEvent = reqResAsyncHandler(async (req: Request, res: Response) => {
  const r = await eventsHandler(req, ACTION.DELETE, { id: req.params.id });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Event deleted successfully", r);
});

const getEventAnalytics = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const allCalendarIds = (await calendar.calendarList.list({ prettyPrint: true }).then((r) => r.data.items?.map((calendar) => calendar.id))) || ["primary"];

  const allEvents = await Promise.all(
    allCalendarIds.map((calendarId) => getEvents({ calendarEvents: calendar.events, req: undefined, extra: { calendarId, ...req.query } }))
  );

  sendR(
    res,
    STATUS_RESPONSE.SUCCESS,
    `${allEvents.length} events retrieved successfully from ${allCalendarIds.length} calendars ${
      req.query.timeMin && `from ${formatDate(new Date(req.query.timeMin as string), true)} to ${formatDate(new Date(req.query.timeMax as string), true)}`
    }`,
    { allEvents }
  );
});

const quickAddEvent = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.events.quickAdd({
    ...req.body,
    ...REQUEST_CONFIG_BASE,
    calendarId: (req.query.calendarId as string) ?? "primary",
  });
});

const watchEvents = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.events.watch({
    ...req.body,
    ...REQUEST_CONFIG_BASE,
    calendarId: (req.query.calendarId as string) ?? "primary",
  });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Event watched successfully", r);
});

export default {
  getEventById,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventAnalytics,
};
