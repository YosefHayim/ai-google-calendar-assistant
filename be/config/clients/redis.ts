import Redis from "ioredis";
import { logger } from "@/utils/logger";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const REQUIRED_EVICTION_POLICY = "noeviction";
const MAX_BACKOFF_MS = 30_000;
const BACKOFF_MULTIPLIER = 100;

export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * BACKOFF_MULTIPLIER, MAX_BACKOFF_MS);
    return delay;
  },
  enableOfflineQueue: true,
});

redisClient.on("error", (err) => {
  logger.error(`Redis: Connection error: ${err.message}`);
});

redisClient.on("connect", () => {
  logger.info("Redis: Connected successfully");
});

redisClient.on("ready", async () => {
  try {
    await redisClient.config("SET", "maxmemory-policy", REQUIRED_EVICTION_POLICY);
    logger.info(`Redis: Eviction policy set to "${REQUIRED_EVICTION_POLICY}"`);
  } catch (err) {
    logger.warn(`Redis: Could not set eviction policy to "${REQUIRED_EVICTION_POLICY}". ` + `This may cause issues with session storage. Error: ${err}`);
  }
});

redisClient.on("reconnecting", () => {
  logger.info("Redis: Reconnecting...");
});

// Check if Redis is connected and ready
export const isRedisConnected = (): boolean => redisClient.status === "ready";

// Graceful shutdown helper
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient.status !== "end") {
    await redisClient.quit();
  }
};
