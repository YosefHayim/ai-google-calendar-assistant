import type { AIInsight } from "@/ai-agents/insights-generator";
import { isRedisConnected, redisClient } from "@/config";
import { logger } from "@/lib/logger";

const CACHE_PREFIX = "insights";
const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

export type CachedInsights = {
  insights: AIInsight[];
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
};

/**
 * @description Generates a unique Redis cache key for storing AI-generated insights.
 * The key incorporates the user ID and time range to ensure insights are cached
 * per user and per specific time period queried.
 * @param {string} userId - The unique identifier of the user
 * @param {string} timeMin - The start of the time range in ISO 8601 format (e.g., "2024-01-01T00:00:00Z")
 * @param {string} timeMax - The end of the time range in ISO 8601 format (e.g., "2024-01-31T23:59:59Z")
 * @returns {string} The formatted Redis cache key in pattern "insights:{userId}:{timeMin}:{timeMax}"
 * @example
 * const key = getCacheKey("user_123", "2024-01-01T00:00:00Z", "2024-01-07T23:59:59Z");
 * // Returns: "insights:user_123:2024-01-01T00:00:00Z:2024-01-07T23:59:59Z"
 */
function getCacheKey(userId: string, timeMin: string, timeMax: string): string {
  return `${CACHE_PREFIX}:${userId}:${timeMin}:${timeMax}`;
}

/**
 * @description Retrieves cached AI-generated calendar insights for a specific user and time range.
 * Looks up insights in Redis using a composite key of userId, timeMin, and timeMax.
 * This allows caching different insights for different time periods viewed by the user.
 * @param {string} userId - The unique identifier of the user whose insights to retrieve
 * @param {string} timeMin - The start of the time range in ISO 8601 format
 * @param {string} timeMax - The end of the time range in ISO 8601 format
 * @returns {Promise<CachedInsights | null>} The cached insights object containing the insights array,
 * generation timestamp, and period bounds; or null if cache miss, Redis unavailable, or error occurs
 * @example
 * const cached = await getCachedInsights("user_123", "2024-01-01T00:00:00Z", "2024-01-07T23:59:59Z");
 * if (cached) {
 *   console.log(`Found ${cached.insights.length} insights generated at ${cached.generatedAt}`);
 * }
 */
export async function getCachedInsights(
  userId: string,
  timeMin: string,
  timeMax: string
): Promise<CachedInsights | null> {
  if (!isRedisConnected()) {
    logger.warn("Insights cache: Redis unavailable, skipping cache lookup");
    return null;
  }

  try {
    const key = getCacheKey(userId, timeMin, timeMax);
    const cached = await redisClient.get(key);

    if (cached) {
      logger.debug(`Insights cache hit for user ${userId}`);
      return JSON.parse(cached) as CachedInsights;
    }

    logger.debug(`Insights cache miss for user ${userId}`);
    return null;
  } catch (error) {
    logger.error(`Insights cache: Error reading from Redis: ${error}`);
    return null;
  }
}

/**
 * @description Stores AI-generated calendar insights in Redis cache with a 5-minute TTL.
 * The short TTL ensures insights stay relatively fresh while reducing redundant AI API calls
 * when users repeatedly view the same time period. Silently fails if Redis is unavailable.
 * @param {string} userId - The unique identifier of the user
 * @param {string} timeMin - The start of the time range in ISO 8601 format
 * @param {string} timeMax - The end of the time range in ISO 8601 format
 * @param {CachedInsights} data - The insights data object containing:
 *   - insights: Array of AIInsight objects with analysis and recommendations
 *   - generatedAt: ISO timestamp of when insights were generated
 *   - periodStart: Start of the analyzed period
 *   - periodEnd: End of the analyzed period
 * @returns {Promise<void>} Resolves when caching is complete (or skipped if Redis unavailable)
 * @example
 * const data = {
 *   insights: [{ type: "productivity", message: "You have 5 meetings on Monday" }],
 *   generatedAt: new Date().toISOString(),
 *   periodStart: "2024-01-01T00:00:00Z",
 *   periodEnd: "2024-01-07T23:59:59Z"
 * };
 * await setCachedInsights("user_123", "2024-01-01T00:00:00Z", "2024-01-07T23:59:59Z", data);
 */
export async function setCachedInsights(
  userId: string,
  timeMin: string,
  timeMax: string,
  data: CachedInsights
): Promise<void> {
  if (!isRedisConnected()) {
    logger.warn("Insights cache: Redis unavailable, skipping cache write");
    return;
  }

  try {
    const key = getCacheKey(userId, timeMin, timeMax);
    await redisClient.setex(key, CACHE_TTL_SECONDS, JSON.stringify(data));
    logger.debug(
      `Insights cached for user ${userId} (TTL: ${CACHE_TTL_SECONDS}s)`
    );
  } catch (error) {
    logger.error(`Insights cache: Error writing to Redis: ${error}`);
    // Non-fatal - continue without caching
  }
}

/**
 * @description Removes cached insights for a specific user and time range from Redis.
 * Use this when calendar data has changed and cached insights are no longer valid
 * (e.g., after creating, updating, or deleting events within the cached period).
 * @param {string} userId - The unique identifier of the user whose insights to invalidate
 * @param {string} timeMin - The start of the time range in ISO 8601 format
 * @param {string} timeMax - The end of the time range in ISO 8601 format
 * @returns {Promise<void>} Resolves when invalidation is complete (or skipped if Redis unavailable)
 * @example
 * // After user modifies their calendar for a specific week
 * await invalidateCachedInsights("user_123", "2024-01-01T00:00:00Z", "2024-01-07T23:59:59Z");
 */
export async function invalidateCachedInsights(
  userId: string,
  timeMin: string,
  timeMax: string
): Promise<void> {
  if (!isRedisConnected()) {
    return;
  }

  try {
    const key = getCacheKey(userId, timeMin, timeMax);
    await redisClient.del(key);
    logger.debug(`Insights cache invalidated for user ${userId}`);
  } catch (error) {
    logger.error(`Insights cache: Error invalidating cache: ${error}`);
  }
}
