import express, { type NextFunction, type Request, type Response } from "express"
import { STATUS_RESPONSE } from "@/config"
import aclController from "@/controllers/google-calendar/acl-controller"
import { googleTokenRefresh } from "@/middlewares/google-token-refresh"
import { googleTokenValidation } from "@/middlewares/google-token-validation"
import { withCalendarClient } from "@/middlewares/calendar-client"
import { logger } from "@/utils/logger"
import { sendR } from "@/utils/http"
import { supabaseAuth } from "@/middlewares/supabase-auth"

const router = express.Router()

router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh(), withCalendarClient)

router.param("calendarId", (_req: Request, res: Response, next: NextFunction, calendarId: string) => {
  if (!calendarId) {
    logger.error(`Google Calendar: ACL: calendarId not found`);
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar ID parameter is required.");
  }
  next();
});

router.param("ruleId", (_req: Request, res: Response, next: NextFunction, ruleId: string) => {
  if (!ruleId) {
    logger.error(`Google Calendar: ACL: ruleId not found`);
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
