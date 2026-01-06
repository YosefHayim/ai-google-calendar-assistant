import {
  analyzeGapsForUser,
  fillGap,
  formatGapsForDisplay,
} from "@/utils/calendar/gap-recovery";
import type {
  FillGapBody,
  GapAnalysisQuery,
  SkipGapBody,
  UpdateGapSettingsBody,
} from "@/middlewares/validation";
import type { GapRecoverySettings } from "@/types";
import type { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";
import {
  getCachedGaps,
  setCachedGaps,
  getGapFromCache,
  removeGapFromCache,
  invalidateGapsCache,
  getUserSettings,
  saveUserSettings,
} from "@/utils/cache/gap-recovery-cache";

import { STATUS_RESPONSE } from "@/config";

const getGaps = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const email = req.user?.email;

  if (!userId || !email) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const query = (req.validatedQuery || req.query) as GapAnalysisQuery;
  const settings = await getUserSettings(userId);

  try {
    const lookbackDays = query.lookbackDays || settings.lookbackDays;

    const gaps = await analyzeGapsForUser({
      email,
      lookbackDays,
      calendarId: query.calendarId,
      settings,
    });

    const limitedGaps = gaps.slice(0, query.limit || 10);

    await setCachedGaps(userId, limitedGaps);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      `Found ${gaps.length} gaps in your calendar`,
      {
        gaps: limitedGaps,
        totalCount: gaps.length,
        analyzedRange: {
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
        },
        settings,
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze gaps";
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage);
  }
});

const getGapsFormatted = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const email = req.user?.email;

    if (!userId || !email) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    const query = (req.validatedQuery || req.query) as GapAnalysisQuery;
    const settings = await getUserSettings(userId);

    try {
      const lookbackDays = query.lookbackDays || settings.lookbackDays;

      const gaps = await analyzeGapsForUser({
        email,
        lookbackDays,
        calendarId: query.calendarId,
        settings,
      });

      const limitedGaps = gaps.slice(0, query.limit || 10);
      await setCachedGaps(userId, limitedGaps);

      const formatted = formatGapsForDisplay(limitedGaps);

      sendR(res, STATUS_RESPONSE.SUCCESS, "Gaps formatted successfully", {
        formatted,
        count: limitedGaps.length,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to format gaps";
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage);
    }
  }
);

const fillGapHandler = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const email = req.user?.email;
    const { gapId } = req.params;

    if (!userId || !email) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    if (!gapId) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Gap ID is required");
    }

    const gap = await getGapFromCache(userId, gapId);
    if (!gap) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "Gap not found or has expired. Please refresh gaps."
      );
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
        await removeGapFromCache(userId, gapId);

        sendR(res, STATUS_RESPONSE.CREATED, "Event created successfully", {
          eventId: result.eventId,
          message: `Created "${body.summary}" from ${gap.start} to ${gap.end}`,
        });
      } else {
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to create event"
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fill gap";
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage);
    }
  }
);

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

  const removed = await removeGapFromCache(userId, gapId);

  if (!removed) {
    return sendR(
      res,
      STATUS_RESPONSE.NOT_FOUND,
      "Gap not found or already skipped"
    );
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, "Gap skipped", {
    gapId,
    reason: body.reason || "User skipped",
  });
});

const dismissAllGaps = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    const cached = await getCachedGaps(userId);
    const count = cached?.gaps.length || 0;

    await invalidateGapsCache(userId);

    sendR(res, STATUS_RESPONSE.SUCCESS, "All gaps dismissed", {
      count,
      message: `Dismissed ${count} gap(s)`,
    });
  }
);

const getSettingsHandler = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    const settings = await getUserSettings(userId);

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Settings retrieved", {
      settings,
    });
  }
);

const updateSettingsHandler = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    const body = req.body as UpdateGapSettingsBody;
    const currentSettings = await getUserSettings(userId);

    const newSettings: GapRecoverySettings = {
      ...currentSettings,
      ...(body.autoGapAnalysis !== undefined && {
        autoGapAnalysis: body.autoGapAnalysis,
      }),
      ...(body.minGapThreshold !== undefined && {
        minGapThreshold: body.minGapThreshold,
      }),
      ...(body.maxGapThreshold !== undefined && {
        maxGapThreshold: body.maxGapThreshold,
      }),
      ...(body.ignoredDays !== undefined && { ignoredDays: body.ignoredDays }),
      ...(body.lookbackDays !== undefined && {
        lookbackDays: body.lookbackDays,
      }),
      ...(body.minConfidenceThreshold !== undefined && {
        minConfidenceThreshold: body.minConfidenceThreshold,
      }),
    };

    if (newSettings.minGapThreshold >= newSettings.maxGapThreshold) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Minimum gap threshold must be less than maximum gap threshold"
      );
    }

    await saveUserSettings(userId, newSettings);
    await invalidateGapsCache(userId);

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Settings updated", {
      settings: newSettings,
    });
  }
);

const disableGapAnalysis = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
    }

    const currentSettings = await getUserSettings(userId);
    const newSettings: GapRecoverySettings = {
      ...currentSettings,
      autoGapAnalysis: false,
    };

    await saveUserSettings(userId, newSettings);
    await invalidateGapsCache(userId);

    sendR(res, STATUS_RESPONSE.SUCCESS, "Gap analysis disabled", {
      message:
        "Gap analysis has been disabled. You can re-enable it in settings.",
    });
  }
);

export default {
  getGaps,
  getGapsFormatted,
  fillGap: fillGapHandler,
  skipGap,
  dismissAllGaps,
  getSettings: getSettingsHandler,
  updateSettings: updateSettingsHandler,
  disableGapAnalysis,
};
