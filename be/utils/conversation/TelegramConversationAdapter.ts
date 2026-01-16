import { SUPABASE } from "@/config/clients/supabase";
import type { userAndAiMessageProps } from "@/types";
import { logger } from "@/utils/logger";
import { ConversationService } from "./ConversationService";
import type { ConversationContext, SummarizeFn } from "./types";

const TELEGRAM_CONFIG = {
  maxContextLength: 1500,
  maxSummaryLength: 1000,
  maxMessagesBeforeSummarize: 6,
  maxContextPromptLength: 2000,
  maxSummaryDisplayLength: 800,
  maxMessagesDisplayLength: 1000,
};

/**
 * @description Adapter class for managing Telegram-specific conversation operations.
 * Wraps the ConversationService with Telegram-specific configuration and user mapping.
 * Handles the translation between Telegram user/chat IDs and internal user IDs.
 * @example
 * const adapter = new TelegramConversationAdapter();
 * const context = await adapter.getOrCreateTodayContext(chatId, telegramUserId);
 */
export class TelegramConversationAdapter {
  private readonly service: ConversationService;

  /**
   * @description Creates a new TelegramConversationAdapter instance with Telegram-optimized configuration.
   * Uses smaller context limits suitable for Telegram's messaging patterns.
   * @example
   * const adapter = new TelegramConversationAdapter();
   */
  constructor() {
    this.service = new ConversationService("telegram", TELEGRAM_CONFIG);
  }

  /**
   * @description Retrieves the internal user UUID from a Telegram user ID.
   * Looks up the mapping in the telegram_users table.
   * @param {number} telegramUserId - The Telegram user ID to look up.
   * @returns {Promise<string | null>} The internal user UUID if found, null otherwise.
   * @example
   * const userId = await adapter.getUserIdFromTelegram(123456789);
   * if (userId) {
   *   console.log(`Found internal user: ${userId}`);
   * }
   */
  async getUserIdFromTelegram(telegramUserId: number): Promise<string | null> {
    const { data, error } = await SUPABASE.from("telegram_users")
      .select("user_id")
      .eq("telegram_user_id", telegramUserId)
      .single();

    if (error || !data?.user_id) {
      return null;
    }

    return data.user_id;
  }

  /**
   * @description Ensures a Telegram user mapping exists in the database, creating one if necessary.
   * First checks for an existing mapping, and if not found, creates a new telegram_users record
   * using upsert to handle race conditions.
   * @param {number} telegramUserId - The Telegram user ID.
   * @param {number} chatId - The Telegram chat ID associated with the user.
   * @returns {Promise<string | null>} The internal user UUID (existing or newly created), or null on failure.
   * @example
   * const userId = await adapter.ensureTelegramUserExists(123456789, 987654321);
   * if (userId) {
   *   // User is ready for conversation operations
   * }
   */
  async ensureTelegramUserExists(
    telegramUserId: number,
    chatId: number
  ): Promise<string | null> {
    const existingUserId = await this.getUserIdFromTelegram(telegramUserId);
    if (existingUserId) {
      return existingUserId;
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
      .single();

    if (tgError || !newTgUser?.user_id) {
      logger.error(
        `Failed to ensure telegram user exists for chat ${chatId}: ${tgError?.message}`
      );
      return null;
    }

    return newTgUser.user_id;
  }

  /**
   * @description Retrieves the active conversation for today based on Telegram chat ID.
   * Delegates to the underlying ConversationService.
   * @param {number} chatId - The Telegram chat ID.
   * @returns {Promise<WebConversationRow | TelegramConversationRow | null>} The conversation if found and updated today, null otherwise.
   * @example
   * const conversation = await adapter.getTodayConversationState(987654321);
   */
  getTodayConversationState(chatId: number) {
    return this.service.getTodayConversation(chatId);
  }

  /**
   * @description Creates a new conversation state for a Telegram chat.
   * First ensures the Telegram user exists in the database, then creates the conversation.
   * @param {number} chatId - The Telegram chat ID.
   * @param {number} telegramUserId - The Telegram user ID.
   * @param {userAndAiMessageProps} [initialMessage] - Optional first message to add to the conversation.
   * @returns {Promise<{ id: string; context: ConversationContext } | null>} The created conversation with context, or null on failure.
   * @example
   * const state = await adapter.createConversationState(987654321, 123456789, {
   *   role: "user",
   *   content: "Hello!"
   * });
   */
  async createConversationState(
    chatId: number,
    telegramUserId: number,
    initialMessage?: userAndAiMessageProps
  ): Promise<{ id: string; context: ConversationContext } | null> {
    const userId = await this.ensureTelegramUserExists(telegramUserId, chatId);
    if (!userId) {
      logger.error(`Failed to get user_id for telegram user ${telegramUserId}`);
      return null;
    }

    return this.service.createConversation(userId, chatId, initialMessage);
  }

  /**
   * @description Updates the state of a Telegram conversation in the database.
   * Delegates to the underlying ConversationService.
   * @param {string} conversationId - The unique identifier of the conversation.
   * @param {ConversationContext} context - The updated conversation context.
   * @param {number} messageCount - The total number of messages in the conversation.
   * @returns {Promise<boolean>} True if update succeeded, false on failure.
   * @example
   * const success = await adapter.updateConversationState("conv-123", context, 10);
   */
  updateConversationState(
    conversationId: string,
    context: ConversationContext,
    messageCount: number
  ): Promise<boolean> {
    return this.service.updateConversationState(
      conversationId,
      context,
      messageCount
    );
  }

  /**
   * @description Stores a conversation summary in the database.
   * Delegates to the underlying ConversationService.
   * @param {Object} params - The summary parameters.
   * @param {string} params.conversationId - The conversation ID to update.
   * @param {string} params.userId - The user ID.
   * @param {string} params.summaryText - The summary text to store.
   * @param {number} params.messageCount - Number of messages summarized.
   * @param {number} params.firstSequence - First message sequence number in summary.
   * @param {number} params.lastSequence - Last message sequence number in summary.
   * @returns {Promise<boolean>} True if storage succeeded, false on failure.
   * @example
   * const success = await adapter.storeSummary({
   *   conversationId: "conv-123",
   *   userId: "user-456",
   *   summaryText: "Summary of discussion...",
   *   messageCount: 10,
   *   firstSequence: 1,
   *   lastSequence: 10
   * });
   */
  storeSummary(params: {
    conversationId: string;
    userId: string;
    summaryText: string;
    messageCount: number;
    firstSequence: number;
    lastSequence: number;
  }): Promise<boolean> {
    return this.service.storeSummary(params);
  }

  /**
   * @description Marks a conversation as summarized by updating its summary field.
   * Delegates to the underlying ConversationService.
   * @param {string} conversationId - The unique identifier of the conversation.
   * @param {string} summary - The summary text to store.
   * @returns {Promise<boolean>} True if update succeeded, false on failure.
   * @example
   * const success = await adapter.markAsSummarized("conv-123", "Discussion summary...");
   */
  markAsSummarized(conversationId: string, summary: string): Promise<boolean> {
    return this.service.markAsSummarized(conversationId, summary);
  }

  /**
   * @description Gets the existing today's conversation context or creates a new one if none exists.
   * If an existing conversation is found, loads its messages and returns the context.
   * If no conversation exists, creates a new one and returns an empty context.
   * @param {number} chatId - The Telegram chat ID.
   * @param {number} telegramUserId - The Telegram user ID.
   * @returns {Promise<{ stateId: string; context: ConversationContext; userId?: string }>} Object containing the conversation ID, context, and optionally the user ID.
   * @example
   * const { stateId, context, userId } = await adapter.getOrCreateTodayContext(987654321, 123456789);
   * console.log(`Using conversation ${stateId} with ${context.messages.length} messages`);
   */
  async getOrCreateTodayContext(
    chatId: number,
    telegramUserId: number
  ): Promise<{
    stateId: string;
    context: ConversationContext;
    userId?: string;
  }> {
    const existingConversation = await this.getTodayConversationState(chatId);

    if (existingConversation) {
      const messages = await this.service.getConversationMessages(
        existingConversation.id
      );
      const context: ConversationContext = {
        messages,
        summary: existingConversation.summary || undefined,
        lastUpdated:
          existingConversation.updated_at || existingConversation.created_at,
      };
      return {
        stateId: existingConversation.id,
        context,
        userId: existingConversation.user_id,
      };
    }

    const newState = await this.createConversationState(chatId, telegramUserId);

    if (!newState) {
      logger.warn(
        `Failed to create conversation for chat ${chatId}, using fallback`
      );
      return {
        stateId: "",
        context: { messages: [], lastUpdated: new Date().toISOString() },
      };
    }

    return {
      stateId: newState.id,
      context: newState.context,
    };
  }

  /**
   * @description Adds a message to the current conversation context and handles automatic summarization.
   * Gets or creates today's conversation context, then adds the message using the service's
   * summarization logic when thresholds are exceeded.
   * @param {number} chatId - The Telegram chat ID.
   * @param {number} telegramUserId - The Telegram user ID.
   * @param {userAndAiMessageProps} message - The message to add (user or assistant).
   * @param {SummarizeFn} summarizeFn - Function to call for AI-based summarization when needed.
   * @returns {Promise<ConversationContext>} The updated conversation context.
   * @example
   * const context = await adapter.addMessageToContext(
   *   987654321,
   *   123456789,
   *   { role: "user", content: "What events do I have today?" },
   *   async (msgs) => await aiSummarize(msgs)
   * );
   */
  async addMessageToContext(
    chatId: number,
    telegramUserId: number,
    message: userAndAiMessageProps,
    summarizeFn: SummarizeFn
  ): Promise<ConversationContext> {
    const { stateId, context, userId } = await this.getOrCreateTodayContext(
      chatId,
      telegramUserId
    );

    if (!stateId) {
      context.messages.push(message);
      context.lastUpdated = new Date().toISOString();
      return context;
    }

    if (!userId) {
      const resolvedUserId = await this.getUserIdFromTelegram(telegramUserId);
      if (!resolvedUserId) {
        context.messages.push(message);
        context.lastUpdated = new Date().toISOString();
        return context;
      }
      return this.service.addMessageAndMaybeSummarize({
        stateId,
        userId: resolvedUserId,
        context,
        message,
        summarizeFn,
      });
    }

    return this.service.addMessageAndMaybeSummarize({
      stateId,
      userId,
      context,
      message,
      summarizeFn,
    });
  }

  /**
   * @description Builds a formatted prompt string from conversation context for AI consumption.
   * Delegates to the underlying ConversationService.
   * @param {ConversationContext} context - The conversation context containing summary and messages.
   * @returns {string} A formatted string with summary and message history for the AI prompt.
   * @example
   * const prompt = adapter.buildContextPrompt(context);
   * // Use prompt in AI request for context continuity
   */
  buildContextPrompt(context: ConversationContext): string {
    return this.service.buildContextPrompt(context);
  }

  /**
   * @description Retrieves the current conversation context for a Telegram chat.
   * Convenience method that returns only the context from getOrCreateTodayContext.
   * @param {number} chatId - The Telegram chat ID.
   * @param {number} telegramUserId - The Telegram user ID.
   * @returns {Promise<ConversationContext>} The conversation context with messages and summary.
   * @example
   * const context = await adapter.getConversationContext(987654321, 123456789);
   * console.log(`Current context has ${context.messages.length} messages`);
   */
  async getConversationContext(
    chatId: number,
    telegramUserId: number
  ): Promise<ConversationContext> {
    const { context } = await this.getOrCreateTodayContext(
      chatId,
      telegramUserId
    );
    return context;
  }
}

export const telegramConversation = new TelegramConversationAdapter();
