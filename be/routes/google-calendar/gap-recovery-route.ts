import express, { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/config";
import gapRecoveryController from "@/controllers/google-calendar/gap-recovery-controller";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { logger } from "@/utils/logger";
import { sendR } from "@/utils/http";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import {
  validate,
  gapAnalysisQuerySchema,
  gapIdParamSchema,
  fillGapSchema,
  skipGapSchema,
  updateGapSettingsSchema,
} from "@/middlewares/validation";

const router = express.Router();

// Supabase auth (with auto-refresh) + Google token validation + auto-refresh
router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh());

// Param validator for gapId
router.param("gapId", (_req: Request, res: Response, next: NextFunction, gapId: string) => {
  if (!gapId) {
    logger.error(`Gap Recovery: gapId not found`);
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Gap ID parameter is required.");
  }
  next();
});

// ============================================
// Gap Analysis Routes
// ============================================

// Get gaps (analyze calendar)
router.get("/", validate(gapAnalysisQuerySchema, "query"), gapRecoveryController.getGaps);

// Get gaps formatted for display (chat interfaces)
router.get("/formatted", validate(gapAnalysisQuerySchema, "query"), gapRecoveryController.getGapsFormatted);

// ============================================
// Gap Resolution Routes
// ============================================

// Fill a gap with a new event
router.post("/:gapId/fill", validate(fillGapSchema, "body"), gapRecoveryController.fillGap);

// Skip a specific gap
router.post("/:gapId/skip", validate(skipGapSchema, "body"), gapRecoveryController.skipGap);

// Dismiss all pending gaps
router.post("/dismiss-all", gapRecoveryController.dismissAllGaps);

// ============================================
// Settings Routes
// ============================================

// Get gap recovery settings
router.get("/settings", gapRecoveryController.getSettings);

// Update gap recovery settings
router.patch("/settings", validate(updateGapSettingsSchema, "body"), gapRecoveryController.updateSettings);

// Disable gap analysis feature
router.post("/disable", gapRecoveryController.disableGapAnalysis);

export default router;
