import { isRedisConnected, redisClient } from "@/infrastructure/redis/redis"
import { logger } from "@/lib/logger"

const UNAUTH_CONVERSATION_TTL_HOURS = 24
const UNAUTH_CONVERSATION_TTL = 60 * 60 * UNAUTH_CONVERSATION_TTL_HOURS
const ANALYTICS_TTL_DAYS = 7
const ANALYTICS_TTL = UNAUTH_CONVERSATION_TTL * ANALYTICS_TTL_DAYS
const DAILY_STATS_TTL_DAYS = 30
const DAILY_STATS_TTL = 60 * 60 * 24 * DAILY_STATS_TTL_DAYS
const UNIQUE_USERS_TTL_DAYS = 2
const UNIQUE_USERS_TTL = 60 * 60 * 24 * UNIQUE_USERS_TTL_DAYS
const MAX_MESSAGES_STORED = 20
const ANALYTICS_PREFIX = "unauth:analytics"
const CONVERSATION_PREFIX = "unauth:conversation"

export type UnauthPlatform = "whatsapp" | "telegram" | "slack"

export type UnauthMessage = {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export type UnauthConversation = {
  platformId: string
  platform: UnauthPlatform
  messages: UnauthMessage[]
  messageCount: number
  firstMessageAt: string
  lastMessageAt: string
  convertedToUser: boolean
  convertedAt?: string
}

export type UnauthAnalytics = {
  platform: UnauthPlatform
  platformId: string
  totalMessages: number
  userMessages: number
  assistantMessages: number
  firstInteraction: string
  lastInteraction: string
  sessionCount: number
  averageMessagesPerSession: number
  converted: boolean
  convertedAt?: string
}

const getConversationKey = (
  platform: UnauthPlatform,
  platformId: string
): string => `${CONVERSATION_PREFIX}:${platform}:${platformId}`

const getAnalyticsKey = (
  platform: UnauthPlatform,
  platformId: string
): string => `${ANALYTICS_PREFIX}:${platform}:${platformId}`

const getDailyStatsKey = (platform: UnauthPlatform, date: string): string =>
  `${ANALYTICS_PREFIX}:daily:${platform}:${date}`

const updateUnauthAnalytics = async (
  platform: UnauthPlatform,
  platformId: string,
  messageRole: "user" | "assistant"
): Promise<void> => {
  if (!isRedisConnected()) {
    return
  }

  try {
    const analyticsKey = getAnalyticsKey(platform, platformId)
    const now = new Date()
    const dateStr = now.toISOString().split("T")[0]
    const dailyKey = getDailyStatsKey(platform, dateStr)

    const existingData = await redisClient.get(analyticsKey)
    let analytics: UnauthAnalytics

    if (existingData) {
      analytics = JSON.parse(existingData)
      analytics.totalMessages += 1
      if (messageRole === "user") {
        analytics.userMessages += 1
      } else {
        analytics.assistantMessages += 1
      }
      analytics.lastInteraction = now.toISOString()
      analytics.averageMessagesPerSession =
        analytics.totalMessages / analytics.sessionCount
    } else {
      analytics = {
        platform,
        platformId,
        totalMessages: 1,
        userMessages: messageRole === "user" ? 1 : 0,
        assistantMessages: messageRole === "assistant" ? 1 : 0,
        firstInteraction: now.toISOString(),
        lastInteraction: now.toISOString(),
        sessionCount: 1,
        averageMessagesPerSession: 1,
        converted: false,
      }
    }

    await redisClient.setex(analyticsKey, ANALYTICS_TTL, JSON.stringify(analytics))

    await redisClient.hincrby(dailyKey, "totalMessages", 1)
    await redisClient.hincrby(
      dailyKey,
      messageRole === "user" ? "userMessages" : "assistantMessages",
      1
    )
    await redisClient.hincrby(dailyKey, "uniqueUsers", 0)
    await redisClient.expire(dailyKey, DAILY_STATS_TTL)

    const uniqueUsersKey = `${dailyKey}:uniqueUsers`
    const isNew = await redisClient.sadd(uniqueUsersKey, platformId)
    if (isNew) {
      await redisClient.hincrby(dailyKey, "uniqueUsers", 1)
    }
    await redisClient.expire(uniqueUsersKey, UNIQUE_USERS_TTL)
  } catch (error) {
    logger.error(
      `[UnauthConversation] Failed to update analytics: ${error instanceof Error ? error.message : error}`
    )
  }
}

export const storeUnauthMessage = async (
  platform: UnauthPlatform,
  platformId: string,
  message: UnauthMessage
): Promise<boolean> => {
  if (!isRedisConnected()) {
    logger.warn(
      `[UnauthConversation] Redis not connected, skipping message storage for ${platform}:${platformId}`
    )
    return false
  }

  try {
    const conversationKey = getConversationKey(platform, platformId)
    const now = new Date().toISOString()

    const existingData = await redisClient.get(conversationKey)
    let conversation: UnauthConversation

    if (existingData) {
      conversation = JSON.parse(existingData)
      conversation.messages.push(message)
      if (conversation.messages.length > MAX_MESSAGES_STORED) {
        conversation.messages = conversation.messages.slice(-MAX_MESSAGES_STORED)
      }
      conversation.messageCount += 1
      conversation.lastMessageAt = now
    } else {
      conversation = {
        platformId,
        platform,
        messages: [message],
        messageCount: 1,
        firstMessageAt: now,
        lastMessageAt: now,
        convertedToUser: false,
      }
    }

    await redisClient.setex(
      conversationKey,
      UNAUTH_CONVERSATION_TTL,
      JSON.stringify(conversation)
    )

    await updateUnauthAnalytics(platform, platformId, message.role)

    logger.debug(
      `[UnauthConversation] Stored message for ${platform}:${platformId}, ` +
        `total: ${conversation.messageCount}`
    )

    return true
  } catch (error) {
    logger.error(
      `[UnauthConversation] Failed to store message: ${error instanceof Error ? error.message : error}`
    )
    return false
  }
}

export const getUnauthConversation = async (
  platform: UnauthPlatform,
  platformId: string
): Promise<UnauthConversation | null> => {
  if (!isRedisConnected()) {
    return null
  }

  try {
    const conversationKey = getConversationKey(platform, platformId)
    const data = await redisClient.get(conversationKey)

    if (!data) {
      return null
    }

    return JSON.parse(data) as UnauthConversation
  } catch (error) {
    logger.error(
      `[UnauthConversation] Failed to get conversation: ${error instanceof Error ? error.message : error}`
    )
    return null
  }
}

export const getUnauthMessagesForContext = async (
  platform: UnauthPlatform,
  platformId: string
): Promise<UnauthMessage[]> => {
  const conversation = await getUnauthConversation(platform, platformId)
  return conversation?.messages || []
}

export const buildUnauthContextPrompt = (messages: UnauthMessage[]): string => {
  if (messages.length === 0) {
    return ""
  }

  const messageHistory = messages
    .map(
      (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
    )
    .join("\n")

  return `Previous conversation:\n${messageHistory}`
}

export const markUnauthUserConverted = async (
  platform: UnauthPlatform,
  platformId: string
): Promise<void> => {
  if (!isRedisConnected()) {
    return
  }

  try {
    const now = new Date().toISOString()
    const dateStr = now.split("T")[0]

    const conversationKey = getConversationKey(platform, platformId)
    const conversationData = await redisClient.get(conversationKey)
    if (conversationData) {
      const conversation = JSON.parse(conversationData) as UnauthConversation
      conversation.convertedToUser = true
      conversation.convertedAt = now
      await redisClient.setex(
        conversationKey,
        UNAUTH_CONVERSATION_TTL,
        JSON.stringify(conversation)
      )
    }

    const analyticsKey = getAnalyticsKey(platform, platformId)
    const analyticsData = await redisClient.get(analyticsKey)
    if (analyticsData) {
      const analytics = JSON.parse(analyticsData) as UnauthAnalytics
      analytics.converted = true
      analytics.convertedAt = now
      await redisClient.setex(analyticsKey, ANALYTICS_TTL, JSON.stringify(analytics))
    }

    const dailyKey = getDailyStatsKey(platform, dateStr)
    await redisClient.hincrby(dailyKey, "conversions", 1)

    logger.info(
      `[UnauthConversation] User converted: ${platform}:${platformId}`
    )
  } catch (error) {
    logger.error(
      `[UnauthConversation] Failed to mark user as converted: ${error instanceof Error ? error.message : error}`
    )
  }
}

export const getUnauthUserAnalytics = async (
  platform: UnauthPlatform,
  platformId: string
): Promise<UnauthAnalytics | null> => {
  if (!isRedisConnected()) {
    return null
  }

  try {
    const analyticsKey = getAnalyticsKey(platform, platformId)
    const data = await redisClient.get(analyticsKey)

    if (!data) {
      return null
    }

    return JSON.parse(data) as UnauthAnalytics
  } catch (error) {
    logger.error(
      `[UnauthConversation] Failed to get analytics: ${error instanceof Error ? error.message : error}`
    )
    return null
  }
}

export const getDailyUnauthStats = async (
  platform: UnauthPlatform,
  date?: string
): Promise<Record<string, number> | null> => {
  if (!isRedisConnected()) {
    return null
  }

  try {
    const dateStr = date || new Date().toISOString().split("T")[0]
    const dailyKey = getDailyStatsKey(platform, dateStr)
    const stats = await redisClient.hgetall(dailyKey)

    if (!stats || Object.keys(stats).length === 0) {
      return null
    }

    return {
      totalMessages: Number.parseInt(stats.totalMessages || "0", 10),
      userMessages: Number.parseInt(stats.userMessages || "0", 10),
      assistantMessages: Number.parseInt(stats.assistantMessages || "0", 10),
      uniqueUsers: Number.parseInt(stats.uniqueUsers || "0", 10),
      conversions: Number.parseInt(stats.conversions || "0", 10),
    }
  } catch (error) {
    logger.error(
      `[UnauthConversation] Failed to get daily stats: ${error instanceof Error ? error.message : error}`
    )
    return null
  }
}

export const clearUnauthConversation = async (
  platform: UnauthPlatform,
  platformId: string
): Promise<void> => {
  if (!isRedisConnected()) {
    return
  }

  try {
    const conversationKey = getConversationKey(platform, platformId)
    await redisClient.del(conversationKey)
    logger.debug(
      `[UnauthConversation] Cleared conversation for ${platform}:${platformId}`
    )
  } catch (error) {
    logger.error(
      `[UnauthConversation] Failed to clear conversation: ${error instanceof Error ? error.message : error}`
    )
  }
}

export const unauthConversation = {
  storeMessage: storeUnauthMessage,
  getConversation: getUnauthConversation,
  getMessagesForContext: getUnauthMessagesForContext,
  buildContextPrompt: buildUnauthContextPrompt,
  markConverted: markUnauthUserConverted,
  getUserAnalytics: getUnauthUserAnalytics,
  getDailyStats: getDailyUnauthStats,
  clearConversation: clearUnauthConversation,
}
