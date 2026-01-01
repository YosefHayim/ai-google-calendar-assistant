import express, { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/config";
import aclController from "@/controllers/google-calendar/acl-controller";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { sendR } from "@/utils/http";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = express.Router();

// Supabase auth (with auto-refresh) + Google token validation + auto-refresh
router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh());

router.param("calendarId", (_req: Request, res: Response, next: NextFunction, calendarId: string) => {
  if (!calendarId) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar ID parameter is required.");
  }
  next();
});

router.param("ruleId", (_req: Request, res: Response, next: NextFunction, ruleId: string) => {
  if (!ruleId) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Rule ID parameter is required.");
  }
  next();
});

// List all ACL rules for a calendar
router.get("/:calendarId", aclController.listAclRules);

// Watch for changes to ACL (must be before /:calendarId/:ruleId)
router.post("/:calendarId/watch", aclController.watchAcl);

// Create a new ACL rule
router.post("/:calendarId", aclController.insertAclRule);

// Get a specific ACL rule
router.get("/:calendarId/:ruleId", aclController.getAclRule);

// Partial update of ACL rule
router.patch("/:calendarId/:ruleId", aclController.patchAclRule);

// Full update of ACL rule
router.put("/:calendarId/:ruleId", aclController.updateAclRule);

// Delete an ACL rule
router.delete("/:calendarId/:ruleId", aclController.deleteAclRule);

export default router;
