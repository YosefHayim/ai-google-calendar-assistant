import { SUPABASE } from "@/config/clients/supabase"
import { logger } from "@/utils/logger"
import type { userAndAiMessageProps } from "@/types"
import type { ConversationContext, SummarizeFn } from "./types"
import { ConversationService } from "./ConversationService"

const TELEGRAM_CONFIG = {
  maxContextLength: 1500,
  maxSummaryLength: 1000,
  maxMessagesBeforeSummarize: 6,
  maxContextPromptLength: 2000,
  maxSummaryDisplayLength: 800,
  maxMessagesDisplayLength: 1000,
}

export class TelegramConversationAdapter {
  private readonly service: ConversationService

  constructor() {
    this.service = new ConversationService("telegram", TELEGRAM_CONFIG)
  }

  async getUserIdFromTelegram(telegramUserId: number): Promise<string | null> {
    const { data, error } = await SUPABASE.from("telegram_users")
      .select("user_id")
      .eq("telegram_user_id", telegramUserId)
      .single()

    if (error || !data?.user_id) {
      return null
    }

    return data.user_id
  }

  async ensureTelegramUserExists(
    telegramUserId: number,
    chatId: number
  ): Promise<string | null> {
    const existingUserId = await this.getUserIdFromTelegram(telegramUserId)
    if (existingUserId) {
      return existingUserId
    }

    const { data: newTgUser, error: tgError } = await SUPABASE.from(
      "telegram_users"
    )
      .upsert(
        {
          telegram_user_id: telegramUserId,
          telegram_chat_id: chatId,
        },
        { onConflict: "telegram_user_id" }
      )
      .select("user_id")
      .single()

    if (tgError || !newTgUser?.user_id) {
      logger.error(
        `Failed to ensure telegram user exists for chat ${chatId}: ${tgError?.message}`
      )
      return null
    }

    return newTgUser.user_id
  }

  getTodayConversationState(chatId: number) {
    return this.service.getTodayConversation(chatId)
  }

  async createConversationState(
    chatId: number,
    telegramUserId: number,
    initialMessage?: userAndAiMessageProps
  ): Promise<{ id: string; context: ConversationContext } | null> {
    const userId = await this.ensureTelegramUserExists(telegramUserId, chatId)
    if (!userId) {
      logger.error(`Failed to get user_id for telegram user ${telegramUserId}`)
      return null
    }

    return this.service.createConversation(userId, chatId, initialMessage)
  }

  updateConversationState(
    conversationId: string,
    context: ConversationContext,
    messageCount: number
  ): Promise<boolean> {
    return this.service.updateConversationState(
      conversationId,
      context,
      messageCount
    )
  }

  storeSummary(params: {
    conversationId: string
    userId: string
    summaryText: string
    messageCount: number
    firstSequence: number
    lastSequence: number
  }): Promise<boolean> {
    return this.service.storeSummary(params)
  }

  markAsSummarized(
    conversationId: string,
    summary: string
  ): Promise<boolean> {
    return this.service.markAsSummarized(conversationId, summary)
  }

  async getOrCreateTodayContext(
    chatId: number,
    telegramUserId: number
  ): Promise<{ stateId: string; context: ConversationContext; userId?: string }> {
    const existingConversation = await this.getTodayConversationState(chatId)

    if (existingConversation) {
      const messages = await this.service.getConversationMessages(
        existingConversation.id
      )
      const context: ConversationContext = {
        messages,
        summary: existingConversation.summary || undefined,
        lastUpdated:
          existingConversation.updated_at || existingConversation.created_at,
      }
      return {
        stateId: existingConversation.id,
        context,
        userId: existingConversation.user_id,
      }
    }

    const newState = await this.createConversationState(chatId, telegramUserId)

    if (!newState) {
      logger.warn(`Failed to create conversation for chat ${chatId}, using fallback`)
      return {
        stateId: "",
        context: { messages: [], lastUpdated: new Date().toISOString() },
      }
    }

    return {
      stateId: newState.id,
      context: newState.context,
    }
  }

  async addMessageToContext(
    chatId: number,
    telegramUserId: number,
    message: userAndAiMessageProps,
    summarizeFn: SummarizeFn
  ): Promise<ConversationContext> {
    const { stateId, context, userId } = await this.getOrCreateTodayContext(
      chatId,
      telegramUserId
    )

    if (!stateId) {
      context.messages.push(message)
      context.lastUpdated = new Date().toISOString()
      return context
    }

    if (!userId) {
      const resolvedUserId = await this.getUserIdFromTelegram(telegramUserId)
      if (!resolvedUserId) {
        context.messages.push(message)
        context.lastUpdated = new Date().toISOString()
        return context
      }
      return this.service.addMessageAndMaybeSummarize({
        stateId,
        userId: resolvedUserId,
        context,
        message,
        summarizeFn,
      })
    }

    return this.service.addMessageAndMaybeSummarize({
      stateId,
      userId,
      context,
      message,
      summarizeFn,
    })
  }

  buildContextPrompt(context: ConversationContext): string {
    return this.service.buildContextPrompt(context)
  }

  async getConversationContext(
    chatId: number,
    telegramUserId: number
  ): Promise<ConversationContext> {
    const { context } = await this.getOrCreateTodayContext(chatId, telegramUserId)
    return context
  }
}

export const telegramConversation = new TelegramConversationAdapter()
