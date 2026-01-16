import { SUPABASE } from "@/config"
import { isRedisConnected, redisClient } from "@/config/clients/redis"
import { logger } from "@/utils/logger"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = SUPABASE as any

const CACHE_TTL_SECONDS = 300
const CACHE_KEY_PREFIX = "ff:"
const CACHE_KEY_ALL = `${CACHE_KEY_PREFIX}all`
const ROLLOUT_MAX = 100
const DEFAULT_ROLLOUT = 100
const HASH_MULTIPLIER = 31

export type FeatureFlag = {
  id: string
  key: string
  name: string
  description: string | null
  enabled: boolean
  rolloutPercentage: number
  allowedTiers: string[]
  allowedUserIds: string[]
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type CreateFeatureFlagInput = {
  key: string
  name: string
  description?: string
  enabled?: boolean
  rolloutPercentage?: number
  allowedTiers?: string[]
  allowedUserIds?: string[]
  metadata?: Record<string, unknown>
}

export type UpdateFeatureFlagInput = Partial<CreateFeatureFlagInput>

export type FeatureFlagCheckContext = {
  userId?: string
  userTier?: string
}

type DbFeatureFlag = {
  id: string
  key: string
  name: string
  description: string | null
  enabled: boolean
  rollout_percentage: number
  allowed_tiers: string[]
  allowed_user_ids: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

function mapDbToFeatureFlag(db: DbFeatureFlag): FeatureFlag {
  return {
    id: db.id,
    key: db.key,
    name: db.name,
    description: db.description,
    enabled: db.enabled,
    rolloutPercentage: db.rollout_percentage,
    allowedTiers: db.allowed_tiers || [],
    allowedUserIds: db.allowed_user_ids || [],
    metadata: db.metadata || {},
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

function hashUserId(userId: string): number {
  let hash = 0
  for (const char of userId) {
    const charCode = char.charCodeAt(0)
    hash = Math.imul(HASH_MULTIPLIER, hash) + charCode
  }
  return Math.abs(hash) % ROLLOUT_MAX
}

async function invalidateCache(): Promise<void> {
  if (!isRedisConnected()) {
    return
  }

  try {
    const keys = await redisClient.keys(`${CACHE_KEY_PREFIX}*`)
    if (keys.length > 0) {
      await redisClient.del(...keys)
    }
  } catch (error) {
    logger.error("[FeatureFlagService] Cache invalidation failed:", error)
  }
}

async function getCachedFlags(): Promise<FeatureFlag[] | null> {
  if (!isRedisConnected()) {
    return null
  }

  try {
    const cached = await redisClient.get(CACHE_KEY_ALL)
    if (cached) {
      return JSON.parse(cached) as FeatureFlag[]
    }
  } catch (error) {
    logger.error("[FeatureFlagService] Cache read failed:", error)
  }
  return null
}

async function setCachedFlags(flags: FeatureFlag[]): Promise<void> {
  if (!isRedisConnected()) {
    return
  }

  try {
    await redisClient.setex(CACHE_KEY_ALL, CACHE_TTL_SECONDS, JSON.stringify(flags))
  } catch (error) {
    logger.error("[FeatureFlagService] Cache write failed:", error)
  }
}

export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  const cached = await getCachedFlags()
  if (cached) {
    return cached
  }

  const { data, error } = await supabase.from("feature_flags")
    .select("*")
    .order("created_at", { ascending: true })

  if (error) {
    logger.error("[FeatureFlagService] Failed to fetch flags:", error)
    return []
  }

  const flags = (data as DbFeatureFlag[]).map(mapDbToFeatureFlag)
  await setCachedFlags(flags)
  return flags
}

export async function getFeatureFlagByKey(key: string): Promise<FeatureFlag | null> {
  const flags = await getAllFeatureFlags()
  return flags.find((f) => f.key === key) || null
}

export async function getFeatureFlagById(id: string): Promise<FeatureFlag | null> {
  const { data, error } = await supabase.from("feature_flags")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return mapDbToFeatureFlag(data as DbFeatureFlag)
}

export async function createFeatureFlag(
  input: CreateFeatureFlagInput
): Promise<FeatureFlag | null> {
  const { data, error } = await supabase.from("feature_flags")
    .insert({
      key: input.key,
      name: input.name,
      description: input.description || null,
      enabled: input.enabled ?? false,
      rollout_percentage: input.rolloutPercentage ?? DEFAULT_ROLLOUT,
      allowed_tiers: input.allowedTiers || [],
      allowed_user_ids: input.allowedUserIds || [],
      metadata: input.metadata || {},
    })
    .select()
    .single()

  if (error) {
    logger.error("[FeatureFlagService] Failed to create flag:", error)
    return null
  }

  await invalidateCache()
  return mapDbToFeatureFlag(data as DbFeatureFlag)
}

export async function updateFeatureFlag(
  id: string,
  input: UpdateFeatureFlagInput
): Promise<FeatureFlag | null> {
  const updateData: Record<string, unknown> = {}

  if (input.key !== undefined) {
    updateData.key = input.key
  }
  if (input.name !== undefined) {
    updateData.name = input.name
  }
  if (input.description !== undefined) {
    updateData.description = input.description
  }
  if (input.enabled !== undefined) {
    updateData.enabled = input.enabled
  }
  if (input.rolloutPercentage !== undefined) {
    updateData.rollout_percentage = input.rolloutPercentage
  }
  if (input.allowedTiers !== undefined) {
    updateData.allowed_tiers = input.allowedTiers
  }
  if (input.allowedUserIds !== undefined) {
    updateData.allowed_user_ids = input.allowedUserIds
  }
  if (input.metadata !== undefined) {
    updateData.metadata = input.metadata
  }

  const { data, error } = await supabase.from("feature_flags")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    logger.error("[FeatureFlagService] Failed to update flag:", error)
    return null
  }

  await invalidateCache()
  return mapDbToFeatureFlag(data as DbFeatureFlag)
}

export async function deleteFeatureFlag(id: string): Promise<boolean> {
  const { error } = await supabase.from("feature_flags").delete().eq("id", id)

  if (error) {
    logger.error("[FeatureFlagService] Failed to delete flag:", error)
    return false
  }

  await invalidateCache()
  return true
}

export async function isFeatureEnabled(
  key: string,
  context?: FeatureFlagCheckContext
): Promise<boolean> {
  const flag = await getFeatureFlagByKey(key)

  if (!flag) {
    return false
  }

  if (!flag.enabled) {
    return false
  }

  if (context?.userId && flag.allowedUserIds.length > 0) {
    if (flag.allowedUserIds.includes(context.userId)) {
      return true
    }
  }

  if (context?.userTier && flag.allowedTiers.length > 0) {
    if (!flag.allowedTiers.includes(context.userTier)) {
      return false
    }
  }

  if (flag.rolloutPercentage < ROLLOUT_MAX && context?.userId) {
    const userHash = hashUserId(context.userId)
    if (userHash >= flag.rolloutPercentage) {
      return false
    }
  }

  return true
}

export async function getEnabledFlagsForUser(
  context: FeatureFlagCheckContext
): Promise<Record<string, boolean>> {
  const flags = await getAllFeatureFlags()
  const result: Record<string, boolean> = {}

  for (const flag of flags) {
    result[flag.key] = await isFeatureEnabled(flag.key, context)
  }

  return result
}

export function toggleFeatureFlag(
  id: string,
  enabled: boolean
): Promise<FeatureFlag | null> {
  return updateFeatureFlag(id, { enabled })
}
