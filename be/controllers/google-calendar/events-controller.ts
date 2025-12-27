import { ACTION, REQUEST_CONFIG_BASE, STATUS_RESPONSE } from "@/config";
import { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import type { User } from "@supabase/supabase-js";
import { eventsHandler } from "@/utils";
import { fetchCredentialsByEmail } from "@/utils/auth/get-user-calendar-tokens";
import { initCalendarWithUserTokensAndUpdateTokens } from "@/utils/calendar/init";

const getEventById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email || "");
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
  }

  if (!req.params.eventId) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Event ID is required in order to get specific event.");
  }

  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);

  const calendarId = (req.query?.calendarId as string) ?? "primary";

  const r = await calendar.events.get({
    ...REQUEST_CONFIG_BASE,
    calendarId,
    eventId: req.params.eventId,
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Event retrieved successfully", r.data);
});

const getAllEvents = reqResAsyncHandler(async (req, res) => {
  const r = await eventsHandler(req, ACTION.GET);
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved all events", r);
});

const getAllFilteredEvents = reqResAsyncHandler(async (req, res) => {
  const r = await eventsHandler(req, ACTION.GET, undefined, req.query as Record<string, string>);

  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved all filtered events", r);
});

const createEvent = reqResAsyncHandler(async (req, res) => {
  const r = await eventsHandler(req, ACTION.INSERT, req.body, { calendarId: req.body.calendarId, email: req.body.email });
  sendR(res, STATUS_RESPONSE.CREATED, "Event created successfully", r);
});

const updateEvent = reqResAsyncHandler(async (req, res) => {
  if (!req.params.eventId) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Event ID is required in order to update event.");
  }

  const r = await eventsHandler(req, ACTION.UPDATE, {
    id: req.params.eventId,
    ...req.body,
  });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Event updated successfully", r);
});

const deleteEvent = reqResAsyncHandler(async (req, res) => {
  if (!req.params.eventId) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Event ID is required in order to delete event.");
  }
  const r = await eventsHandler(req, ACTION.DELETE, { id: req.params.eventId });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Event deleted successfully", r);
});

export default {
  getEventById,
  getAllEvents,
  getAllFilteredEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
