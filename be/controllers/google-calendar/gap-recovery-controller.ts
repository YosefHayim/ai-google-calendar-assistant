import { DEFAULT_GAP_RECOVERY_SETTINGS, analyzeGapsForUser, fillGap, formatGapsForDisplay } from "@/utils/calendar/gap-recovery";
import type { FillGapBody, GapAnalysisQuery, SkipGapBody, UpdateGapSettingsBody } from "@/middlewares/validation";
import type { GapCandidateDTO, GapRecoverySettings } from "@/types";
import type { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { STATUS_RESPONSE } from "@/config";

// In-memory store for gap candidates (per user session)
// In production, this should be stored in Redis or database
const gapCandidatesStore = new Map<string, { gaps: GapCandidateDTO[]; analyzedAt: Date }>();
const userSettingsStore = new Map<string, GapRecoverySettings>();

// Helper to get user's gap recovery settings
function getUserSettings(userId: string): GapRecoverySettings {
  return userSettingsStore.get(userId) || { ...DEFAULT_GAP_RECOVERY_SETTINGS };
}

// Helper to save user's gap recovery settings
function saveUserSettings(userId: string, settings: GapRecoverySettings): void {
  userSettingsStore.set(userId, settings);
}

// Helper to get cached gaps
function getCachedGaps(userId: string): GapCandidateDTO[] | null {
  const cached = gapCandidatesStore.get(userId);
  if (!cached) return null;

  // Cache expires after 1 hour
  const cacheAge = Date.now() - cached.analyzedAt.getTime();
  if (cacheAge > 60 * 60 * 1000) {
    gapCandidatesStore.delete(userId);
    return null;
  }

  return cached.gaps;
}

// Helper to cache gaps
function cacheGaps(userId: string, gaps: GapCandidateDTO[]): void {
  gapCandidatesStore.set(userId, { gaps, analyzedAt: new Date() });
}

// Helper to remove a gap from cache by ID
function removeGapFromCache(userId: string, gapId: string): boolean {
  const cached = gapCandidatesStore.get(userId);
  if (!cached) return false;

  const index = cached.gaps.findIndex((g) => g.id === gapId);
  if (index === -1) return false;

  cached.gaps.splice(index, 1);
  return true;
}

// Helper to get a specific gap from cache
function getGapFromCache(userId: string, gapId: string): GapCandidateDTO | null {
  const cached = gapCandidatesStore.get(userId);
  if (!cached) return null;

  return cached.gaps.find((g) => g.id === gapId) || null;
}

/**
 * Analyze calendar for gaps
 * GET /api/gaps
 */
const getGaps = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const email = req.user?.email;

  if (!userId || !email) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const query = req.query as unknown as GapAnalysisQuery;
  const settings = getUserSettings(userId);

  try {
    // Use provided dates or default to lookback
    const lookbackDays = query.lookbackDays || settings.lookbackDays;

    const gaps = await analyzeGapsForUser({
      email,
      lookbackDays,
      calendarId: query.calendarId,
      settings,
    });

    // Apply limit
    const limitedGaps = gaps.slice(0, query.limit || 10);

    // Cache the results
    cacheGaps(userId, limitedGaps);

    // Calculate analyzed range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    sendR(res, STATUS_RESPONSE.SUCCESS, `Found ${gaps.length} gaps in your calendar`, {
      gaps: limitedGaps,
      totalCount: gaps.length,
      analyzedRange: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
      },
      settings,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze gaps";
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage);
  }
});

/**
 * Get gaps formatted for display (e.g., for chat interfaces)
 * GET /api/gaps/formatted
 */
const getGapsFormatted = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const email = req.user?.email;

  if (!userId || !email) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const query = req.query as unknown as GapAnalysisQuery;
  const settings = getUserSettings(userId);

  try {
    const lookbackDays = query.lookbackDays || settings.lookbackDays;

    const gaps = await analyzeGapsForUser({
      email,
      lookbackDays,
      calendarId: query.calendarId,
      settings,
    });

    const limitedGaps = gaps.slice(0, query.limit || 10);
    cacheGaps(userId, limitedGaps);

    const formatted = formatGapsForDisplay(limitedGaps);

    sendR(res, STATUS_RESPONSE.SUCCESS, "Gaps formatted successfully", {
      formatted,
      count: limitedGaps.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to format gaps";
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage);
  }
});

/**
 * Fill a gap with a new calendar event
 * POST /api/gaps/:gapId/fill
 */
const fillGapHandler = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const email = req.user?.email;
  const { gapId } = req.params;

  if (!userId || !email) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  if (!gapId) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Gap ID is required");
  }

  // Get gap from cache
  const gap = getGapFromCache(userId, gapId);
  if (!gap) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Gap not found or has expired. Please refresh gaps.");
  }

  const body = req.body as FillGapBody;

  try {
    const result = await fillGap({
      email,
      gapId,
      gapStart: new Date(gap.start),
      gapEnd: new Date(gap.end),
      calendarId: body.calendarId || "primary",
      eventDetails: {
        summary: body.summary,
        description: body.description,
        location: body.location,
        calendarId: body.calendarId,
      },
    });

    if (result.success) {
      // Remove from cache
      removeGapFromCache(userId, gapId);

      sendR(res, STATUS_RESPONSE.CREATED, "Event created successfully", {
        eventId: result.eventId,
        message: `Created "${body.summary}" from ${gap.start} to ${gap.end}`,
      });
    } else {
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to create event");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fill gap";
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage);
  }
});

/**
 * Skip a specific gap
 * POST /api/gaps/:gapId/skip
 */
const skipGap = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { gapId } = req.params;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  if (!gapId) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Gap ID is required");
  }

  const body = req.body as SkipGapBody;

  // Remove from cache (skipped gaps won't be shown again in this session)
  const removed = removeGapFromCache(userId, gapId);

  if (!removed) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Gap not found or already skipped");
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, "Gap skipped", {
    gapId,
    reason: body.reason || "User skipped",
  });
});

/**
 * Dismiss all pending gaps
 * POST /api/gaps/dismiss-all
 */
const dismissAllGaps = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const cached = gapCandidatesStore.get(userId);
  const count = cached?.gaps.length || 0;

  // Clear cache
  gapCandidatesStore.delete(userId);

  sendR(res, STATUS_RESPONSE.SUCCESS, "All gaps dismissed", {
    count,
    message: `Dismissed ${count} gap(s)`,
  });
});

/**
 * Get gap recovery settings
 * GET /api/gaps/settings
 */
const getSettings = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const settings = getUserSettings(userId);

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Settings retrieved", { settings });
});

/**
 * Update gap recovery settings
 * PATCH /api/gaps/settings
 */
const updateSettings = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const body = req.body as UpdateGapSettingsBody;
  const currentSettings = getUserSettings(userId);

  // Merge with existing settings
  const newSettings: GapRecoverySettings = {
    ...currentSettings,
    ...(body.autoGapAnalysis !== undefined && { autoGapAnalysis: body.autoGapAnalysis }),
    ...(body.minGapThreshold !== undefined && { minGapThreshold: body.minGapThreshold }),
    ...(body.maxGapThreshold !== undefined && { maxGapThreshold: body.maxGapThreshold }),
    ...(body.ignoredDays !== undefined && { ignoredDays: body.ignoredDays }),
    ...(body.lookbackDays !== undefined && { lookbackDays: body.lookbackDays }),
    ...(body.minConfidenceThreshold !== undefined && { minConfidenceThreshold: body.minConfidenceThreshold }),
  };

  // Validate min < max threshold
  if (newSettings.minGapThreshold >= newSettings.maxGapThreshold) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Minimum gap threshold must be less than maximum gap threshold");
  }

  saveUserSettings(userId, newSettings);

  // Clear cached gaps since settings changed
  gapCandidatesStore.delete(userId);

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Settings updated", { settings: newSettings });
});

/**
 * Disable gap analysis feature
 * POST /api/gaps/disable
 */
const disableGapAnalysis = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const currentSettings = getUserSettings(userId);
  const newSettings: GapRecoverySettings = {
    ...currentSettings,
    autoGapAnalysis: false,
  };

  saveUserSettings(userId, newSettings);
  gapCandidatesStore.delete(userId);

  sendR(res, STATUS_RESPONSE.SUCCESS, "Gap analysis disabled", {
    message: "Gap analysis has been disabled. You can re-enable it in settings.",
  });
});

export default {
  getGaps,
  getGapsFormatted,
  fillGap: fillGapHandler,
  skipGap,
  dismissAllGaps,
  getSettings,
  updateSettings,
  disableGapAnalysis,
};
