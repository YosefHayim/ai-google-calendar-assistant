import { logger } from "@/lib/logger"

type RateLimitEntry = {
  count: number
  resetAt: number
}

const MESSAGE_LIMIT = 30
const MESSAGE_WINDOW_MS = 60 * 1000

const AUTH_LIMIT = 5
const AUTH_WINDOW_MS = 60 * 1000

const UNAUTH_LIMIT = 20
const UNAUTH_WINDOW_MS = 60 * 60 * 1000

const rateLimits = new Map<string, RateLimitEntry>()

type RateLimitType = "message" | "auth" | "unauthenticated"

const getRateLimitKey = (userId: string, type: RateLimitType): string =>
  `${type}:${userId}`

const getLimitConfig = (
  type: RateLimitType
): { limit: number; window: number } => {
  switch (type) {
    case "auth":
      return { limit: AUTH_LIMIT, window: AUTH_WINDOW_MS }
    case "unauthenticated":
      return { limit: UNAUTH_LIMIT, window: UNAUTH_WINDOW_MS }
    default:
      return { limit: MESSAGE_LIMIT, window: MESSAGE_WINDOW_MS }
  }
}

export const checkRateLimit = (
  userId: string,
  type: RateLimitType = "message"
): { allowed: boolean; resetIn?: number } => {
  const key = getRateLimitKey(userId, type)
  const now = Date.now()
  const { limit, window } = getLimitConfig(type)

  let entry = rateLimits.get(key)

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + window }
    rateLimits.set(key, entry)
  }

  entry.count++

  if (entry.count > limit) {
    const resetIn = Math.ceil((entry.resetAt - now) / 1000)
    logger.warn(`Slack Bot: Rate limit exceeded for ${userId} (${type})`)
    return { allowed: false, resetIn }
  }

  return { allowed: true }
}

export const resetRateLimit = (
  userId: string,
  type: RateLimitType = "message"
): void => {
  const key = getRateLimitKey(userId, type)
  rateLimits.delete(key)
}

export const checkUnauthenticatedRateLimit = (
  userId: string
): { allowed: boolean; remaining: number; message?: string } => {
  const result = checkRateLimit(userId, "unauthenticated")

  if (!result.allowed) {
    const resetInMinutes = Math.ceil((result.resetIn || 60) / 60)
    return {
      allowed: false,
      remaining: 0,
      message: `You've reached the message limit for guests (20 per hour). Sign up to continue chatting with Ally! Try again in ${resetInMinutes} minute(s).`,
    }
  }

  return { allowed: true, remaining: UNAUTH_LIMIT }
}

setInterval(
  () => {
    const now = Date.now()
    for (const [key, entry] of rateLimits.entries()) {
      if (now > entry.resetAt) {
        rateLimits.delete(key)
      }
    }
  },
  5 * 60 * 1000
)
