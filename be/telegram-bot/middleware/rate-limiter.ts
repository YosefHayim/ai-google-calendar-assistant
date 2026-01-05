import { isRedisConnected, redisClient } from "@/config";

import type { GlobalContext } from "../init-bot";
import type { MiddlewareFn } from "grammy";
import { auditLogger } from "@/utils/audit-logger";
import { logger } from "@/utils/logger";

// Rate limit configurations
const RATE_LIMITS = {
  auth: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: "tg:rate:auth:",
  },
  messages: {
    maxAttempts: 30,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: "tg:rate:msg:",
  },
} as const;

type RateLimitType = keyof typeof RATE_LIMITS;

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
};

/**
 * Check rate limit for a specific type and user
 * Uses Redis INCR with TTL for atomic rate limiting
 */
const checkRateLimit = async (userId: number, type: RateLimitType): Promise<RateLimitResult> => {
  const config = RATE_LIMITS[type];
  const key = `${config.keyPrefix}${userId}`;

  // Graceful degradation if Redis is unavailable
  if (!isRedisConnected()) {
    logger.warn(`Rate limiter: Redis unavailable, allowing request for user ${userId}`);
    return { allowed: true, remaining: config.maxAttempts, resetInMs: 0 };
  }

  try {
    // Atomic increment and get TTL
    const multi = redisClient.multi();
    multi.incr(key);
    multi.pttl(key);

    const results = await multi.exec();
    if (!results) {
      return { allowed: true, remaining: config.maxAttempts, resetInMs: 0 };
    }

    const count = (results[0]?.[1] as number) || 1;
    let ttl = (results[1]?.[1] as number) || -1;

    // Set TTL on first request (when key is new)
    if (ttl === -1 || ttl === -2) {
      await redisClient.pexpire(key, config.windowMs);
      ttl = config.windowMs;
    }

    const allowed = count <= config.maxAttempts;
    const remaining = Math.max(0, config.maxAttempts - count);

    return { allowed, remaining, resetInMs: Math.max(0, ttl) };
  } catch (error) {
    logger.error(`Rate limiter: Redis error: ${error}`);
    // Allow on error for graceful degradation
    return { allowed: true, remaining: config.maxAttempts, resetInMs: 0 };
  }
};

/**
 * Reset rate limit for a user (e.g., after successful auth)
 */
export const resetRateLimit = async (userId: number, type: RateLimitType): Promise<void> => {
  const key = `${RATE_LIMITS[type].keyPrefix}${userId}`;
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Rate limiter: Failed to reset limit for user ${userId}: ${error}`);
  }
};

/**
 * Rate limiter middleware for authentication attempts
 * Limits: 5 attempts per 15 minutes per telegram_user_id
 */
export const authRateLimiter: MiddlewareFn<GlobalContext> = async (ctx, next) => {
  const userId = ctx.from?.id;
  if (!userId) return next();

  const { allowed, remaining, resetInMs } = await checkRateLimit(userId, "auth");

  if (!allowed) {
    const resetInMinutes = Math.ceil(resetInMs / 60000);

    auditLogger.rateLimitHit(userId, "auth", resetInMinutes * 60);

    await ctx.reply(`Too many authentication attempts. Please try again in ${resetInMinutes} minute(s).`);
    return; // Stop middleware chain
  }

  return next();
};

/**
 * Rate limiter middleware for message processing
 * Limits: 30 messages per minute per telegram_user_id
 */
export const messageRateLimiter: MiddlewareFn<GlobalContext> = async (ctx, next) => {
  const userId = ctx.from?.id;
  if (!userId) return next();

  const { allowed, remaining, resetInMs } = await checkRateLimit(userId, "messages");

  if (!allowed) {
    const resetInSeconds = Math.ceil(resetInMs / 1000);

    auditLogger.rateLimitHit(userId, "messages", resetInSeconds);

    await ctx.reply(`You're sending messages too quickly. Please wait ${resetInSeconds} seconds.`);
    return; // Stop middleware chain
  }
  return next();
};
