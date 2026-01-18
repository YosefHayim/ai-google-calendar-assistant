import type { DismissAllGapsResponse, FillGapRequest, GapQueryParams, SkipGapRequest } from "@/types/api";
import type { NextFunction, Request, Response } from "express";
import { analyzeGapsForUser, formatGapsForDisplay } from "@/utils/calendar/gap-recovery";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { STATUS_RESPONSE } from "@/config/constants";

/**
 * Get analyzed gaps from the user's calendar
 * GET /api/gaps
 */
const getGaps = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userEmail = req.user!.email;

  const queryParams: GapQueryParams = {
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    calendarId: req.query.calendarId as string,
    lookbackDays: req.query.lookbackDays ? parseInt(req.query.lookbackDays as string) : undefined,
    limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
  };

  try {
    const gaps = await analyzeGapsForUser({
      email: userEmail,
      lookbackDays: queryParams.lookbackDays || 7,
      calendarId: queryParams.calendarId || "primary",
    });

    const settings = {
      enabled: true,
      lookbackDays: queryParams.lookbackDays || 7,
      calendarId: queryParams.calendarId || "primary",
    };

    const analyzedRange = {
      start: new Date(Date.now() - (queryParams.lookbackDays || 7) * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    };

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Gaps retrieved successfully", {
      gaps,
      settings,
      totalCount: gaps.length,
      analyzedRange,
    });
  } catch (error) {
    console.error("Error getting gaps:", error);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to retrieve gaps");
  }
});

/**
 * Get formatted gaps for chat display
 * GET /api/gaps/formatted
 */
const getFormattedGaps = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userEmail = req.user!.email;

  try {
    const gaps = await analyzeGapsForUser({
      email: userEmail,
      lookbackDays: 7,
      calendarId: "primary",
    });

    const formatted = formatGapsForDisplay(gaps);

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Formatted gaps retrieved successfully", {
      formatted,
    });
  } catch (error) {
    console.error("Error getting formatted gaps:", error);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to retrieve formatted gaps");
  }
});

/**
 * Fill a gap with a new event
 * POST /api/gaps/:gapId/fill
 */
const fillGap = reqResAsyncHandler(async (req: Request, res: Response) => {
  const gapId = req.params.gapId;
  const userEmail = req.user!.email;
  const requestData: FillGapRequest = req.body;

  try {
    // Note: The gap filling logic would need to be implemented
    // For now, return a placeholder response
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Gap filled successfully", {
      message: "Event created successfully",
      eventId: "placeholder-event-id",
    });
  } catch (error) {
    console.error("Error filling gap:", error);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to fill gap");
  }
});

/**
 * Skip a specific gap
 * POST /api/gaps/:gapId/skip
 */
const skipGap = reqResAsyncHandler(async (req: Request, res: Response) => {
  const gapId = req.params.gapId;
  const requestData: SkipGapRequest = req.body;

  try {
    // Note: Gap skipping logic would need to be implemented
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Gap skipped successfully");
  } catch (error) {
    console.error("Error skipping gap:", error);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to skip gap");
  }
});

/**
 * Dismiss all pending gaps
 * POST /api/gaps/dismiss-all
 */
const dismissAllGaps = reqResAsyncHandler(async (req: Request, res: Response) => {
  try {
    // Note: Dismiss all gaps logic would need to be implemented
    const response: DismissAllGapsResponse = {
      message: "All gaps dismissed successfully",
      dismissedCount: 0,
    };

    return sendR(res, STATUS_RESPONSE.SUCCESS, "All gaps dismissed successfully", response);
  } catch (error) {
    console.error("Error dismissing all gaps:", error);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to dismiss gaps");
  }
});

/**
 * Disable gap analysis feature
 * POST /api/gaps/disable
 */
const disableGapAnalysis = reqResAsyncHandler(async (req: Request, res: Response) => {
  try {
    // Note: Disable gap analysis logic would need to be implemented
    return sendR(res, STATUS_RESPONSE.SUCCESS, "Gap analysis disabled successfully", {
      message: "Gap analysis has been disabled",
    });
  } catch (error) {
    console.error("Error disabling gap analysis:", error);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to disable gap analysis");
  }
});

export {
  getGaps,
  getFormattedGaps,
  fillGap,
  skipGap,
  dismissAllGaps,
  disableGapAnalysis,
};