import { isRedisConnected, redisClient } from "@/config"
import { logger } from "@/utils/logger"

import type { AIInsight } from "@/ai-agents/insights-generator"

const CACHE_PREFIX = "insights"
const CACHE_TTL_SECONDS = 5 * 60 // 5 minutes

export interface CachedInsights {
  insights: AIInsight[]
  generatedAt: string
  periodStart: string
  periodEnd: string
}

/**
 * Generate a cache key for insights
 */
function getCacheKey(userId: string, timeMin: string, timeMax: string): string {
  return `${CACHE_PREFIX}:${userId}:${timeMin}:${timeMax}`
}

/**
 * Get cached insights from Redis
 * Returns null if cache miss or Redis unavailable
 */
export async function getCachedInsights(
  userId: string,
  timeMin: string,
  timeMax: string
): Promise<CachedInsights | null> {
  if (!isRedisConnected()) {
    logger.warn("Insights cache: Redis unavailable, skipping cache lookup")
    return null
  }

  try {
    const key = getCacheKey(userId, timeMin, timeMax)
    const cached = await redisClient.get(key)

    if (cached) {
      logger.debug(`Insights cache hit for user ${userId}`)
      return JSON.parse(cached) as CachedInsights
    }

    logger.debug(`Insights cache miss for user ${userId}`)
    return null
  } catch (error) {
    logger.error(`Insights cache: Error reading from Redis: ${error}`)
    return null
  }
}

/**
 * Store insights in Redis cache with TTL
 */
export async function setCachedInsights(
  userId: string,
  timeMin: string,
  timeMax: string,
  data: CachedInsights
): Promise<void> {
  if (!isRedisConnected()) {
    logger.warn("Insights cache: Redis unavailable, skipping cache write")
    return
  }

  try {
    const key = getCacheKey(userId, timeMin, timeMax)
    await redisClient.setex(key, CACHE_TTL_SECONDS, JSON.stringify(data))
    logger.debug(`Insights cached for user ${userId} (TTL: ${CACHE_TTL_SECONDS}s)`)
  } catch (error) {
    logger.error(`Insights cache: Error writing to Redis: ${error}`)
    // Non-fatal - continue without caching
  }
}

/**
 * Invalidate cached insights for a user (optional utility)
 */
export async function invalidateCachedInsights(
  userId: string,
  timeMin: string,
  timeMax: string
): Promise<void> {
  if (!isRedisConnected()) return

  try {
    const key = getCacheKey(userId, timeMin, timeMax)
    await redisClient.del(key)
    logger.debug(`Insights cache invalidated for user ${userId}`)
  } catch (error) {
    logger.error(`Insights cache: Error invalidating cache: ${error}`)
  }
}
