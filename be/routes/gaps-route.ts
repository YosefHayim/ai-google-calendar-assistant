import type { NextFunction, Request, Response } from "express";
import {
  disableGapAnalysis,
  dismissAllGaps,
  fillGap,
  getFormattedGaps,
  getGaps,
  skipGap,
} from "@/controllers/gaps-controller";

import { Router } from "express";
import { STATUS_RESPONSE } from "@/config/constants";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { logger } from "@/utils/logger";
import { sendR } from "@/utils";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = Router();

// Apply authentication middleware to all gaps routes
const withAuth = [
  supabaseAuth(),
  googleTokenValidation,
  googleTokenRefresh(),
];

// Gap parameter validation
router.param("gapId", (_req: Request, res: Response, next: NextFunction, gapId: string) => {
  if (!gapId) {
    logger.error("Gaps: gapId not found");
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Gap ID parameter is required.");
  }
  next();
});

// GET /api/gaps - Get analyzed gaps
router.get("/", withAuth, getGaps);

// GET /api/gaps/formatted - Get formatted gaps for chat
router.get("/formatted", withAuth, getFormattedGaps);

// POST /api/gaps/:gapId/fill - Fill a gap with an event
router.post("/:gapId/fill", withAuth, fillGap);

// POST /api/gaps/:gapId/skip - Skip a gap
router.post("/:gapId/skip", withAuth, skipGap);

// POST /api/gaps/dismiss-all - Dismiss all gaps
router.post("/dismiss-all", withAuth, dismissAllGaps);

// POST /api/gaps/disable - Disable gap analysis
router.post("/disable", withAuth, disableGapAnalysis);

export default router;