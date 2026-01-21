import type { HandlerContext } from "@/shared/types"
import {
  analyzeGapsForUser,
  fillGap as fillGapInternal,
  formatGapsForDisplay,
} from "@/domains/calendar/utils/gap-recovery"
import type {
  AnalyzeGapsParams,
  FillGapParams,
  FormatGapsDisplayParams,
} from "../schemas"

export type { HandlerContext }

export type GapCandidateDTO = {
  id: string
  start: string
  end: string
  durationMinutes: number
  durationFormatted: string
  precedingEventSummary: string
  precedingEventLink: string | null
  followingEventSummary: string
  followingEventLink: string | null
  suggestion: string | null
  confidence: number
}

export type AnalyzeGapsResult = {
  gaps: GapCandidateDTO[]
  count: number
  error?: string
}

export type FillGapResult = {
  success: boolean
  eventId?: string
  error?: string
}

export type FormatGapsResult = {
  formatted: string
  error?: string
}

export async function analyzeGapsHandler(
  params: AnalyzeGapsParams,
  ctx: HandlerContext
): Promise<AnalyzeGapsResult> {
  const { email } = ctx

  try {
    const gaps = await analyzeGapsForUser({
      email,
      lookbackDays: params.lookbackDays || 7,
      calendarId: params.calendarId || "primary",
    })

    return {
      gaps,
      count: gaps.length,
    }
  } catch (error) {
    console.error("Gap analysis failed:", error)
    return {
      gaps: [],
      count: 0,
      error: error instanceof Error ? error.message : "Failed to analyze gaps.",
    }
  }
}

export async function fillGapHandler(
  params: FillGapParams,
  ctx: HandlerContext
): Promise<FillGapResult> {
  const { email } = ctx

  try {
    const result = await fillGapInternal({
      email,
      gapId: "",
      gapStart: new Date(params.gapStart),
      gapEnd: new Date(params.gapEnd),
      calendarId: params.calendarId || "primary",
      eventDetails: {
        summary: params.summary,
        description: params.description || undefined,
        location: params.location || undefined,
        calendarId: params.calendarId,
      },
    })

    return result
  } catch (error) {
    console.error("Fill gap failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fill gap.",
    }
  }
}

export function formatGapsHandler(
  params: FormatGapsDisplayParams
): FormatGapsResult {
  try {
    const gaps = JSON.parse(params.gapsJson) as GapCandidateDTO[]
    const formatted = formatGapsForDisplay(gaps)
    return { formatted }
  } catch (error) {
    console.error("Format gaps failed:", error)
    return {
      formatted: "",
      error: error instanceof Error ? error.message : "Failed to format gaps.",
    }
  }
}
