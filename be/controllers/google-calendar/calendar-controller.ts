import type { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { STATUS_RESPONSE } from "@/config";
import type { User } from "@supabase/supabase-js";
import type { calendar_v3 } from "googleapis";
import { fetchCredentialsByEmail } from "@/utils/auth";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar";
import { logger } from "@/utils/logger";
import { updateUserSupabaseCalendarCategories } from "@/utils/calendar/update-categories";

/**
 * Get all calendars
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets all calendars and sends the response.
 * @example
 * const data = await getAllCalendars(req, res);
 *
 */
const getAllCalendars = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found in order to retrieve all calendars.");
  }
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendarList.list({ prettyPrint: true });

  if (req.query.customCalendars === "true") {
    const allCalendars = r.data.items?.map((calendar: calendar_v3.Schema$CalendarListEntry) => {
      return {
        calendarId: calendar.id,
        calendarName: calendar.summary,
        calendarDescription: calendar.description,
        calendarLocation: calendar.location,
        calendarColorForEvents: calendar.colorId,
        accessRole: calendar.accessRole,
        timeZoneForCalendar: calendar.timeZone,
        defaultReminders: calendar.defaultReminders,
      };
    });

    await updateUserSupabaseCalendarCategories(calendar, req.user?.email!, req.user?.id!);

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
 *
 */
const getAllCalendarColors = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
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
 *
 */
const getAllCalendarTimezones = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
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
 *
 */
const getCalendarInfoById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendars.get({ calendarId: req.params.id ?? "primary" });
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
 *
 */
const getCalendarColorById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
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
 *
 */
const getCalendarTimezoneById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
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
 *
 */
const getFreeBusy = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
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
 *
 */
const getSettingsOfCalendar = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
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
 *
 */
const getSettingsOfCalendarById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.settings.get({ setting: "timezone" });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully received calendar settings", r.data);
});

/**
 * Clear all events of calendar by id
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Clears all events of calendar by id and sends the response.
 * @example
 * const data = await clearAllEventsOfCalendar(req, res);
 *
 */
const clearAllEventsOfCalendar = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendars.clear({ calendarId: req.params.id });
  sendR(res, STATUS_RESPONSE.SUCCESS, `Successfully cleared all events of calendar ${req.params.calendarId}`, r.data);
});

/**
 * Create a new secondary calendar
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const createCalendar = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendars.insert({
    requestBody: {
      summary: req.body.summary,
      description: req.body.description,
      location: req.body.location,
      timeZone: req.body.timeZone,
    },
  });

  sendR(res, STATUS_RESPONSE.CREATED, "Calendar created successfully", r.data);
});

/**
 * Delete a secondary calendar
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const deleteCalendar = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  await calendar.calendars.delete({ calendarId: req.params.id });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Calendar deleted successfully");
});

/**
 * Partial update of calendar metadata
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const patchCalendar = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendars.patch({
    calendarId: req.params.id,
    requestBody: req.body,
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Calendar patched successfully", r.data);
});

/**
 * Full update of calendar metadata
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const updateCalendar = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendars.update({
    calendarId: req.params.id,
    requestBody: req.body,
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Calendar updated successfully", r.data);
});

/**
 * List all user settings
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const listAllSettings = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.settings.list();

  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved all settings", r.data);
});

const getDryCalendarInfo = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  // 1. FIX: Do not multiply by 1000. The DB value is already in milliseconds.
  const expiryMs = tokenData.expiry_date!;
  const expiryDate = new Date(expiryMs).toISOString();

  // 2. BETTER TIME: Calculate difference in minutes
  const now = Date.now();
  const diffMs = expiryMs - now;
  const minutesLeft = Math.floor(diffMs / 1000 / 60);

  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved dry calendar info", {
    expiryDate, // e.g., "2026-01-01T18:27:25.380Z"
    isExpired: diffMs < 0,
    // 3. FORMAT: Show nicely in minutes
    expiresIn: diffMs > 0 ? `${minutesLeft} minutes` : "Expired",
    // Optional: Keep seconds if you really need precise debugging
    debugExpiresInSeconds: Math.floor(diffMs / 1000),
  });
});

export default {
  clearAllEventsOfCalendar,
  getSettingsOfCalendarById,
  getSettingsOfCalendar,
  getFreeBusy,
  getCalendarColorById,
  getCalendarTimezoneById,
  getCalendarInfoById,
  getAllCalendars,
  getAllCalendarColors,
  getAllCalendarTimezones,
  createCalendar,
  deleteCalendar,
  patchCalendar,
  updateCalendar,
  listAllSettings,
  getDryCalendarInfo,
};
