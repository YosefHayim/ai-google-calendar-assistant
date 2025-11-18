import type { User } from "@supabase/supabase-js";
import type { Request } from "express";
import type { calendar_v3 } from "googleapis";
import { requestConfigBase } from "@/config/root-config";
import { ACTION, STATUS_RESPONSE, type TokensProps } from "@/types";
import { reqResAsyncHandler } from "@/utils/asyncHandlers";
import { fetchCredentialsByEmail } from "@/utils/getUserCalendarTokens";
import { eventsHandler } from "@/utils/handleEvents";
import { initCalendarWithUserTokensAndUpdateTokens } from "@/utils/initCalendarWithUserTokens";
import sendResponseesponse from "@/utils/sendResponseesponse";
import { updateCalenderCategories } from "@/utils/updateCalendarCategories";

const getAllCalendars = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email || "");
  if (!tokenData) {
    return sendResponse(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found in order to retrieve all calendars.");
  }
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData as TokensProps);
  const r = await calendar.calendarList.list({ prettyPrint: true });

  const allCalendars = r.data.items?.map((item: calendar_v3.Schema$CalendarListEntry) => {
    return {
      calendarName: item.summary,
      calendarId: item.id,
      calendarColorForEvents: item.colorId,
      accessRole: item.accessRole,
      timeZoneForCalendar: item.timeZone,
      defaultReminders: item.defaultReminders,
    };
  });

  if (!allCalendars) {
    return;
  }

  const updateCalendarsCategories = await updateCalenderCategories(allCalendars || [], user.email || "", user.id);

  if (updateCalendarsCategories) {
    console.log("Successfully updated calendar categories in database.");
  }
  sendResponse(res, STATUS_RESPONSE.SUCCESS, "Successfully received all calendars", allCalendars);
});

const getCalendarColors = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email || "");
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData as TokensProps);
  const r = await calendar.colors.get();
  sendResponse(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar colors", r.data);
});

const getCalendarTimezone = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email || "");
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData as TokensProps);
  const r = await calendar.settings.get({ setting: "timezone" });
  sendResponse(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar timezone", r.data);
});

const getSpecificEvent = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email || "");
  if (!tokenData) {
    return sendResponse(res, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
  }

  if (!req.params.eventId) {
    return sendResponse(res, STATUS_RESPONSE.BAD_REQUEST, "Event ID is required in order to get specific event.");
  }

  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData as TokensProps);

  const calendarId = (req.query?.calendarId as string) ?? "primary";

  const r = await calendar.events.get({
    ...requestConfigBase,
    calendarId,
    eventId: req.params.eventId,
  });

  sendResponse(res, STATUS_RESPONSE.SUCCESS, "Event retrieved successfully", r.data);
});

const getAllEvents = reqResAsyncHandler(async (req, res) => {
  const r = await eventsHandler(req, ACTION.GET);
  sendResponse(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved all events", r);
});

const getAllFilteredEvents = reqResAsyncHandler(async (req, res) => {
  const r = await eventsHandler(req, ACTION.GET, undefined, req.query as Record<string, string>);

  sendResponse(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved all filtered events", r);
});

const createEvent = reqResAsyncHandler(async (req, res) => {
  const r = await eventsHandler(req, ACTION.INSERT, req.body, { calendarId: req.body.calendarId, email: req.body.email });
  sendResponse(res, STATUS_RESPONSE.CREATED, "Event created successfully", r);
});

const updateEvent = reqResAsyncHandler(async (req, res) => {
  if (!req.params.eventId) {
    return sendResponse(res, STATUS_RESPONSE.BAD_REQUEST, "Event ID is required in order to update event.");
  }

  const r = await eventsHandler(req, ACTION.UPDATE, {
    id: req.params.eventId,
    ...req.body,
  });
  sendResponse(res, STATUS_RESPONSE.SUCCESS, "Event updated successfully", r);
});

const deleteEvent = reqResAsyncHandler(async (req, res) => {
  if (!req.params.eventId) {
    return sendResponse(res, STATUS_RESPONSE.BAD_REQUEST, "Event ID is required in order to delete event.");
  }
  const r = await eventsHandler(req, ACTION.DELETE, { id: req.params.eventId });
  sendResponse(res, STATUS_RESPONSE.SUCCESS, "Event deleted successfully", r);
});

const calendarOverview = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email || "");
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData as TokensProps);
  const r = await calendar.calendars.get({ calendarId: "primary" });
  sendResponse(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar overview", r.data);
});

export default {
  calendarOverview,
  getAllCalendars,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getSpecificEvent,
  getAllFilteredEvents,
  getCalendarColors,
  getCalendarTimezone,
};
