import type { ConversationContext, ConversationListItem, FullConversation, SummarizeFn } from "./types";

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

export class WebConversationAdapter {
  private readonly service: ConversationService;

  constructor() {
    this.service = new ConversationService("web", WEB_CONFIG);
  }

  getTodayConversationState(userId: string) {
    return this.service.getTodayConversation(userId);
  }

  createConversationState(userId: string, initialMessage?: userAndAiMessageProps): Promise<{ id: string; context: ConversationContext } | null> {
    return this.service.createConversation(userId, undefined, initialMessage);
  }

  updateConversationState(conversationId: string, context: ConversationContext, messageCount: number): Promise<boolean> {
    return this.service.updateConversationState(conversationId, context, messageCount);
  }

  updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
    return this.service.updateTitle(conversationId, title);
  }

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

  markAsSummarized(conversationId: string, summary: string): Promise<boolean> {
    return this.service.markAsSummarized(conversationId, summary);
  }

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
   * Add a message to a specific conversation by ID.
   * Use this when continuing an existing conversation to ensure messages
   * are saved to the correct conversation, not just "today's" conversation.
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

  buildContextPrompt(context: ConversationContext): string {
    return this.service.buildContextPrompt(context);
  }

  async getConversationContext(userId: string): Promise<ConversationContext> {
    const { context } = await this.getOrCreateTodayContext(userId);
    return context;
  }

  getConversationList(userId: string, options?: { limit?: number; offset?: number; search?: string }): Promise<ConversationListItem[]> {
    return this.service.getConversationList(userId, options);
  }

  getConversationById(conversationId: string, userId: string): Promise<FullConversation | null> {
    return this.service.getConversationById(conversationId, userId);
  }

  loadConversationIntoContext(conversationId: string, userId: string): Promise<{ stateId: string; context: ConversationContext } | null> {
    return this.service.loadConversationIntoContext(conversationId, userId);
  }

  deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    return this.service.deleteConversation(conversationId, userId);
  }

  closeActiveConversation(userId: string): Promise<boolean> {
    return this.service.closeActiveConversation(userId);
  }
}

export const webConversation = new WebConversationAdapter();
