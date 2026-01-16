import type { Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import { reqResAsyncHandler, sendR } from "@/utils/http";

const listAclRules = reqResAsyncHandler(async (req: Request, res: Response) => {
  const r = await req.calendar?.acl.list({
    calendarId: req.params.calendarId,
    showDeleted: req.query.showDeleted === "true",
  });
  return sendR(
    res,
    STATUS_RESPONSE.SUCCESS,
    "Successfully retrieved ACL rules",
    r.data
  );
});

const getAclRule = reqResAsyncHandler(async (req: Request, res: Response) => {
  const r = await req.calendar?.acl.get({
    calendarId: req.params.calendarId,
    ruleId: req.params.ruleId,
  });
  return sendR(
    res,
    STATUS_RESPONSE.SUCCESS,
    "Successfully retrieved ACL rule",
    r.data
  );
});

const insertAclRule = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const r = await req.calendar?.acl.insert({
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
    return sendR(
      res,
      STATUS_RESPONSE.CREATED,
      "ACL rule created successfully",
      r.data
    );
  }
);

const patchAclRule = reqResAsyncHandler(async (req: Request, res: Response) => {
  const r = await req.calendar?.acl.patch({
    calendarId: req.params.calendarId,
    ruleId: req.params.ruleId,
    sendNotifications: req.query.sendNotifications === "true",
    requestBody: req.body,
  });
  return sendR(
    res,
    STATUS_RESPONSE.SUCCESS,
    "ACL rule patched successfully",
    r.data
  );
});

const updateAclRule = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const r = await req.calendar?.acl.update({
      calendarId: req.params.calendarId,
      ruleId: req.params.ruleId,
      sendNotifications: req.query.sendNotifications === "true",
      requestBody: req.body,
    });
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "ACL rule updated successfully",
      r.data
    );
  }
);

const deleteAclRule = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    await req.calendar?.acl.delete({
      calendarId: req.params.calendarId,
      ruleId: req.params.ruleId,
    });
    return sendR(res, STATUS_RESPONSE.SUCCESS, "ACL rule deleted successfully");
  }
);

const watchAcl = reqResAsyncHandler(async (req: Request, res: Response) => {
  const r = await req.calendar?.acl.watch({
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
  return sendR(
    res,
    STATUS_RESPONSE.SUCCESS,
    "ACL watch created successfully",
    r.data
  );
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
