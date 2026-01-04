import type { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { STATUS_RESPONSE } from "@/config";
import { fetchCredentialsByEmail } from "@/utils/auth";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar";
import { logger } from "@/utils/logger";

/**

 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @description -  List access control rules for a calendar
 * @returns {Promise<void>} The response object.
 */
const listAclRules = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    logger.error(`Google Calendar: ACL: listAclRules called: User credentials not found.`);
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.acl.list({
    calendarId: req.params.calendarId,
    showDeleted: req.query.showDeleted === "true",
  });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved ACL rules", r.data);
});

/**
 * Get a specific access control rule
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const getAclRule = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    logger.error(`Google Calendar: ACL: getAclRule called: User credentials not found.`);
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.acl.get({
    calendarId: req.params.calendarId,
    ruleId: req.params.ruleId,
  });
  sendR(res, STATUS_RESPONSE.SUCCESS, "Successfully retrieved ACL rule", r.data);
});

/**
 * Create an access control rule
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const insertAclRule = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    logger.error(`Google Calendar: ACL: insertAclRule called: User credentials not found.`);
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.acl.insert({
    calendarId: req.params.calendarId,
    sendNotifications: req.query.sendNotifications === "true",
    requestBody: {
      role: req.body.role,
      scope: {
        type: req.body.scope?.type,
        value: req.body.scope?.value,
      },
    },
  });
  sendR(res, STATUS_RESPONSE.CREATED, "ACL rule created successfully", r.data);
});

/**
 * Partial update of an access control rule
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const patchAclRule = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    logger.error(`Google Calendar: ACL: patchAclRule called: User credentials not found.`);
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.acl.patch({
    calendarId: req.params.calendarId,
    ruleId: req.params.ruleId,
    sendNotifications: req.query.sendNotifications === "true",
    requestBody: req.body,
  });
  sendR(res, STATUS_RESPONSE.SUCCESS, "ACL rule patched successfully", r.data);
});

/**
 * Full update of an access control rule
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const updateAclRule = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    logger.error(`Google Calendar: ACL: updateAclRule called: User credentials not found.`);
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.acl.update({
    calendarId: req.params.calendarId,
    ruleId: req.params.ruleId,
    sendNotifications: req.query.sendNotifications === "true",
    requestBody: req.body,
  });
  sendR(res, STATUS_RESPONSE.SUCCESS, "ACL rule updated successfully", r.data);
});

/**
 * Delete an access control rule
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const deleteAclRule = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    logger.error(`Google Calendar: ACL: deleteAclRule called: User credentials not found.`);
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  await calendar.acl.delete({
    calendarId: req.params.calendarId,
    ruleId: req.params.ruleId,
  });
  sendR(res, STATUS_RESPONSE.SUCCESS, "ACL rule deleted successfully");
});

/**
 * Watch for changes to ACL resources
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const watchAcl = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    logger.error(`Google Calendar: ACL: watchAcl called: User credentials not found.`);
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  const r = await calendar.acl.watch({
    calendarId: req.params.calendarId,
    showDeleted: req.query.showDeleted === "true",
    requestBody: {
      id: req.body.id,
      type: req.body.type || "web_hook",
      address: req.body.address,
      token: req.body.token,
      expiration: req.body.expiration,
      params: req.body.params,
    },
  });
  sendR(res, STATUS_RESPONSE.SUCCESS, "ACL watch created successfully", r.data);
});

export default {
  listAclRules,
  getAclRule,
  insertAclRule,
  patchAclRule,
  updateAclRule,
  deleteAclRule,
  watchAcl,
};
