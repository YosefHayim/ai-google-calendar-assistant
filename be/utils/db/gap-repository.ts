import { SUPABASE } from "@/config"
import type { Database } from "@/database.types"
import type { GapCandidateDTO, GapRecoverySettings } from "@/types"
import { logger } from "@/utils/logger"
import { DEFAULT_GAP_RECOVERY_SETTINGS } from "@/utils/calendar/gap-recovery"

type GapResolutionStatus = Database["public"]["Enums"]["gap_resolution_status"]
type GapCandidateRow = Database["public"]["Tables"]["gap_candidates"]["Row"]
type GapCandidateInsert = Database["public"]["Tables"]["gap_candidates"]["Insert"]

const SECONDS_PER_MINUTE = 60
const MS_PER_SECOND = 1000
const MS_PER_MINUTE = SECONDS_PER_MINUTE * MS_PER_SECOND
const MS_PER_HOUR = SECONDS_PER_MINUTE * MS_PER_MINUTE
const TIME_TOLERANCE_MS = 60_000

type GapLookupParams = {
  userId: string
  startTime: Date
  endTime: Date
  precedingEventId: string
  followingEventId: string
}

function rowToDTO(row: GapCandidateRow): GapCandidateDTO {
  const durationMs = row.duration_ms
  const hours = Math.floor(durationMs / MS_PER_HOUR)
  const minutes = Math.floor((durationMs % MS_PER_HOUR) / MS_PER_MINUTE)

  let durationFormatted: string
  if (hours > 0 && minutes > 0) {
    durationFormatted = `${hours}h ${minutes}m`
  } else if (hours > 0) {
    durationFormatted = `${hours}h`
  } else {
    durationFormatted = `${minutes}m`
  }

  const inferredContext = row.inferred_context as {
    suggestion?: string
    confidence?: number
  } | null

  return {
    id: row.id,
    start: row.start_time,
    end: row.end_time,
    durationMinutes: Math.round(durationMs / MS_PER_MINUTE),
    durationFormatted,
    precedingEventSummary: row.preceding_event_summary || "Unknown event",
    precedingEventLink: null,
    followingEventSummary: row.following_event_summary || "Unknown event",
    followingEventLink: null,
    suggestion: inferredContext?.suggestion || null,
    confidence: inferredContext?.confidence || 0,
  }
}

type GapFingerprintParams = {
  userId: string
  startTime: string
  endTime: string
  precedingEventId: string
  followingEventId: string
}

function createGapFingerprint(params: GapFingerprintParams): string {
  const { userId, startTime, endTime, precedingEventId, followingEventId } = params
  return `${userId}:${startTime}:${endTime}:${precedingEventId}:${followingEventId}`
}

export async function findExistingGap({
  userId,
  startTime,
  precedingEventId,
  followingEventId,
}: GapLookupParams): Promise<GapCandidateRow | null> {
  const { data, error } = await SUPABASE.from("gap_candidates")
    .select("*")
    .eq("user_id", userId)
    .eq("preceding_event_id", precedingEventId)
    .eq("following_event_id", followingEventId)
    .gte("start_time", new Date(startTime.getTime() - TIME_TOLERANCE_MS).toISOString())
    .lte("start_time", new Date(startTime.getTime() + TIME_TOLERANCE_MS).toISOString())
    .single()

  if (error && error.code !== "PGRST116") {
    logger.error(`Error finding existing gap: ${error.message}`)
  }

  return data
}

export async function getPendingGaps(userId: string): Promise<GapCandidateDTO[]> {
  const { data, error } = await SUPABASE.from("gap_candidates")
    .select("*")
    .eq("user_id", userId)
    .eq("resolution_status", "pending")
    .order("start_time", { ascending: true })

  if (error) {
    logger.error(`Error fetching pending gaps: ${error.message}`)
    return []
  }

  return (data || []).map(rowToDTO)
}

export async function getResolvedGapFingerprints(userId: string): Promise<Set<string>> {
  const { data, error } = await SUPABASE.from("gap_candidates")
    .select("id, preceding_event_id, following_event_id, start_time, end_time")
    .eq("user_id", userId)
    .in("resolution_status", ["skipped", "dismissed", "filled"])

  if (error) {
    logger.error(`Error fetching resolved gaps: ${error.message}`)
    return new Set()
  }

  const fingerprints = new Set<string>()
  for (const row of data || []) {
    const fingerprint = createGapFingerprint({
      userId,
      startTime: row.start_time,
      endTime: row.end_time,
      precedingEventId: row.preceding_event_id,
      followingEventId: row.following_event_id,
    })
    fingerprints.add(fingerprint)
  }

  return fingerprints
}

export async function isGapResolved({
  userId,
  startTime,
  precedingEventId,
  followingEventId,
}: GapLookupParams): Promise<boolean> {
  const { data, error } = await SUPABASE.from("gap_candidates")
    .select("resolution_status")
    .eq("user_id", userId)
    .eq("preceding_event_id", precedingEventId)
    .eq("following_event_id", followingEventId)
    .gte("start_time", new Date(startTime.getTime() - TIME_TOLERANCE_MS).toISOString())
    .lte("start_time", new Date(startTime.getTime() + TIME_TOLERANCE_MS).toISOString())
    .in("resolution_status", ["skipped", "dismissed", "filled"])
    .maybeSingle()

  if (error) {
    logger.error(`Error checking gap resolution: ${error.message}`)
    return false
  }

  return data !== null
}

export async function saveGapCandidate(
  gap: GapCandidateInsert
): Promise<GapCandidateRow | null> {
  const { data, error } = await SUPABASE.from("gap_candidates")
    .insert(gap)
    .select()
    .single()

  if (error) {
    logger.error(`Error saving gap candidate: ${error.message}`)
    return null
  }

  return data
}

export async function saveGapCandidates(
  gaps: GapCandidateInsert[]
): Promise<number> {
  if (gaps.length === 0) {
    return 0
  }

  const { data, error } = await SUPABASE.from("gap_candidates")
    .insert(gaps)
    .select("id")

  if (error) {
    logger.error(`Error saving gap candidates: ${error.message}`)
    return 0
  }

  return data?.length || 0
}

export async function skipGapInDb(
  userId: string,
  gapId: string,
  reason?: string
): Promise<boolean> {
  const { error } = await SUPABASE.from("gap_candidates")
    .update({
      resolution_status: "skipped" as GapResolutionStatus,
      resolved_at: new Date().toISOString(),
      resolution_data: reason ? { reason } : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gapId)
    .eq("user_id", userId)

  if (error) {
    logger.error(`Error skipping gap: ${error.message}`)
    return false
  }

  return true
}

export async function dismissAllGapsInDb(userId: string): Promise<number> {
  const { data, error } = await SUPABASE.from("gap_candidates")
    .update({
      resolution_status: "dismissed" as GapResolutionStatus,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("resolution_status", "pending")
    .select("id")

  if (error) {
    logger.error(`Error dismissing all gaps: ${error.message}`)
    return 0
  }

  return data?.length || 0
}

export async function markGapAsFilledInDb(
  userId: string,
  gapId: string,
  eventId: string
): Promise<boolean> {
  const { error } = await SUPABASE.from("gap_candidates")
    .update({
      resolution_status: "filled" as GapResolutionStatus,
      resolved_at: new Date().toISOString(),
      resolved_event_id: eventId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gapId)
    .eq("user_id", userId)

  if (error) {
    logger.error(`Error marking gap as filled: ${error.message}`)
    return false
  }

  return true
}

export async function getGapById(
  userId: string,
  gapId: string
): Promise<GapCandidateRow | null> {
  const { data, error } = await SUPABASE.from("gap_candidates")
    .select("*")
    .eq("id", gapId)
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error(`Error fetching gap: ${error.message}`)
    }
    return null
  }

  return data
}

export async function getGapSettingsFromDb(
  userId: string
): Promise<GapRecoverySettings> {
  const { data, error } = await SUPABASE.from("gap_recovery_settings")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code !== "PGRST116") {
      logger.error(`Error fetching gap settings: ${error.message}`)
    }
    return { ...DEFAULT_GAP_RECOVERY_SETTINGS }
  }

  const settings = data.settings as Partial<GapRecoverySettings>
  return {
    ...DEFAULT_GAP_RECOVERY_SETTINGS,
    ...settings,
    autoGapAnalysis: data.is_enabled ?? DEFAULT_GAP_RECOVERY_SETTINGS.autoGapAnalysis,
    minGapThreshold: data.min_gap_minutes ?? DEFAULT_GAP_RECOVERY_SETTINGS.minGapThreshold,
    maxGapThreshold: data.max_gap_minutes ?? DEFAULT_GAP_RECOVERY_SETTINGS.maxGapThreshold,
  }
}

export async function saveGapSettingsToDb(
  userId: string,
  settings: GapRecoverySettings
): Promise<boolean> {
  const { error } = await SUPABASE.from("gap_recovery_settings")
    .upsert(
      {
        user_id: userId,
        is_enabled: settings.autoGapAnalysis,
        min_gap_minutes: settings.minGapThreshold,
        max_gap_minutes: settings.maxGapThreshold,
        settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

  if (error) {
    logger.error(`Error saving gap settings: ${error.message}`)
    return false
  }

  return true
}
