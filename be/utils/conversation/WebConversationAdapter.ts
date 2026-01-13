import type { ConversationContext, ConversationListItem, FullConversation, SharedConversation, SummarizeFn } from "./types";

import { ConversationService } from "./ConversationService";
import { logger } from "@/utils/logger";
import type { userAndAiMessageProps } from "@/types";

const WEB_CONFIG = {
  maxContextLength: 1000,
  maxSummaryLength: 1000,
  maxMessagesBeforeSummarize: 6,
  maxContextPromptLength: 2000,
  maxSummaryDisplayLength: 800,
  maxMessagesDisplayLength: 1000,
};

/**
 * @description Adapter class for managing web-based conversation operations.
 * Wraps the ConversationService with web-specific configuration and provides
 * a simplified API for web frontend interactions including conversation listing,
 * loading, and message management.
 * @example
 * const adapter = new WebConversationAdapter();
 * const conversations = await adapter.getConversationList(userId);
 */
export class WebConversationAdapter {
  private readonly service: ConversationService;

  /**
   * @description Creates a new WebConversationAdapter instance with web-optimized configuration.
   * Uses configuration suitable for web application conversation patterns.
   * @example
   * const adapter = new WebConversationAdapter();
   */
  constructor() {
    this.service = new ConversationService("web", WEB_CONFIG);
  }

  /**
   * @description Retrieves the active conversation for today based on user ID.
   * Delegates to the underlying ConversationService.
   * @param {string} userId - The UUID of the user.
   * @returns {Promise<WebConversationRow | TelegramConversationRow | null>} The conversation if found and updated today, null otherwise.
   * @example
   * const conversation = await adapter.getTodayConversationState("user-uuid-123");
   */
  getTodayConversationState(userId: string) {
    return this.service.getTodayConversation(userId);
  }

  /**
   * @description Creates a new conversation state for a web user.
   * Delegates to the underlying ConversationService without external chat ID.
   * @param {string} userId - The UUID of the user.
   * @param {userAndAiMessageProps} [initialMessage] - Optional first message to add to the conversation.
   * @returns {Promise<{ id: string; context: ConversationContext } | null>} The created conversation with context, or null on failure.
   * @example
   * const state = await adapter.createConversationState("user-uuid-123", {
   *   role: "user",
   *   content: "Hello!"
   * });
   */
  createConversationState(userId: string, initialMessage?: userAndAiMessageProps): Promise<{ id: string; context: ConversationContext } | null> {
    return this.service.createConversation(userId, undefined, initialMessage);
  }

  /**
   * @description Updates the state of a web conversation in the database.
   * Delegates to the underlying ConversationService.
   * @param {string} conversationId - The unique identifier of the conversation.
   * @param {ConversationContext} context - The updated conversation context.
   * @param {number} messageCount - The total number of messages in the conversation.
   * @returns {Promise<boolean>} True if update succeeded, false on failure.
   * @example
   * const success = await adapter.updateConversationState("conv-123", context, 10);
   */
  updateConversationState(conversationId: string, context: ConversationContext, messageCount: number): Promise<boolean> {
    return this.service.updateConversationState(conversationId, context, messageCount);
  }

  /**
   * @description Updates the title of a conversation.
   * Delegates to the underlying ConversationService.
   * @param {string} conversationId - The unique identifier of the conversation.
   * @param {string} title - The new title to set.
   * @returns {Promise<boolean>} True if update succeeded, false on failure.
   * @example
   * const success = await adapter.updateConversationTitle("conv-123", "Calendar Planning Discussion");
   */
  updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
    return this.service.updateTitle(conversationId, title);
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
   *   summaryText: "Summary of calendar discussion...",
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
   * @param {string} userId - The UUID of the user.
   * @returns {Promise<{ stateId: string; context: ConversationContext }>} Object containing the conversation ID and context.
   * @example
   * const { stateId, context } = await adapter.getOrCreateTodayContext("user-uuid-123");
   * console.log(`Using conversation ${stateId} with ${context.messages.length} messages`);
   */
  async getOrCreateTodayContext(userId: string): Promise<{ stateId: string; context: ConversationContext }> {
    const existingConversation = await this.getTodayConversationState(userId);

    if (existingConversation) {
      const messages = await this.service.getConversationMessages(existingConversation.id);
      const context: ConversationContext = {
        messages,
        summary: existingConversation.summary || undefined,
        title: (existingConversation as { title?: string | null }).title || undefined,
        lastUpdated: existingConversation.updated_at || existingConversation.created_at,
      };
      return { stateId: existingConversation.id, context };
    }

    const newState = await this.createConversationState(userId);

    if (!newState) {
      logger.warn(`Failed to create conversation state for user ${userId}, using fallback`);
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
   * @description Adds a message to the current today's conversation context and handles automatic summarization.
   * Gets or creates today's conversation context, then adds the message using the service's
   * summarization logic when thresholds are exceeded.
   * @param {string} userId - The UUID of the user.
   * @param {userAndAiMessageProps} message - The message to add (user or assistant).
   * @param {SummarizeFn} summarizeFn - Function to call for AI-based summarization when needed.
   * @returns {Promise<ConversationContext>} The updated conversation context.
   * @example
   * const context = await adapter.addMessageToContext(
   *   "user-uuid-123",
   *   { role: "user", content: "What events do I have today?" },
   *   async (msgs) => await aiSummarize(msgs)
   * );
   */
  async addMessageToContext(userId: string, message: userAndAiMessageProps, summarizeFn: SummarizeFn): Promise<ConversationContext> {
    const { stateId, context } = await this.getOrCreateTodayContext(userId);

    if (!stateId) {
      context.messages.push(message);
      context.lastUpdated = new Date().toISOString();
      return context;
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
   * @description Adds a message to a specific conversation by ID, not just today's conversation.
   * Use this when continuing an existing conversation to ensure messages are saved to the
   * correct conversation. Falls back to today's context if the specified conversation cannot be loaded.
   * @param {string} conversationId - The unique identifier of the target conversation.
   * @param {string} userId - The UUID of the user.
   * @param {userAndAiMessageProps} message - The message to add (user or assistant).
   * @param {SummarizeFn} summarizeFn - Function to call for AI-based summarization when needed.
   * @returns {Promise<ConversationContext>} The updated conversation context.
   * @example
   * const context = await adapter.addMessageToConversation(
   *   "conv-123",
   *   "user-uuid-456",
   *   { role: "assistant", content: "Here are your events for today..." },
   *   async (msgs) => await aiSummarize(msgs)
   * );
   */
  async addMessageToConversation(
    conversationId: string,
    userId: string,
    message: userAndAiMessageProps,
    summarizeFn: SummarizeFn
  ): Promise<ConversationContext> {
    if (!conversationId) {
      logger.warn(`addMessageToConversation called with empty conversationId, falling back to today's context`);
      return this.addMessageToContext(userId, message, summarizeFn);
    }

    const loaded = await this.loadConversationIntoContext(conversationId, userId);

    if (!loaded) {
      logger.warn(`Failed to load conversation ${conversationId} for user ${userId}, falling back to today's context`);
      return this.addMessageToContext(userId, message, summarizeFn);
    }

    logger.info(`Adding ${message.role} message to conversation ${conversationId} (content length: ${message.content?.length || 0})`);

    return this.service.addMessageAndMaybeSummarize({
      stateId: loaded.stateId,
      userId,
      context: loaded.context,
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
   * @description Retrieves the current conversation context for a web user.
   * Convenience method that returns only the context from getOrCreateTodayContext.
   * @param {string} userId - The UUID of the user.
   * @returns {Promise<ConversationContext>} The conversation context with messages and summary.
   * @example
   * const context = await adapter.getConversationContext("user-uuid-123");
   * console.log(`Current context has ${context.messages.length} messages`);
   */
  async getConversationContext(userId: string): Promise<ConversationContext> {
    const { context } = await this.getOrCreateTodayContext(userId);
    return context;
  }

  /**
   * @description Retrieves a paginated list of conversations for a user.
   * Supports search filtering by title and pagination with limit/offset.
   * Delegates to the underlying ConversationService.
   * @param {string} userId - The UUID of the user whose conversations to list.
   * @param {Object} [options] - Optional filtering and pagination options.
   * @param {number} [options.limit] - Maximum number of conversations to return.
   * @param {number} [options.offset] - Number of conversations to skip for pagination.
   * @param {string} [options.search] - Search term to filter conversations by title.
   * @returns {Promise<ConversationListItem[]>} Array of conversation list items.
   * @example
   * const conversations = await adapter.getConversationList("user-123", {
   *   limit: 10,
   *   offset: 0,
   *   search: "meeting"
   * });
   */
  getConversationList(userId: string, options?: { limit?: number; offset?: number; search?: string }): Promise<ConversationListItem[]> {
    return this.service.getConversationList(userId, options);
  }

  /**
   * @description Retrieves a full conversation by ID including all its messages.
   * Validates that the conversation belongs to the specified user.
   * Delegates to the underlying ConversationService.
   * @param {string} conversationId - The unique identifier of the conversation.
   * @param {string} userId - The UUID of the user who owns the conversation.
   * @returns {Promise<FullConversation | null>} The full conversation with messages, or null if not found.
   * @example
   * const conversation = await adapter.getConversationById("conv-123", "user-456");
   * if (conversation) {
   *   console.log(`Found ${conversation.messages.length} messages`);
   * }
   */
  getConversationById(conversationId: string, userId: string): Promise<FullConversation | null> {
    return this.service.getConversationById(conversationId, userId);
  }

  /**
   * @description Loads an existing conversation into a context object for continued interaction.
   * Retrieves the full conversation and transforms it into a ConversationContext format.
   * Delegates to the underlying ConversationService.
   * @param {string} conversationId - The unique identifier of the conversation to load.
   * @param {string} userId - The UUID of the user who owns the conversation.
   * @returns {Promise<{ stateId: string; context: ConversationContext } | null>} Object with conversation ID and context, or null if not found.
   * @example
   * const loaded = await adapter.loadConversationIntoContext("conv-123", "user-456");
   * if (loaded) {
   *   const { stateId, context } = loaded;
   *   // Continue conversation with context.messages
   * }
   */
  loadConversationIntoContext(conversationId: string, userId: string): Promise<{ stateId: string; context: ConversationContext } | null> {
    return this.service.loadConversationIntoContext(conversationId, userId);
  }

  /**
   * @description Permanently deletes a conversation and all its associated messages.
   * Validates that the conversation belongs to the specified user.
   * Delegates to the underlying ConversationService.
   * @param {string} conversationId - The unique identifier of the conversation to delete.
   * @param {string} userId - The UUID of the user who owns the conversation.
   * @returns {Promise<boolean>} True if deletion succeeded, false if any deletion failed.
   * @example
   * const success = await adapter.deleteConversation("conv-123", "user-456");
   * if (success) {
   *   console.log("Conversation deleted successfully");
   * }
   */
  deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    return this.service.deleteConversation(conversationId, userId);
  }

  /**
   * @description Permanently deletes all conversations and their messages for a user.
   * Delegates to the underlying ConversationService.
   * Useful for account cleanup or privacy requests.
   * @param {string} userId - The UUID of the user whose conversations should be deleted.
   * @returns {Promise<{ success: boolean; deletedCount: number }>} Object with success status and count of deleted conversations.
   * @example
   * const result = await adapter.deleteAllConversations("user-456");
   * console.log(`Deleted ${result.deletedCount} conversations`);
   */
  deleteAllConversations(userId: string): Promise<{ success: boolean; deletedCount: number }> {
    return this.service.deleteAllConversations(userId);
  }

  /**
   * @description Closes the currently active conversation for a user by setting is_active to false.
   * This allows a new conversation to be created for subsequent interactions.
   * Delegates to the underlying ConversationService.
   * @param {string} userId - The UUID of the user whose active conversation should be closed.
   * @returns {Promise<boolean>} True if the close operation succeeded, false on failure.
   * @example
   * const success = await adapter.closeActiveConversation("user-456");
   * // User can now start a new conversation
   */
  closeActiveConversation(userId: string): Promise<boolean> {
    return this.service.closeActiveConversation(userId);
  }

  createShareLink(
    conversationId: string,
    userId: string,
    expiresInDays?: number,
  ): Promise<{ token: string; expiresAt: string } | null> {
    return this.service.createShareLink(conversationId, userId, expiresInDays);
  }

  revokeShareLink(conversationId: string, userId: string): Promise<boolean> {
    return this.service.revokeShareLink(conversationId, userId);
  }

  getShareStatus(
    conversationId: string,
    userId: string,
  ): Promise<{ isShared: boolean; token?: string; expiresAt?: string } | null> {
    return this.service.getShareStatus(conversationId, userId);
  }

  getSharedConversation(token: string): Promise<SharedConversation | null> {
    return this.service.getSharedConversation(token);
  }
}

export const webConversation = new WebConversationAdapter();
