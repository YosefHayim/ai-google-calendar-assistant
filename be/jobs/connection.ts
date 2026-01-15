import { ConnectionOptions } from "bullmq"
import { logger } from "@/utils/logger"

/**
 * BullMQ Redis Connection Configuration
 *
 * IMPORTANT: BullMQ requires maxRetriesPerRequest: null for workers.
 * This is separate from the main Redis client used for caching.
 */

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

// Parse Redis URL for connection options
function parseRedisUrl(url: string): ConnectionOptions {
  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 6379,
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      // BullMQ requirement: must be null for blocking operations in workers
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      // Connection resilience
      retryStrategy: (times: number) => {
        if (times > 10) {
          logger.error("BullMQ: Max Redis reconnection attempts reached")
          return null
        }
        const delay = Math.min(times * 100, 3000)
        logger.info(`BullMQ: Reconnecting to Redis in ${delay}ms...`)
        return delay
      },
    }
  } catch {
    // Fallback for simple redis://host:port format
    return {
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    }
  }
}

export const bullmqConnection: ConnectionOptions = parseRedisUrl(REDIS_URL)

// Log connection info (without password)
logger.info(
  `BullMQ: Configured for Redis at ${bullmqConnection.host}:${bullmqConnection.port}`
)
