/**
 * WhatsApp Rate Limiter Service
 * Redis-based rate limiting for WhatsApp message processing
 */

import { isRedisConnected, redisClient } from "@/config";
import { logger } from "@/utils/logger";

const RATE_LIMITS = {
  auth: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: "wa:rate:auth:",
  },
  messages: {
    maxAttempts: 30,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: "wa:rate:msg:",
  },
  voice: {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute (voice is more expensive)
    keyPrefix: "wa:rate:voice:",
  },
} as const;

type RateLimitType = keyof typeof RATE_LIMITS;

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
};

/**
 * Check rate limit for a specific type and phone number
 * Uses Redis INCR with TTL for atomic rate limiting
 */
export const checkRateLimit = async (
  phoneNumber: string,
  type: RateLimitType
): Promise<RateLimitResult> => {
  const config = RATE_LIMITS[type];
  const key = `${config.keyPrefix}${phoneNumber}`;

  if (!isRedisConnected()) {
    logger.warn(
      `WhatsApp Rate Limiter: Redis unavailable, allowing request for ${phoneNumber}`
    );
    return { allowed: true, remaining: config.maxAttempts, resetInMs: 0 };
  }

  try {
    const multi = redisClient.multi();
    multi.incr(key);
    multi.pttl(key);

    const results = await multi.exec();
    if (!results) {
      return { allowed: true, remaining: config.maxAttempts, resetInMs: 0 };
    }

    const count = (results[0]?.[1] as number) || 1;
    let ttl = (results[1]?.[1] as number) || -1;

    if (ttl === -1 || ttl === -2) {
      await redisClient.pexpire(key, config.windowMs);
      ttl = config.windowMs;
    }

    const allowed = count <= config.maxAttempts;
    const remaining = Math.max(0, config.maxAttempts - count);

    return { allowed, remaining, resetInMs: Math.max(0, ttl) };
  } catch (error) {
    logger.error(`WhatsApp Rate Limiter: Redis error: ${error}`);
    return { allowed: true, remaining: config.maxAttempts, resetInMs: 0 };
  }
};

/**
 * Reset rate limit for a phone number (e.g., after successful auth)
 */
export const resetRateLimit = async (
  phoneNumber: string,
  type: RateLimitType
): Promise<void> => {
  const key = `${RATE_LIMITS[type].keyPrefix}${phoneNumber}`;
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error(
      `WhatsApp Rate Limiter: Failed to reset limit for ${phoneNumber}: ${error}`
    );
  }
};

/**
 * Check auth rate limit and return formatted response if exceeded
 */
export const checkAuthRateLimit = async (
  phoneNumber: string
): Promise<{ allowed: boolean; message?: string }> => {
  const { allowed, resetInMs } = await checkRateLimit(phoneNumber, "auth");

  if (!allowed) {
    const resetInMinutes = Math.ceil(resetInMs / 60_000);
    logger.warn(
      `WhatsApp Rate Limit: Auth limit hit for ${phoneNumber}, resets in ${resetInMinutes}m`
    );

    return {
      allowed: false,
      message: `Too many authentication attempts. Please try again in ${resetInMinutes} minute(s).`,
    };
  }

  return { allowed: true };
};

/**
 * Check message rate limit and return formatted response if exceeded
 */
export const checkMessageRateLimit = async (
  phoneNumber: string
): Promise<{ allowed: boolean; message?: string }> => {
  const { allowed, resetInMs } = await checkRateLimit(phoneNumber, "messages");

  if (!allowed) {
    const resetInSeconds = Math.ceil(resetInMs / 1000);
    logger.warn(
      `WhatsApp Rate Limit: Message limit hit for ${phoneNumber}, resets in ${resetInSeconds}s`
    );

    return {
      allowed: false,
      message: `You're sending messages too quickly. Please wait ${resetInSeconds} seconds.`,
    };
  }

  return { allowed: true };
};

/**
 * Check voice message rate limit (stricter limit for expensive operations)
 */
export const checkVoiceRateLimit = async (
  phoneNumber: string
): Promise<{ allowed: boolean; message?: string }> => {
  const { allowed, resetInMs } = await checkRateLimit(phoneNumber, "voice");

  if (!allowed) {
    const resetInSeconds = Math.ceil(resetInMs / 1000);
    logger.warn(
      `WhatsApp Rate Limit: Voice limit hit for ${phoneNumber}, resets in ${resetInSeconds}s`
    );

    return {
      allowed: false,
      message: `Too many voice messages. Please wait ${resetInSeconds} seconds or send a text message instead.`,
    };
  }

  return { allowed: true };
};
