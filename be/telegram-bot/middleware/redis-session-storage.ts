import type { StorageAdapter } from "grammy"
import { isRedisConnected, redisClient } from "@/config"
import { logger } from "@/lib/logger"

const SESSION_PREFIX = "tg:session:"
const HOURS_IN_DAY = 24
const MINUTES_IN_HOUR = 60
const SECONDS_IN_MINUTE = 60
const SESSION_TTL_SECONDS = HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE

export function createRedisSessionStorage<T>(): StorageAdapter<T> {
  return {
    read: async (key: string): Promise<T | undefined> => {
      if (!isRedisConnected()) {
        logger.warn(
          `Redis session: Not connected, session ${key} will use fallback`
        )
        return
      }

      try {
        const data = await redisClient.get(`${SESSION_PREFIX}${key}`)
        if (!data) {
          return
        }
        return JSON.parse(data) as T
      } catch (error) {
        logger.error(`Redis session: Read error for key ${key}: ${error}`)
        return
      }
    },

    write: async (key: string, value: T): Promise<void> => {
      if (!isRedisConnected()) {
        logger.warn(
          `Redis session: Not connected, session ${key} will not persist`
        )
        return
      }

      try {
        await redisClient.setex(
          `${SESSION_PREFIX}${key}`,
          SESSION_TTL_SECONDS,
          JSON.stringify(value)
        )
      } catch (error) {
        logger.error(`Redis session: Write error for key ${key}: ${error}`)
      }
    },

    delete: async (key: string): Promise<void> => {
      if (!isRedisConnected()) {
        return
      }

      try {
        await redisClient.del(`${SESSION_PREFIX}${key}`)
      } catch (error) {
        logger.error(`Redis session: Delete error for key ${key}: ${error}`)
      }
    },
  }
}
