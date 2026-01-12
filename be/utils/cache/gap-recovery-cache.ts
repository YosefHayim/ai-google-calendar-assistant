import { isRedisConnected, redisClient } from "@/config";
import { logger } from "@/utils/logger";

import type { GapCandidateDTO, GapRecoverySettings } from "@/types";
import { DEFAULT_GAP_RECOVERY_SETTINGS } from "@/utils/calendar/gap-recovery";

const GAPS_CACHE_PREFIX = "gaps";
const SETTINGS_CACHE_PREFIX = "gap_settings";
const MS_PER_SECOND = 1000;
const ONE_HOUR_IN_SECONDS = 60 * 60;
const ONE_DAY_IN_SECONDS = 24 * 60 * 60;
const GAPS_CACHE_TTL_SECONDS = ONE_HOUR_IN_SECONDS;
const GAPS_CACHE_TTL_MS = GAPS_CACHE_TTL_SECONDS * MS_PER_SECOND;
const SETTINGS_CACHE_TTL_SECONDS = ONE_DAY_IN_SECONDS;

export type CachedGaps = {
  gaps: GapCandidateDTO[];
  analyzedAt: string;
};

/**
 * @description Generates a Redis cache key for storing a user's calendar gap data.
 * The key follows the pattern "gaps:{userId}" to namespace gap data per user.
 * @param {string} userId - The unique identifier of the user
 * @returns {string} The formatted Redis cache key for the user's gaps
 * @example
 * const key = getGapsCacheKey("user_123");
 * // Returns: "gaps:user_123"
 */
function getGapsCacheKey(userId: string): string {
  return `${GAPS_CACHE_PREFIX}:${userId}`;
}

/**
 * @description Generates a Redis cache key for storing a user's gap recovery settings.
 * The key follows the pattern "gap_settings:{userId}" to namespace settings per user.
 * @param {string} userId - The unique identifier of the user
 * @returns {string} The formatted Redis cache key for the user's gap recovery settings
 * @example
 * const key = getSettingsCacheKey("user_123");
 * // Returns: "gap_settings:user_123"
 */
function getSettingsCacheKey(userId: string): string {
  return `${SETTINGS_CACHE_PREFIX}:${userId}`;
}

/**
 * @description Retrieves cached calendar gaps for a specific user from Redis.
 * Performs automatic cache expiration validation based on the analyzedAt timestamp.
 * If the cache has exceeded the TTL (1 hour), it will be deleted and null returned.
 * @param {string} userId - The unique identifier of the user whose gaps to retrieve
 * @returns {Promise<CachedGaps | null>} The cached gaps data including the gaps array
 * and analyzedAt timestamp, or null if cache miss, expired, or Redis unavailable
 * @example
 * const cachedData = await getCachedGaps("user_123");
 * if (cachedData) {
 *   console.log(`Found ${cachedData.gaps.length} gaps, analyzed at ${cachedData.analyzedAt}`);
 * }
 */
export async function getCachedGaps(
  userId: string
): Promise<CachedGaps | null> {
  if (!isRedisConnected()) {
    logger.warn("Gap cache: Redis unavailable, skipping cache lookup");
    return null;
  }

  try {
    const key = getGapsCacheKey(userId);
    const cached = await redisClient.get(key);

    if (cached) {
      const parsed = JSON.parse(cached) as CachedGaps;
      const cacheAge = Date.now() - new Date(parsed.analyzedAt).getTime();

      if (cacheAge > GAPS_CACHE_TTL_MS) {
        await redisClient.del(key);
        return null;
      }

      logger.debug(`Gap cache hit for user ${userId}`);
      return parsed;
    }

    return null;
  } catch (error) {
    logger.error(`Gap cache: Error reading from Redis: ${error}`);
    return null;
  }
}

/**
 * @description Stores an array of calendar gap candidates in Redis cache for a user.
 * The data is automatically wrapped with an analyzedAt timestamp and stored with
 * a TTL of 1 hour. Silently fails if Redis is unavailable.
 * @param {string} userId - The unique identifier of the user
 * @param {GapCandidateDTO[]} gaps - Array of gap candidate objects to cache
 * @returns {Promise<void>} Resolves when caching is complete (or skipped if Redis unavailable)
 * @example
 * const gaps = [{ id: "gap_1", start: "2024-01-15T09:00:00Z", end: "2024-01-15T10:00:00Z" }];
 * await setCachedGaps("user_123", gaps);
 */
export async function setCachedGaps(
  userId: string,
  gaps: GapCandidateDTO[]
): Promise<void> {
  if (!isRedisConnected()) {
    logger.warn("Gap cache: Redis unavailable, skipping cache write");
    return;
  }

  try {
    const key = getGapsCacheKey(userId);
    const data: CachedGaps = {
      gaps,
      analyzedAt: new Date().toISOString(),
    };
    await redisClient.setex(key, GAPS_CACHE_TTL_SECONDS, JSON.stringify(data));
    logger.debug(
      `Gaps cached for user ${userId} (TTL: ${GAPS_CACHE_TTL_SECONDS}s)`
    );
  } catch (error) {
    logger.error(`Gap cache: Error writing to Redis: ${error}`);
  }
}

/**
 * @description Retrieves a specific gap by ID from the user's cached gaps.
 * This is a convenience method that fetches all cached gaps and filters by ID.
 * @param {string} userId - The unique identifier of the user
 * @param {string} gapId - The unique identifier of the gap to retrieve
 * @returns {Promise<GapCandidateDTO | null>} The matching gap object, or null if
 * not found in cache or cache is unavailable
 * @example
 * const gap = await getGapFromCache("user_123", "gap_456");
 * if (gap) {
 *   console.log(`Gap starts at ${gap.start} and ends at ${gap.end}`);
 * }
 */
export async function getGapFromCache(
  userId: string,
  gapId: string
): Promise<GapCandidateDTO | null> {
  const cached = await getCachedGaps(userId);
  if (!cached) return null;
  return cached.gaps.find((g) => g.id === gapId) || null;
}

/**
 * @description Removes a specific gap from the user's cached gaps array.
 * Fetches the current cache, removes the gap with matching ID, and saves
 * the updated array back to Redis. Useful when a gap has been filled or dismissed.
 * @param {string} userId - The unique identifier of the user
 * @param {string} gapId - The unique identifier of the gap to remove
 * @returns {Promise<boolean>} True if the gap was found and removed, false if
 * the gap wasn't found, cache was empty, or Redis is unavailable
 * @example
 * const removed = await removeGapFromCache("user_123", "gap_456");
 * if (removed) {
 *   console.log("Gap successfully removed from cache");
 * }
 */
export async function removeGapFromCache(
  userId: string,
  gapId: string
): Promise<boolean> {
  if (!isRedisConnected()) return false;

  try {
    const cached = await getCachedGaps(userId);
    if (!cached) return false;

    const index = cached.gaps.findIndex((g) => g.id === gapId);
    if (index === -1) return false;

    cached.gaps.splice(index, 1);
    await setCachedGaps(userId, cached.gaps);
    return true;
  } catch (error) {
    logger.error(`Gap cache: Error removing gap from cache: ${error}`);
    return false;
  }
}

/**
 * @description Completely removes all cached gap data for a user from Redis.
 * Use this when the user's calendar has changed significantly and cached
 * gaps are no longer valid (e.g., after creating new events).
 * @param {string} userId - The unique identifier of the user whose gap cache to invalidate
 * @returns {Promise<void>} Resolves when invalidation is complete (or skipped if Redis unavailable)
 * @example
 * // After user creates a new event that fills a gap
 * await invalidateGapsCache("user_123");
 */
export async function invalidateGapsCache(userId: string): Promise<void> {
  if (!isRedisConnected()) return;

  try {
    const key = getGapsCacheKey(userId);
    await redisClient.del(key);
    logger.debug(`Gap cache invalidated for user ${userId}`);
  } catch (error) {
    logger.error(`Gap cache: Error invalidating cache: ${error}`);
  }
}

/**
 * @description Retrieves a user's gap recovery settings from Redis cache.
 * Returns default settings if Redis is unavailable, cache miss occurs,
 * or an error is encountered. Settings have a TTL of 24 hours.
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<GapRecoverySettings>} The user's gap recovery settings,
 * or default settings if not cached/unavailable
 * @example
 * const settings = await getUserSettings("user_123");
 * console.log(`Min gap duration: ${settings.minGapDuration} minutes`);
 */
export async function getUserSettings(
  userId: string
): Promise<GapRecoverySettings> {
  if (!isRedisConnected()) {
    return { ...DEFAULT_GAP_RECOVERY_SETTINGS };
  }

  try {
    const key = getSettingsCacheKey(userId);
    const cached = await redisClient.get(key);

    if (cached) {
      return JSON.parse(cached) as GapRecoverySettings;
    }

    return { ...DEFAULT_GAP_RECOVERY_SETTINGS };
  } catch (error) {
    logger.error(`Gap settings cache: Error reading from Redis: ${error}`);
    return { ...DEFAULT_GAP_RECOVERY_SETTINGS };
  }
}

/**
 * @description Saves a user's gap recovery settings to Redis cache with a 24-hour TTL.
 * Silently fails if Redis is unavailable, logging a warning.
 * @param {string} userId - The unique identifier of the user
 * @param {GapRecoverySettings} settings - The gap recovery settings object to cache,
 * containing preferences like minimum gap duration and working hours
 * @returns {Promise<void>} Resolves when settings are saved (or skipped if Redis unavailable)
 * @example
 * const settings = { minGapDuration: 30, workingHoursStart: 9, workingHoursEnd: 17 };
 * await saveUserSettings("user_123", settings);
 */
export async function saveUserSettings(
  userId: string,
  settings: GapRecoverySettings
): Promise<void> {
  if (!isRedisConnected()) {
    logger.warn("Gap settings cache: Redis unavailable, skipping cache write");
    return;
  }

  try {
    const key = getSettingsCacheKey(userId);
    await redisClient.setex(
      key,
      SETTINGS_CACHE_TTL_SECONDS,
      JSON.stringify(settings)
    );
    logger.debug(`Gap settings cached for user ${userId}`);
  } catch (error) {
    logger.error(`Gap settings cache: Error writing to Redis: ${error}`);
  }
}

/**
 * @description Removes a user's gap recovery settings from Redis cache.
 * Use this when settings need to be reset to defaults or when the user
 * explicitly clears their preferences.
 * @param {string} userId - The unique identifier of the user whose settings to invalidate
 * @returns {Promise<void>} Resolves when invalidation is complete (or skipped if Redis unavailable)
 * @example
 * // Reset user to default settings
 * await invalidateUserSettings("user_123");
 */
export async function invalidateUserSettings(userId: string): Promise<void> {
  if (!isRedisConnected()) return;

  try {
    const key = getSettingsCacheKey(userId);
    await redisClient.del(key);
    logger.debug(`Gap settings cache invalidated for user ${userId}`);
  } catch (error) {
    logger.error(`Gap settings cache: Error invalidating cache: ${error}`);
  }
}
