import type { ConnectionOptions } from "bullmq"
import { logger } from "@/lib/logger"

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"
const DEFAULT_REDIS_PORT = 6379
const MAX_RECONNECT_ATTEMPTS = 10
const MAX_RECONNECT_DELAY_MS = 3000
const RECONNECT_DELAY_MULTIPLIER = 100

type RedisConnectionInfo = {
  host: string
  port: number
}

function parseRedisUrl(url: string): {
  connection: ConnectionOptions
  info: RedisConnectionInfo
} {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    const port = Number.parseInt(parsed.port, 10) || DEFAULT_REDIS_PORT

    return {
      connection: {
        host,
        port,
        password: parsed.password || undefined,
        username: parsed.username || undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: (times: number) => {
          if (times > MAX_RECONNECT_ATTEMPTS) {
            logger.error("BullMQ: Max Redis reconnection attempts reached")
            return null
          }
          const delay = Math.min(
            times * RECONNECT_DELAY_MULTIPLIER,
            MAX_RECONNECT_DELAY_MS
          )
          logger.info(`BullMQ: Reconnecting to Redis in ${delay}ms...`)
          return delay
        },
      },
      info: { host, port },
    }
  } catch {
    return {
      connection: {
        host: "localhost",
        port: DEFAULT_REDIS_PORT,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
      info: { host: "localhost", port: DEFAULT_REDIS_PORT },
    }
  }
}

const parsed = parseRedisUrl(REDIS_URL)
export const bullmqConnection: ConnectionOptions = parsed.connection

logger.info(
  `BullMQ: Configured for Redis at ${parsed.info.host}:${parsed.info.port}`
)
