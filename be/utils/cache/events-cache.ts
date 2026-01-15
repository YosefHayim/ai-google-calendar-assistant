import { isRedisConnected, redisClient } from "@/config"
import { logger } from "@/utils/logger"
import type { calendar_v3 } from "googleapis"

const CACHE_PREFIX = "events"
const CACHE_TTL_SECONDS = 5 * 60 // 5 minutes

export interface CachedEvents {
  events: calendar_v3.Schema$Event[]
  calendarId: string
  timeMin?: string
  timeMax?: string
  cachedAt: string
  totalCount: number
}

function getCacheKey(
  userId: string,
  calendarId: string,
  timeMin?: string,
  timeMax?: string
): string {
  const timePart = timeMin && timeMax ? `:${timeMin}:${timeMax}` : ""
  return `${CACHE_PREFIX}:${userId}:${calendarId}${timePart}`
}

export async function getCachedEvents(
  userId: string,
  calendarId: string,
  timeMin?: string,
  timeMax?: string
): Promise<CachedEvents | null> {
  if (!isRedisConnected()) {
    return null
  }

  try {
    const key = getCacheKey(userId, calendarId, timeMin, timeMax)
    const cached = await redisClient.get(key)

    if (cached) {
      logger.debug(`Events cache hit for user ${userId}, calendar ${calendarId}`)
      return JSON.parse(cached) as CachedEvents
    }

    logger.debug(`Events cache miss for user ${userId}, calendar ${calendarId}`)
    return null
  } catch (error) {
    logger.error(`Events cache: Error reading from Redis: ${error}`)
    return null
  }
}

export async function setCachedEvents(
  userId: string,
  calendarId: string,
  events: calendar_v3.Schema$Event[],
  timeMin?: string,
  timeMax?: string
): Promise<void> {
  if (!isRedisConnected()) {
    return
  }

  try {
    const key = getCacheKey(userId, calendarId, timeMin, timeMax)
    const data: CachedEvents = {
      events,
      calendarId,
      timeMin,
      timeMax,
      cachedAt: new Date().toISOString(),
      totalCount: events.length,
    }
    await redisClient.setex(key, CACHE_TTL_SECONDS, JSON.stringify(data))
    logger.debug(
      `Events cached for user ${userId}, calendar ${calendarId} (${events.length} events, TTL: ${CACHE_TTL_SECONDS}s)`
    )
  } catch (error) {
    logger.error(`Events cache: Error writing to Redis: ${error}`)
  }
}

export async function invalidateEventsCache(
  userId: string,
  calendarId?: string
): Promise<void> {
  if (!isRedisConnected()) return

  try {
    const pattern = calendarId
      ? `${CACHE_PREFIX}:${userId}:${calendarId}*`
      : `${CACHE_PREFIX}:${userId}:*`

    let cursor = "0"
    const keysToDelete: string[] = []

    do {
      const [newCursor, keys] = await redisClient.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100
      )
      cursor = newCursor
      keysToDelete.push(...keys)
    } while (cursor !== "0")

    if (keysToDelete.length > 0) {
      await redisClient.del(...keysToDelete)
      logger.debug(
        `Events cache invalidated for user ${userId} (${keysToDelete.length} keys)`
      )
    }
  } catch (error) {
    logger.error(`Events cache: Error invalidating: ${error}`)
  }
}
