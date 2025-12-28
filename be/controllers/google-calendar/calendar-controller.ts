import type { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { STATUS_RESPONSE } from "@/config";
import type { User } from "@supabase/supabase-js";
import type { calendar_v3 } from "googleapis";
import { fetchCredentialsByEmail } from "@/utils/auth";
import { initCalendarWithUserTokensAndUpdateTokens } from "@/utils/calendar";

/**
 * Get all calendars
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets all calendars and sends the response.
 * @example
 * const data = await getAllCalendars(req, res);
 * console.log(data);
 */
const getAllCalendars = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found in order to retrieve all calendars.");
  }
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendarList.list({ prettyPrint: true });

  if (req.query.customCalendars === "true") {
    const allCalendars = r.data.items?.map((item: calendar_v3.Schema$CalendarListEntry) => {
      return {
        calendarId: item.id,
        calendarName: item.summary,
        calendarDescription: item.description,
        calendarLocation: item.location,
        calendarColorForEvents: item.colorId,
        accessRole: item.accessRole,
        timeZoneForCalendar: item.timeZone,
        defaultReminders: item.defaultReminders,
      };
    });
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received all custom calendars", allCalendars);
  } else {
    sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received all calendars", r);
  }
});

/**
 * Get all calendar colors
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets all calendar colors and sends the response.
 * @example
 * const data = await getAllCalendarColors(req, res);
 * console.log(data);
 */
const getAllCalendarColors = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.colors.get({ alt: "json" });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar colors", r.data);
});

/**
 * Get all calendar timezones
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets all calendar timezones and sends the response.
 * @example
 * const data = await getAllCalendarTimezones(req, res);
 * console.log(data);
 */
const getAllCalendarTimezones = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.settings.get({ setting: "timezone" });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar timezone", r.data);
});

/**
 * Get calendar info by id
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets calendar info by id and sends the response.
 * @example
 * const data = await getCalendarInfoById(req, res);
 * console.log(data);
 */
const getCalendarInfoById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendars.get({ calendarId: req.params.id });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar overview", r.data);
});

/**
 * Get calendar color by id
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets calendar color by id and sends the response.
 * @example
 * const data = await getCalendarColorById(req, res);
 * console.log(data);
 */
const getCalendarColorById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendars.get({ calendarId: req.params.id });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar color", r.data);
});

/**
 * Get calendar timezone by id
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets calendar timezone by id and sends the response.
 * @example
 * const data = await getCalendarTimezoneById(req, res);
 * console.log(data);
 */
const getCalendarTimezoneById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.settings.get({ setting: "timezone" });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar timezone", r.data);
});

/**
 * Get free busy
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets free busy and sends the response.
 * @example
 * const data = await getFreeBusy(req, res);
 * console.log(data);
 */
const getFreeBusy = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.freebusy.query({
    prettyPrint: true,
    requestBody: {
      calendarExpansionMax: 50,
      groupExpansionMax: 100,
      timeMin: new Date().toISOString(),
      timeMax: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    },
  });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received free busy", r);
});

/**
 * Get settings of calendar
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets settings of calendar and sends the response.
 * @example
 * const data = await getSettingsOfCalendar(req, res);
 * console.log(data);
 */
const getSettingsOfCalendar = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.settings.get({ setting: "timezone" });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar settings", r.data);
});

/**
 * Get settings of calendar by id
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets settings of calendar by id and sends the response.
 * @example
 * const data = await getSettingsOfCalendarById(req, res);
 * console.log(data);
 */
const getSettingsOfCalendarById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await fetchCredentialsByEmail(user.email!);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.settings.get({ setting: "timezone" });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar settings", r.data);
});

export default {
  getSettingsOfCalendarById,
  getSettingsOfCalendar,
  getFreeBusy,
  getCalendarColorById,
  getCalendarTimezoneById,
  getCalendarInfoById,
  getAllCalendars,
  getAllCalendarColors,
  getAllCalendarTimezones,
};
