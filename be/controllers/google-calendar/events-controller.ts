import { ACTION, REQUEST_CONFIG_BASE, STATUS_RESPONSE } from "@/config";
import { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import type { User } from "@supabase/supabase-js";
import { eventsHandler } from "@/utils";
import { fetchCredentialsByEmail } from "@/utils/auth/get-user-calendar-tokens";
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
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
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
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
  }

  if (req.query.calendarId == "allCalendars") {
    const initCalendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
    const allCalendarsIds = (await initCalendar.calendarList.list({ prettyPrint: true }).then((r) => r.data.items?.map((calendar) => calendar.id))) || [];
    const allEventsFromAllCalendars =
      allCalendarsIds.length > 0 && (await Promise.all(allCalendarsIds.map((calendarId) => eventsHandler(req, ACTION.GET, undefined, { calendarId }))));
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved all events from all calendars", allEventsFromAllCalendars);
  } else {
    const r = await eventsHandler(req as Request, ACTION.GET, undefined, req.query as Record<string, string>);
    sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved all events", r);
  }
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
  const r = await eventsHandler(req, ACTION.INSERT, req.body, { calendarId: req.body.id, email: req.body.email });
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

export default {
  getEventById,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
