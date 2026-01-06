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

function getGapsCacheKey(userId: string): string {
  return `${GAPS_CACHE_PREFIX}:${userId}`;
}

function getSettingsCacheKey(userId: string): string {
  return `${SETTINGS_CACHE_PREFIX}:${userId}`;
}

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

export async function getGapFromCache(
  userId: string,
  gapId: string
): Promise<GapCandidateDTO | null> {
  const cached = await getCachedGaps(userId);
  if (!cached) return null;
  return cached.gaps.find((g) => g.id === gapId) || null;
}

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
