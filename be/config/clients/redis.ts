import Redis from "ioredis";
import { logger } from "@/utils/logger";

// Redis connection URL from environment (defaults to localhost)
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Create Redis client with connection options
export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    // Exponential backoff with max 30 seconds
    const delay = Math.min(times * 100, 30_000);
    return delay;
  },
  enableOfflineQueue: true,
});

// Connection event handlers
redisClient.on("error", (err) => {
  logger.error(`Redis: Connection error: ${err.message}`);
});

redisClient.on("connect", () => {
  logger.info("Redis: Connected successfully");
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
