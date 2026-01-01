import type { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { REQUEST_CONFIG_BASE, STATUS_RESPONSE } from "@/config";
import { fetchCredentialsByEmail } from "@/utils/auth";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar";

/**
 * List all calendars on the user's calendar list
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const listCalendars = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendarList.list({
    prettyPrint: true,
    minAccessRole: req.query.minAccessRole as string,
    showDeleted: req.query.showDeleted === "true",
    showHidden: req.query.showHidden === "true",
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved calendar list", r.data);
});

/**
 * Get a specific calendar from the user's calendar list
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const getCalendarListEntry = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendarList.get({
    calendarId: req.params.id,
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved calendar list entry", r.data);
});

/**
 * Insert an existing calendar into the user's calendar list
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const insertCalendarToList = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendarList.insert({
    requestBody: {
      id: req.body.id,
      colorId: req.body.colorId,
      backgroundColor: req.body.backgroundColor,
      foregroundColor: req.body.foregroundColor,
      hidden: req.body.hidden,
      selected: req.body.selected,
      defaultReminders: req.body.defaultReminders,
      notificationSettings: req.body.notificationSettings,
      summaryOverride: req.body.summaryOverride,
    },
    colorRgbFormat: req.query.colorRgbFormat === "true",
  });

  sendR(res, STATUS_RESPONSE.CREATED, "Calendar added to list successfully", r.data);
});

/**
 * Partial update of calendar list entry (patch)
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const patchCalendarListEntry = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendarList.patch({
    calendarId: req.params.id,
    requestBody: req.body,
    colorRgbFormat: req.query.colorRgbFormat === "true",
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Calendar list entry patched successfully", r.data);
});

/**
 * Full update of calendar list entry
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const updateCalendarListEntry = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendarList.update({
    calendarId: req.params.id,
    requestBody: req.body,
    colorRgbFormat: req.query.colorRgbFormat === "true",
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Calendar list entry updated successfully", r.data);
});

/**
 * Remove a calendar from the user's calendar list
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const deleteCalendarFromList = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  await calendar.calendarList.delete({
    calendarId: req.params.id,
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Calendar removed from list successfully");
});

/**
 * Watch for changes to calendar list resources
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const watchCalendarList = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendarList.watch({
    requestBody: {
      id: req.body.id,
      type: req.body.type || "web_hook",
      address: req.body.address,
      token: req.body.token,
      expiration: req.body.expiration,
      params: req.body.params,
    },
    minAccessRole: req.query.minAccessRole as string,
    showDeleted: req.query.showDeleted === "true",
    showHidden: req.query.showHidden === "true",
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Calendar list watch created successfully", r.data);
});

export default {
  listCalendars,
  getCalendarListEntry,
  insertCalendarToList,
  patchCalendarListEntry,
  updateCalendarListEntry,
  deleteCalendarFromList,
  watchCalendarList,
};
