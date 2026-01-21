import { isRedisConnected, redisClient } from "@/config";
import { logger } from "@/lib/logger";

// Cache prefixes
const USER_PROFILE_PREFIX = "user:profile";
const USER_CONVERSATIONS_PREFIX = "user:conversations";

// TTLs
const USER_PROFILE_TTL_SECONDS = 10 * 60; // 10 minutes - profile data changes infrequently
const CONVERSATIONS_TTL_SECONDS = 60; // 1 minute - sidebar can tolerate slight staleness

// Types
export type CachedUserProfile = {
  id: string;
  email: string;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  created_at?: string;
  updated_at?: string;
  cachedAt: string;
};

export type ConversationListItem = {
  id: string;
  title: string;
  messageCount: number;
  lastUpdated: string;
  createdAt: string;
  pinned: boolean;
  source?: string;
};

export type CachedConversations = {
  conversations: ConversationListItem[];
  cachedAt: string;
  pagination: {
    limit: number;
    offset: number;
    search?: string;
  };
};

// Key generators
function getUserProfileKey(userId: string): string {
  return `${USER_PROFILE_PREFIX}:${userId}`;
}

function getConversationsKey(
  userId: string,
  limit: number,
  offset: number,
  search?: string
): string {
  const searchPart = search ? `:search:${search}` : "";
  return `${USER_CONVERSATIONS_PREFIX}:${userId}:${limit}:${offset}${searchPart}`;
}

// ============================================================================
// User Profile Cache
// ============================================================================

/**
 * @description Retrieves cached user profile data from Redis.
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<CachedUserProfile | null>} Cached profile or null if miss
 */
export async function getCachedUserProfile(
  userId: string
): Promise<CachedUserProfile | null> {
  if (!isRedisConnected()) {
    return null;
  }

  try {
    const key = getUserProfileKey(userId);
    const cached = await redisClient.get(key);

    if (cached) {
      logger.debug(`User profile cache hit for ${userId}`);
      return JSON.parse(cached) as CachedUserProfile;
    }

    logger.debug(`User profile cache miss for ${userId}`);
    return null;
  } catch (error) {
    logger.error(`User profile cache: Error reading from Redis: ${error}`);
    return null;
  }
}

/**
 * @description Stores user profile data in Redis cache with 10-minute TTL.
 * @param {string} userId - The unique identifier of the user
 * @param {Omit<CachedUserProfile, "cachedAt">} profile - The profile data to cache
 * @returns {Promise<void>}
 */
export async function setCachedUserProfile(
  userId: string,
  profile: Omit<CachedUserProfile, "cachedAt">
): Promise<void> {
  if (!isRedisConnected()) {
    return;
  }

  try {
    const key = getUserProfileKey(userId);
    const data: CachedUserProfile = {
      ...profile,
      cachedAt: new Date().toISOString(),
    };
    await redisClient.setex(
      key,
      USER_PROFILE_TTL_SECONDS,
      JSON.stringify(data)
    );
    logger.debug(
      `User profile cached for ${userId} (TTL: ${USER_PROFILE_TTL_SECONDS}s)`
    );
  } catch (error) {
    logger.error(`User profile cache: Error writing to Redis: ${error}`);
  }
}

/**
 * @description Invalidates cached user profile. Call after profile updates.
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<void>}
 */
export async function invalidateUserProfileCache(
  userId: string
): Promise<void> {
  if (!isRedisConnected()) {
    return;
  }

  try {
    const key = getUserProfileKey(userId);
    await redisClient.del(key);
    logger.debug(`User profile cache invalidated for ${userId}`);
  } catch (error) {
    logger.error(`User profile cache: Error invalidating: ${error}`);
  }
}

// ============================================================================
// Conversations List Cache
// ============================================================================

/**
 * @description Retrieves cached conversations list from Redis.
 * @param {string} userId - The unique identifier of the user
 * @param {number} limit - Pagination limit
 * @param {number} offset - Pagination offset
 * @param {string} [search] - Optional search query
 * @returns {Promise<CachedConversations | null>} Cached conversations or null if miss
 */
export async function getCachedConversations(
  userId: string,
  limit: number,
  offset: number,
  search?: string
): Promise<CachedConversations | null> {
  if (!isRedisConnected()) {
    return null;
  }

  try {
    const key = getConversationsKey(userId, limit, offset, search);
    const cached = await redisClient.get(key);

    if (cached) {
      logger.debug(`Conversations cache hit for ${userId}`);
      return JSON.parse(cached) as CachedConversations;
    }

    logger.debug(`Conversations cache miss for ${userId}`);
    return null;
  } catch (error) {
    logger.error(`Conversations cache: Error reading from Redis: ${error}`);
    return null;
  }
}

/**
 * @description Stores conversations list in Redis cache with 1-minute TTL.
 * @param {string} userId - The unique identifier of the user
 * @param {ConversationListItem[]} conversations - The conversations to cache
 * @param {number} limit - Pagination limit
 * @param {number} offset - Pagination offset
 * @param {string} [search] - Optional search query
 * @returns {Promise<void>}
 */
export async function setCachedConversations(
  userId: string,
  conversations: ConversationListItem[],
  limit: number,
  offset: number,
  search?: string
): Promise<void> {
  if (!isRedisConnected()) {
    return;
  }

  try {
    const key = getConversationsKey(userId, limit, offset, search);
    const data: CachedConversations = {
      conversations,
      cachedAt: new Date().toISOString(),
      pagination: { limit, offset, search },
    };
    await redisClient.setex(
      key,
      CONVERSATIONS_TTL_SECONDS,
      JSON.stringify(data)
    );
    logger.debug(
      `Conversations cached for ${userId} (TTL: ${CONVERSATIONS_TTL_SECONDS}s)`
    );
  } catch (error) {
    logger.error(`Conversations cache: Error writing to Redis: ${error}`);
  }
}

/**
 * @description Invalidates all cached conversations for a user.
 * Call after creating, deleting, or updating conversations.
 * Uses pattern matching to delete all conversation cache entries for the user.
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<void>}
 */
export async function invalidateConversationsCache(
  userId: string
): Promise<void> {
  if (!isRedisConnected()) {
    return;
  }

  try {
    // Use SCAN to find all matching keys (safer than KEYS in production)
    const pattern = `${USER_CONVERSATIONS_PREFIX}:${userId}:*`;
    let cursor = "0";
    const keysToDelete: string[] = [];

    do {
      const [newCursor, keys] = await redisClient.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      );
      cursor = newCursor;
      keysToDelete.push(...keys);
    } while (cursor !== "0");

    if (keysToDelete.length > 0) {
      await redisClient.del(...keysToDelete);
      logger.debug(
        `Conversations cache invalidated for ${userId} (${keysToDelete.length} keys)`
      );
    }
  } catch (error) {
    logger.error(`Conversations cache: Error invalidating: ${error}`);
  }
}

/**
 * @description Invalidates all user-related caches (profile + conversations).
 * Call when user is deleted or for full cache reset.
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<void>}
 */
export async function invalidateAllUserCache(userId: string): Promise<void> {
  await Promise.all([
    invalidateUserProfileCache(userId),
    invalidateConversationsCache(userId),
  ]);
}
