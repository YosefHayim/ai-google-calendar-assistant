import { logger } from "@/utils/logger"

interface RateLimitEntry {
  count: number
  resetAt: number
}

const MESSAGE_LIMIT = 30
const MESSAGE_WINDOW_MS = 60 * 1000

const AUTH_LIMIT = 5
const AUTH_WINDOW_MS = 60 * 1000

const rateLimits = new Map<string, RateLimitEntry>()

const getRateLimitKey = (userId: string, type: "message" | "auth"): string => {
  return `${type}:${userId}`
}

export const checkRateLimit = (
  userId: string,
  type: "message" | "auth" = "message"
): { allowed: boolean; resetIn?: number } => {
  const key = getRateLimitKey(userId, type)
  const now = Date.now()
  const limit = type === "auth" ? AUTH_LIMIT : MESSAGE_LIMIT
  const window = type === "auth" ? AUTH_WINDOW_MS : MESSAGE_WINDOW_MS

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

export const resetRateLimit = (userId: string, type: "message" | "auth" = "message"): void => {
  const key = getRateLimitKey(userId, type)
  rateLimits.delete(key)
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimits.entries()) {
    if (now > entry.resetAt) {
      rateLimits.delete(key)
    }
  }
}, 5 * 60 * 1000)
