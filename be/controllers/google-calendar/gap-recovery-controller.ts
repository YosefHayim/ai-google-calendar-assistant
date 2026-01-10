import {
  analyzeGapsForUser,
  fillGap,
  formatGapsForDisplay,
} from "@/utils/calendar/gap-recovery"
import type {
  FillGapBody,
  GapAnalysisQuery,
  SkipGapBody,
  UpdateGapSettingsBody,
} from "@/middlewares/validation"
import type { GapCandidateDTO, GapRecoverySettings } from "@/types"
import type { Request, Response } from "express"
import { reqResAsyncHandler, sendR } from "@/utils/http"
import { requireUserId, requireUser } from "@/utils/auth"
import {
  setCachedGaps,
  getGapFromCache,
  removeGapFromCache,
  invalidateGapsCache,
} from "@/utils/cache/gap-recovery-cache"
import {
  skipGapInDb,
  dismissAllGapsInDb,
  markGapAsFilledInDb,
  getGapById,
  saveGapCandidate,
  getResolvedGapFingerprints,
  getGapSettingsFromDb,
  saveGapSettingsToDb,
} from "@/utils/db/gap-repository"

import { STATUS_RESPONSE } from "@/config"

const MS_PER_MINUTE = 60_000

function createGapFingerprint(
  userId: string,
  startTime: string,
  precedingEventId: string,
  followingEventId: string
): string {
  return `${userId}:${startTime}::${precedingEventId}:${followingEventId}`
}

const getGaps = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userResult = requireUser(req, res)
  if (!userResult.success) return
  const { userId, userEmail: email } = userResult

  const query = (req.validatedQuery || req.query) as GapAnalysisQuery
  const settings = await getGapSettingsFromDb(userId)

  try {
    const lookbackDays = query.lookbackDays || settings.lookbackDays

    const gaps = await analyzeGapsForUser({
      email,
      lookbackDays,
      calendarId: query.calendarId,
      settings,
    })

    const resolvedFingerprints = await getResolvedGapFingerprints(userId)

    const filteredGaps = gaps.filter((gap) => {
      const fingerprint = createGapFingerprint(
        userId,
        gap.start,
        gap.precedingEventSummary,
        gap.followingEventSummary
      )
      return !resolvedFingerprints.has(fingerprint)
    })

    const DEFAULT_LIMIT = 10
    const limitedGaps = filteredGaps.slice(0, query.limit || DEFAULT_LIMIT)

    await persistNewGapsToDb(userId, limitedGaps)
    await setCachedGaps(userId, limitedGaps)

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - lookbackDays)

    sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      `Found ${filteredGaps.length} gaps in your calendar`,
      {
        gaps: limitedGaps,
        totalCount: filteredGaps.length,
        analyzedRange: {
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
        },
        settings,
      }
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze gaps"
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage)
  }
})

async function persistNewGapsToDb(
  userId: string,
  gaps: GapCandidateDTO[]
): Promise<void> {
  for (const gap of gaps) {
    const existingGap = await getGapById(userId, gap.id)
    if (!existingGap) {
      await saveGapCandidate({
        id: gap.id,
        user_id: userId,
        start_time: gap.start,
        end_time: gap.end,
        duration_ms: gap.durationMinutes * MS_PER_MINUTE,
        preceding_event_id: gap.precedingEventSummary,
        preceding_event_summary: gap.precedingEventSummary,
        following_event_id: gap.followingEventSummary,
        following_event_summary: gap.followingEventSummary,
        inferred_context: gap.suggestion
          ? { suggestion: gap.suggestion, confidence: gap.confidence }
          : null,
        confidence_score: gap.confidence,
        resolution_status: "pending",
      })
    }
  }
}

const getGapsFormatted = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUser(req, res)
    if (!userResult.success) return
    const { userId, userEmail: email } = userResult

    const query = (req.validatedQuery || req.query) as GapAnalysisQuery
    const settings = await getGapSettingsFromDb(userId)

    try {
      const lookbackDays = query.lookbackDays || settings.lookbackDays

      const gaps = await analyzeGapsForUser({
        email,
        lookbackDays,
        calendarId: query.calendarId,
        settings,
      })

      const resolvedFingerprints = await getResolvedGapFingerprints(userId)
      const filteredGaps = gaps.filter((gap) => {
        const fingerprint = createGapFingerprint(
          userId,
          gap.start,
          gap.precedingEventSummary,
          gap.followingEventSummary
        )
        return !resolvedFingerprints.has(fingerprint)
      })

      const DEFAULT_LIMIT = 10
      const limitedGaps = filteredGaps.slice(0, query.limit || DEFAULT_LIMIT)
      await setCachedGaps(userId, limitedGaps)

      const formatted = formatGapsForDisplay(limitedGaps)

      sendR(res, STATUS_RESPONSE.SUCCESS, "Gaps formatted successfully", {
        formatted,
        count: limitedGaps.length,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to format gaps"
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage)
    }
  }
)

const fillGapHandler = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUser(req, res)
    if (!userResult.success) return
    const { userId, userEmail: email } = userResult
    const { gapId } = req.params

    if (!gapId) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Gap ID is required")
    }

    const gap = await getGapFromCache(userId, gapId)
    if (!gap) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "Gap not found or has expired. Please refresh gaps."
      )
    }

    const body = req.body as FillGapBody

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
      })

      if (result.success && result.eventId) {
        await markGapAsFilledInDb(userId, gapId, result.eventId)
        await removeGapFromCache(userId, gapId)

        sendR(res, STATUS_RESPONSE.CREATED, "Event created successfully", {
          eventId: result.eventId,
          message: `Created "${body.summary}" from ${gap.start} to ${gap.end}`,
        })
      } else {
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to create event"
        )
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fill gap"
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, errorMessage)
    }
  }
)

const skipGap = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userResult = requireUserId(req, res)
  if (!userResult.success) return
  const { userId } = userResult
  const { gapId } = req.params

  if (!gapId) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Gap ID is required")
  }

  const body = req.body as SkipGapBody

  const dbUpdated = await skipGapInDb(userId, gapId, body.reason)
  await removeGapFromCache(userId, gapId)

  if (!dbUpdated) {
    return sendR(
      res,
      STATUS_RESPONSE.NOT_FOUND,
      "Gap not found or already skipped"
    )
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, "Gap skipped", {
    gapId,
    reason: body.reason || "User skipped",
  })
})

const dismissAllGaps = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUserId(req, res)
    if (!userResult.success) return
    const { userId } = userResult

    const count = await dismissAllGapsInDb(userId)
    await invalidateGapsCache(userId)

    sendR(res, STATUS_RESPONSE.SUCCESS, "All gaps dismissed", {
      count,
      message: `Dismissed ${count} gap(s)`,
    })
  }
)

const getSettingsHandler = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUserId(req, res)
    if (!userResult.success) return
    const { userId } = userResult

    const settings = await getGapSettingsFromDb(userId)

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Settings retrieved", {
      settings,
    })
  }
)

const updateSettingsHandler = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUserId(req, res)
    if (!userResult.success) return
    const { userId } = userResult

    const body = req.body as UpdateGapSettingsBody
    const currentSettings = await getGapSettingsFromDb(userId)

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
      ...(body.eventLanguages !== undefined && {
        eventLanguages: body.eventLanguages,
      }),
      ...(body.languageSetupComplete !== undefined && {
        languageSetupComplete: body.languageSetupComplete,
      }),
    }

    if (newSettings.minGapThreshold >= newSettings.maxGapThreshold) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Minimum gap threshold must be less than maximum gap threshold"
      )
    }

    await saveGapSettingsToDb(userId, newSettings)
    await invalidateGapsCache(userId)

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Settings updated", {
      settings: newSettings,
    })
  }
)

const disableGapAnalysis = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUserId(req, res)
    if (!userResult.success) return
    const { userId } = userResult

    const currentSettings = await getGapSettingsFromDb(userId)
    const newSettings: GapRecoverySettings = {
      ...currentSettings,
      autoGapAnalysis: false,
    }

    await saveGapSettingsToDb(userId, newSettings)
    await invalidateGapsCache(userId)

    sendR(res, STATUS_RESPONSE.SUCCESS, "Gap analysis disabled", {
      message:
        "Gap analysis has been disabled. You can re-enable it in settings.",
    })
  }
)

export default {
  getGaps,
  getGapsFormatted,
  fillGap: fillGapHandler,
  skipGap,
  dismissAllGaps,
  getSettings: getSettingsHandler,
  updateSettings: updateSettingsHandler,
  disableGapAnalysis,
}
