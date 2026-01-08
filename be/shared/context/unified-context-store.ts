/**
 * Unified Context Store - Cross-modal state persistence via Redis.
 * Key pattern: `ctx:{userId}:{key}` with automatic TTL expiration.
 */

import { redisClient, isRedisConnected } from "@/config/clients/redis"
import { logger } from "@/utils/logger"

export type Modality = "chat" | "voice" | "telegram" | "api"

export type EventReference = {
  eventId: string
  calendarId: string
  summary: string
  start: string
  end: string
  storedAt: string
  modality: Modality
}

export type CalendarReference = {
  calendarId: string
  calendarName: string
  isPrimary: boolean
  storedAt: string
  modality: Modality
}

export type ConversationContext = {
  conversationId?: string
  currentTopic?: string
  pendingAction?: {
    type: "create_event" | "update_event" | "delete_event" | "fill_gap"
    payload: Record<string, unknown>
    expiresAt: string
  }
  lastInteraction: string
  modality: Modality
}

export type UserPreferencesContext = {
  timezone: string
  locale: string
  defaultCalendarId?: string
  voiceEnabled: boolean
}

export type ContextSnapshot = {
  userId: string
  lastEvent?: EventReference
  lastCalendar?: CalendarReference
  conversation?: ConversationContext
  preferences?: UserPreferencesContext
  modality: Modality
  fetchedAt: string
}

const CONTEXT_PREFIX = "ctx"
const DEFAULT_TTL_SECONDS = 60 * 60 * 24
const SHORT_TTL_SECONDS = 60 * 60 * 2

const keys = {
  lastEvent: (userId: string) => `${CONTEXT_PREFIX}:${userId}:last_event`,
  lastCalendar: (userId: string) => `${CONTEXT_PREFIX}:${userId}:last_calendar`,
  conversation: (userId: string) => `${CONTEXT_PREFIX}:${userId}:conversation`,
  preferences: (userId: string) => `${CONTEXT_PREFIX}:${userId}:preferences`,
  modality: (userId: string) => `${CONTEXT_PREFIX}:${userId}:modality`,
}

export const unifiedContextStore = {
  async setLastEvent(
    userId: string,
    event: Omit<EventReference, "storedAt">,
    modality: Modality
  ): Promise<void> {
    if (!isRedisConnected()) {
      logger.warn("Redis not connected, skipping context store")
      return
    }

    const reference: EventReference = {
      ...event,
      storedAt: new Date().toISOString(),
      modality,
    }

    try {
      await redisClient.setex(
        keys.lastEvent(userId),
        DEFAULT_TTL_SECONDS,
        JSON.stringify(reference)
      )
      logger.debug(`Context: Stored last event for user ${userId}`)
    } catch (error) {
      logger.error(`Context: Failed to store last event: ${error}`)
    }
  },

  async getLastEvent(userId: string): Promise<EventReference | null> {
    if (!isRedisConnected()) {
      return null
    }

    try {
      const data = await redisClient.get(keys.lastEvent(userId))
      if (!data) return null
      return JSON.parse(data) as EventReference
    } catch (error) {
      logger.error(`Context: Failed to get last event: ${error}`)
      return null
    }
  },

  async clearLastEvent(userId: string): Promise<void> {
    if (!isRedisConnected()) return

    try {
      await redisClient.del(keys.lastEvent(userId))
    } catch (error) {
      logger.error(`Context: Failed to clear last event: ${error}`)
    }
  },

  async setLastCalendar(
    userId: string,
    calendar: Omit<CalendarReference, "storedAt">,
    modality: Modality
  ): Promise<void> {
    if (!isRedisConnected()) {
      logger.warn("Redis not connected, skipping context store")
      return
    }

    const reference: CalendarReference = {
      ...calendar,
      storedAt: new Date().toISOString(),
      modality,
    }

    try {
      await redisClient.setex(
        keys.lastCalendar(userId),
        DEFAULT_TTL_SECONDS,
        JSON.stringify(reference)
      )
      logger.debug(`Context: Stored last calendar for user ${userId}`)
    } catch (error) {
      logger.error(`Context: Failed to store last calendar: ${error}`)
    }
  },

  async getLastCalendar(userId: string): Promise<CalendarReference | null> {
    if (!isRedisConnected()) {
      return null
    }

    try {
      const data = await redisClient.get(keys.lastCalendar(userId))
      if (!data) return null
      return JSON.parse(data) as CalendarReference
    } catch (error) {
      logger.error(`Context: Failed to get last calendar: ${error}`)
      return null
    }
  },

  async setConversation(
    userId: string,
    context: Omit<ConversationContext, "lastInteraction">,
    modality: Modality
  ): Promise<void> {
    if (!isRedisConnected()) {
      logger.warn("Redis not connected, skipping context store")
      return
    }

    const fullContext: ConversationContext = {
      ...context,
      lastInteraction: new Date().toISOString(),
      modality,
    }

    try {
      await redisClient.setex(
        keys.conversation(userId),
        SHORT_TTL_SECONDS,
        JSON.stringify(fullContext)
      )
      logger.debug(`Context: Stored conversation context for user ${userId}`)
    } catch (error) {
      logger.error(`Context: Failed to store conversation context: ${error}`)
    }
  },

  async getConversation(userId: string): Promise<ConversationContext | null> {
    if (!isRedisConnected()) {
      return null
    }

    try {
      const data = await redisClient.get(keys.conversation(userId))
      if (!data) return null
      return JSON.parse(data) as ConversationContext
    } catch (error) {
      logger.error(`Context: Failed to get conversation context: ${error}`)
      return null
    }
  },

  async setPendingAction(
    userId: string,
    action: NonNullable<ConversationContext["pendingAction"]>,
    modality: Modality
  ): Promise<void> {
    const existing = await this.getConversation(userId)
    await this.setConversation(
      userId,
      {
        ...existing,
        pendingAction: action,
        modality,
      },
      modality
    )
  },

  async clearPendingAction(userId: string): Promise<void> {
    const existing = await this.getConversation(userId)
    if (existing) {
      // biome-ignore lint/performance/noDelete: Required to remove property from object before re-storing
      delete existing.pendingAction
      await this.setConversation(userId, existing, existing.modality)
    }
  },

  async setPreferences(
    userId: string,
    preferences: UserPreferencesContext
  ): Promise<void> {
    if (!isRedisConnected()) {
      logger.warn("Redis not connected, skipping context store")
      return
    }

    try {
      await redisClient.setex(
        keys.preferences(userId),
        DEFAULT_TTL_SECONDS,
        JSON.stringify(preferences)
      )
    } catch (error) {
      logger.error(`Context: Failed to store preferences: ${error}`)
    }
  },

  async getPreferences(userId: string): Promise<UserPreferencesContext | null> {
    if (!isRedisConnected()) {
      return null
    }

    try {
      const data = await redisClient.get(keys.preferences(userId))
      if (!data) return null
      return JSON.parse(data) as UserPreferencesContext
    } catch (error) {
      logger.error(`Context: Failed to get preferences: ${error}`)
      return null
    }
  },

  async setModality(userId: string, modality: Modality): Promise<void> {
    if (!isRedisConnected()) return

    try {
      await redisClient.setex(
        keys.modality(userId),
        SHORT_TTL_SECONDS,
        modality
      )
    } catch (error) {
      logger.error(`Context: Failed to set modality: ${error}`)
    }
  },

  async getModality(userId: string): Promise<Modality | null> {
    if (!isRedisConnected()) return null

    try {
      const modality = await redisClient.get(keys.modality(userId))
      return modality as Modality | null
    } catch (error) {
      logger.error(`Context: Failed to get modality: ${error}`)
      return null
    }
  },

  async getSnapshot(userId: string): Promise<ContextSnapshot> {
    const [lastEvent, lastCalendar, conversation, preferences, modality] =
      await Promise.all([
        this.getLastEvent(userId),
        this.getLastCalendar(userId),
        this.getConversation(userId),
        this.getPreferences(userId),
        this.getModality(userId),
      ])

    return {
      userId,
      lastEvent: lastEvent ?? undefined,
      lastCalendar: lastCalendar ?? undefined,
      conversation: conversation ?? undefined,
      preferences: preferences ?? undefined,
      modality: modality ?? "chat",
      fetchedAt: new Date().toISOString(),
    }
  },

  async clearAll(userId: string): Promise<void> {
    if (!isRedisConnected()) return

    try {
      const keysToDelete = [
        keys.lastEvent(userId),
        keys.lastCalendar(userId),
        keys.conversation(userId),
        keys.preferences(userId),
        keys.modality(userId),
      ]
      await redisClient.del(...keysToDelete)
      logger.info(`Context: Cleared all context for user ${userId}`)
    } catch (error) {
      logger.error(`Context: Failed to clear all context: ${error}`)
    }
  },

  async touch(userId: string): Promise<void> {
    if (!isRedisConnected()) return

    try {
      const pipeline = redisClient.pipeline()
      pipeline.expire(keys.lastEvent(userId), DEFAULT_TTL_SECONDS)
      pipeline.expire(keys.lastCalendar(userId), DEFAULT_TTL_SECONDS)
      pipeline.expire(keys.conversation(userId), SHORT_TTL_SECONDS)
      pipeline.expire(keys.preferences(userId), DEFAULT_TTL_SECONDS)
      pipeline.expire(keys.modality(userId), SHORT_TTL_SECONDS)
      await pipeline.exec()
    } catch (error) {
      logger.error(`Context: Failed to touch context TTLs: ${error}`)
    }
  },
}
