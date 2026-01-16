import { SUPABASE } from "@/config"
import { logger } from "@/utils/logger"

const supabase = SUPABASE

export type FeatureFlagAuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "enabled"
  | "disabled"
  | "rollout_changed"
  | "tiers_changed"
  | "user_override_added"
  | "user_override_removed"
  | "environment_changed"

export type FeatureFlagAuditLog = {
  id: string
  featureFlagId: string | null
  featureFlagKey: string
  action: FeatureFlagAuditAction
  actorId: string
  actorEmail: string | null
  previousValue: Record<string, unknown> | null
  newValue: Record<string, unknown> | null
  metadata: Record<string, unknown>
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

type DbAuditLog = {
  id: string
  feature_flag_id: string | null
  feature_flag_key: string
  action: FeatureFlagAuditAction
  actor_id: string
  actor_email: string | null
  previous_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  metadata: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export type CreateAuditLogInput = {
  featureFlagId?: string | null
  featureFlagKey: string
  action: FeatureFlagAuditAction
  actorId: string
  actorEmail?: string | null
  previousValue?: Record<string, unknown> | null
  newValue?: Record<string, unknown> | null
  metadata?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}

export type AuditLogListParams = {
  featureFlagKey?: string
  action?: FeatureFlagAuditAction
  actorId?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

function mapDbToAuditLog(db: DbAuditLog): FeatureFlagAuditLog {
  return {
    id: db.id,
    featureFlagId: db.feature_flag_id,
    featureFlagKey: db.feature_flag_key,
    action: db.action,
    actorId: db.actor_id,
    actorEmail: db.actor_email,
    previousValue: db.previous_value,
    newValue: db.new_value,
    metadata: db.metadata || {},
    ipAddress: db.ip_address,
    userAgent: db.user_agent,
    createdAt: db.created_at,
  }
}

export async function createAuditLog(
  input: CreateAuditLogInput
): Promise<FeatureFlagAuditLog | null> {
  const { data, error } = await supabase
    .from("feature_flag_audit_logs")
    .insert({
      feature_flag_id: input.featureFlagId || null,
      feature_flag_key: input.featureFlagKey,
      action: input.action,
      actor_id: input.actorId,
      actor_email: input.actorEmail || null,
      previous_value: input.previousValue || null,
      new_value: input.newValue || null,
      metadata: input.metadata || {},
      ip_address: input.ipAddress || null,
      user_agent: input.userAgent || null,
    })
    .select()
    .single()

  if (error) {
    logger.error("[FeatureFlagAuditService] Failed to create audit log:", error)
    return null
  }

  return mapDbToAuditLog(data as DbAuditLog)
}

export async function getAuditLogs(
  params: AuditLogListParams = {}
): Promise<{ logs: FeatureFlagAuditLog[]; total: number }> {
  const {
    featureFlagKey,
    action,
    actorId,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = params

  let query = supabase
    .from("feature_flag_audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (featureFlagKey) {
    query = query.eq("feature_flag_key", featureFlagKey)
  }
  if (action) {
    query = query.eq("action", action)
  }
  if (actorId) {
    query = query.eq("actor_id", actorId)
  }
  if (startDate) {
    query = query.gte("created_at", startDate)
  }
  if (endDate) {
    query = query.lte("created_at", endDate)
  }

  const { data, error, count } = await query

  if (error) {
    logger.error("[FeatureFlagAuditService] Failed to fetch audit logs:", error)
    return { logs: [], total: 0 }
  }

  return {
    logs: (data as DbAuditLog[]).map(mapDbToAuditLog),
    total: count || 0,
  }
}

export async function getAuditLogsForFlag(
  featureFlagKey: string,
  limit = 20
): Promise<FeatureFlagAuditLog[]> {
  const { data, error } = await supabase
    .from("feature_flag_audit_logs")
    .select("*")
    .eq("feature_flag_key", featureFlagKey)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    logger.error(
      "[FeatureFlagAuditService] Failed to fetch audit logs for flag:",
      error
    )
    return []
  }

  return (data as DbAuditLog[]).map(mapDbToAuditLog)
}

export function determineAuditAction(
  previousValue: Record<string, unknown> | null,
  newValue: Record<string, unknown>
): FeatureFlagAuditAction {
  if (!previousValue) {
    return "created"
  }

  if (previousValue.enabled !== newValue.enabled) {
    return newValue.enabled ? "enabled" : "disabled"
  }

  if (previousValue.rollout_percentage !== newValue.rollout_percentage) {
    return "rollout_changed"
  }

  if (
    JSON.stringify(previousValue.allowed_tiers) !==
    JSON.stringify(newValue.allowed_tiers)
  ) {
    return "tiers_changed"
  }

  if (previousValue.environment !== newValue.environment) {
    return "environment_changed"
  }

  const prevUserIds = previousValue.allowed_user_ids as string[] | undefined
  const newUserIds = newValue.allowed_user_ids as string[] | undefined

  if (JSON.stringify(prevUserIds) !== JSON.stringify(newUserIds)) {
    const prevLength = prevUserIds?.length || 0
    const newLength = newUserIds?.length || 0
    return newLength > prevLength
      ? "user_override_added"
      : "user_override_removed"
  }

  return "updated"
}
