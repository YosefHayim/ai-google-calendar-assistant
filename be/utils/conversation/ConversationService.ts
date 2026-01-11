import { SUPABASE } from "@/config/clients/supabase";
import { logger } from "@/utils/logger";
import { isToday } from "@/utils/date/date-helpers";
import type { userAndAiMessageProps } from "@/types";
import type { Database } from "@/database.types";
import type {
  ConversationConfig,
  ConversationContext,
  ConversationListItem,
  ConversationSource,
  FullConversation,
  MessageRole,
  SummarizeFn,
  TelegramConversationRow,
  WebConversationRow,
} from "./types";
import { DEFAULT_CONVERSATION_CONFIG } from "./types";

type ConversationInsert =
  Database["public"]["Tables"]["conversations"]["Insert"];

const TITLE_TRUNCATE_LENGTH = 50;
const TITLE_TRUNCATE_SUFFIX_LENGTH = 47;
const TITLE_CLEANUP_REGEX = /^[-•*]\s*/;

const mapRoleToDb = (role: "user" | "assistant" | "system"): MessageRole =>
  role as MessageRole;

const calculateContextLength = (messages: userAndAiMessageProps[]): number =>
  messages.reduce((total, msg) => total + (msg.content?.length || 0), 0);

type StoreSummaryParams = {
  conversationId: string;
  userId: string;
  summaryText: string;
  messageCount: number;
  firstSequence: number;
  lastSequence: number;
};

type AddMessageParams = {
  stateId: string;
  userId: string;
  context: ConversationContext;
  message: userAndAiMessageProps;
  summarizeFn: SummarizeFn;
};

export class ConversationService {
  private readonly source: ConversationSource;
  private readonly config: ConversationConfig;

  constructor(
    source: ConversationSource,
    config: Partial<ConversationConfig> = {},
  ) {
    this.source = source;
    this.config = { ...DEFAULT_CONVERSATION_CONFIG, ...config };
  }

  async getConversationMessages(
    conversationId: string,
  ): Promise<userAndAiMessageProps[]> {
    logger.info(`getConversationMessages: fetching messages for conversation ${conversationId}`);

    const { data, error } = await SUPABASE.from("conversation_messages")
      .select("role, content, sequence_number")
      .eq("conversation_id", conversationId)
      .order("sequence_number", { ascending: true });

    if (error) {
      logger.error(`getConversationMessages: error fetching messages for ${conversationId}: ${error.message}`);
      return [];
    }

    if (!data || data.length === 0) {
      logger.warn(`getConversationMessages: no messages found for conversation ${conversationId}`);
      return [];
    }

    logger.info(`getConversationMessages: found ${data.length} messages for conversation ${conversationId}`);

    return data
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
  }

  async getTodayConversation(
    identifier: string | number,
  ): Promise<WebConversationRow | TelegramConversationRow | null> {
    const isWeb = this.source === "web";
    const filterField = isWeb ? "user_id" : "external_chat_id";

    const { data, error } = await SUPABASE.from("conversations")
      .select("*")
      .eq(filterField, identifier)
      .eq("source", this.source)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error(
        `Failed to fetch conversation for ${this.source} ${identifier}: ${error.message}`,
      );
      return null;
    }

    if (!data) {
      return null;
    }

    const updatedAt = data.updated_at || data.created_at;
    if (!isToday(updatedAt)) {
      return null;
    }

    return data as WebConversationRow | TelegramConversationRow;
  }

  async createConversation(
    userId: string,
    externalChatId?: number,
    initialMessage?: userAndAiMessageProps,
  ): Promise<{ id: string; context: ConversationContext } | null> {
    const insertData: ConversationInsert = {
      user_id: userId,
      source: this.source,
      is_active: true,
      message_count: initialMessage ? 1 : 0,
    };

    if (this.source === "telegram" && externalChatId) {
      insertData.external_chat_id = externalChatId;
    }

    const { data: conversation, error: convError } = await SUPABASE.from(
      "conversations",
    )
      .insert(insertData)
      .select()
      .single();

    if (convError || !conversation) {
      logger.error(
        `Failed to create ${this.source} conversation for user ${userId}: ${convError?.message}`,
      );
      return null;
    }

    if (initialMessage?.content) {
      await SUPABASE.from("conversation_messages").insert({
        conversation_id: conversation.id,
        role: mapRoleToDb(initialMessage.role),
        content: initialMessage.content,
        sequence_number: 1,
      });
    }

    return {
      id: conversation.id,
      context: {
        messages: initialMessage ? [initialMessage] : [],
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  async updateConversationState(
    conversationId: string,
    context: ConversationContext,
    messageCount: number,
  ): Promise<boolean> {
    const updateData: Database["public"]["Tables"]["conversations"]["Update"] =
      {
        message_count: messageCount,
        summary: context.summary,
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      };

    if (context.title) {
      updateData.title = context.title;
    }

    const { error } = await SUPABASE.from("conversations")
      .update(updateData)
      .eq("id", conversationId);

    if (error) {
      logger.error(
        `Failed to update conversation ${conversationId}: ${error.message}`,
      );
      return false;
    }

    return true;
  }

  async updateTitle(conversationId: string, title: string): Promise<boolean> {
    const { error } = await SUPABASE.from("conversations")
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (error) {
      logger.error(
        `Failed to update title for ${conversationId}: ${error.message}`,
      );
      return false;
    }

    return true;
  }

  async storeSummary(params: StoreSummaryParams): Promise<boolean> {
    // Summary is now stored directly in conversations.summary column
    // This method updates the summary field in the conversation record
    const { error } = await SUPABASE.from("conversations")
      .update({
        summary: params.summaryText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.conversationId);

    if (error) {
      logger.error(
        `Failed to store summary for ${params.conversationId}: ${error.message}`,
      );
      return false;
    }

    return true;
  }

  async markAsSummarized(
    conversationId: string,
    summary: string,
  ): Promise<boolean> {
    const { error } = await SUPABASE.from("conversations")
      .update({
        summary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (error) {
      logger.error(
        `Failed to mark ${conversationId} as summarized: ${error.message}`,
      );
      return false;
    }

    return true;
  }

  async condenseSummary(
    existingSummary: string,
    newSummary: string,
    summarizeFn: SummarizeFn,
  ): Promise<string> {
    const combined = `${existingSummary}\n\n${newSummary}`;

    if (combined.length <= this.config.maxSummaryLength) {
      return combined;
    }

    try {
      const condensedSummary = await summarizeFn([
        {
          role: "user",
          content: `Please condense this conversation summary:\n${combined}`,
        },
      ]);
      return condensedSummary.slice(0, this.config.maxSummaryLength);
    } catch {
      return combined.slice(-this.config.maxSummaryLength);
    }
  }

  async addMessageAndMaybeSummarize(
    params: AddMessageParams,
  ): Promise<ConversationContext> {
    const { stateId, userId, context, message, summarizeFn } = params;

    const { data: lastMsg } = await SUPABASE.from("conversation_messages")
      .select("sequence_number")
      .eq("conversation_id", stateId)
      .order("sequence_number", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSequence = (lastMsg?.sequence_number || 0) + 1;

    logger.info(
      `addMessageAndMaybeSummarize: stateId=${stateId}, role=${message.role}, hasContent=${!!message.content}, contentLen=${message.content?.length || 0}, nextSeq=${nextSequence}`,
    );

    if (message.content) {
      const { data: insertedMsg, error: insertError } = await SUPABASE.from(
        "conversation_messages",
      )
        .insert({
          conversation_id: stateId,
          role: mapRoleToDb(message.role),
          content: message.content,
          sequence_number: nextSequence,
        })
        .select()
        .single();

      if (insertError) {
        logger.error(
          `Failed to insert message for conversation ${stateId}: ${insertError.message}`,
        );
      } else {
        logger.info(
          `Successfully inserted message ${insertedMsg?.id} for conversation ${stateId}`,
        );
      }
    } else {
      logger.warn(
        `Skipping message insert - no content: stateId=${stateId}, role=${message.role}`,
      );
    }

    context.messages.push(message);
    context.lastUpdated = new Date().toISOString();

    const totalLength = calculateContextLength(context.messages);
    const shouldSummarize =
      (totalLength > this.config.maxContextLength ||
        context.messages.length > this.config.maxMessagesBeforeSummarize) &&
      context.messages.length > 2;

    if (shouldSummarize) {
      const messagesToSummarize = context.messages.slice(0, -2);
      const recentMessages = context.messages.slice(-2);

      try {
        const newSummary = await summarizeFn(messagesToSummarize);

        const firstSeq = nextSequence - context.messages.length + 1;
        const lastSeq = nextSequence - 2;
        await this.storeSummary({
          conversationId: stateId,
          userId,
          summaryText: newSummary,
          messageCount: messagesToSummarize.length,
          firstSequence: firstSeq,
          lastSequence: lastSeq,
        });

        if (context.summary) {
          context.summary = await this.condenseSummary(
            context.summary,
            newSummary,
            summarizeFn,
          );
        } else {
          context.summary = newSummary.slice(0, this.config.maxSummaryLength);
        }

        context.messages = recentMessages;
        await this.markAsSummarized(stateId, context.summary);
      } catch (error) {
        logger.error(`Failed to summarize conversation ${stateId}: ${error}`);
      }
    }

    // Use nextSequence as the actual message count (represents total messages in DB)
    // Not context.messages.length which can be reduced after summarization
    await this.updateConversationState(stateId, context, nextSequence);
    return context;
  }

  buildContextPrompt(context: ConversationContext): string {
    const parts: string[] = [];

    if (context.summary) {
      const truncatedSummary =
        context.summary.length > this.config.maxSummaryDisplayLength
          ? context.summary.slice(-this.config.maxSummaryDisplayLength)
          : context.summary;
      parts.push(`Previous conversation summary:\n${truncatedSummary}`);
    }

    if (context.messages.length > 0) {
      let messageHistory = context.messages
        .map(
          (msg) =>
            `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
        )
        .join("\n");
      if (messageHistory.length > this.config.maxMessagesDisplayLength) {
        messageHistory = messageHistory.slice(
          -this.config.maxMessagesDisplayLength,
        );
      }
      parts.push(`Recent messages:\n${messageHistory}`);
    }

    const result = parts.join("\n\n");

    if (result.length > this.config.maxContextPromptLength) {
      return result.slice(-this.config.maxContextPromptLength);
    }

    return result;
  }

  async getConversationList(
    userId: string,
    options?: { limit?: number; offset?: number; search?: string },
  ): Promise<ConversationListItem[]> {
    const DEFAULT_LIMIT = 20;
    const MIN_SEARCH_LENGTH = 2;

    const limit = options?.limit || DEFAULT_LIMIT;
    const offset = options?.offset || 0;
    const search = options?.search;

    let query = SUPABASE.from("conversations")
      .select(
        "id, message_count, title, summary, created_at, updated_at, last_message_at",
      )
      .eq("user_id", userId)
      .eq("source", this.source);

    if (search && search.length >= MIN_SEARCH_LENGTH) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data, error } = await query
      .order("updated_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error(
        `Failed to fetch conversation list for user ${userId}: ${error.message}`,
      );
      return [];
    }

    return (data || []).map((row) => {
      let title = row.title || "New Conversation";
      if (!row.title && row.summary) {
        const firstLine = row.summary
          .split("\n")[0]
          .replace(TITLE_CLEANUP_REGEX, "");
        title =
          firstLine.length > TITLE_TRUNCATE_LENGTH
            ? `${firstLine.slice(0, TITLE_TRUNCATE_SUFFIX_LENGTH)}...`
            : firstLine;
      }

      return {
        id: row.id,
        title,
        messageCount: row.message_count || 0,
        lastUpdated: row.last_message_at || row.updated_at || row.created_at,
        createdAt: row.created_at,
      };
    });
  }

  async getConversationById(
    conversationId: string,
    userId: string,
  ): Promise<FullConversation | null> {
    logger.info(`getConversationById: fetching conversation ${conversationId} for user ${userId} (source: ${this.source})`);

    const { data, error } = await SUPABASE.from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .eq("source", this.source)
      .single();

    if (error || !data) {
      logger.error(
        `getConversationById: failed to fetch conversation ${conversationId}: ${error?.message}`,
      );
      return null;
    }

    logger.info(`getConversationById: found conversation ${conversationId}, message_count in DB: ${data.message_count}`);

    const messages = await this.getConversationMessages(conversationId);

    logger.info(`getConversationById: returning conversation ${conversationId} with ${messages.length} messages (DB count: ${data.message_count})`);

    return {
      id: data.id,
      userId: data.user_id,
      messages,
      summary: data.summary || undefined,
      title: data.title || undefined,
      messageCount: data.message_count || 0,
      lastUpdated: data.last_message_at || data.updated_at || data.created_at,
      createdAt: data.created_at,
    };
  }

  async loadConversationIntoContext(
    conversationId: string,
    userId: string,
  ): Promise<{ stateId: string; context: ConversationContext } | null> {
    logger.info(
      `loadConversationIntoContext: loading ${conversationId} for user ${userId}`,
    );

    const conversation = await this.getConversationById(conversationId, userId);

    if (!conversation) {
      logger.warn(
        `loadConversationIntoContext: conversation ${conversationId} not found for user ${userId}`,
      );
      return null;
    }

    logger.info(
      `loadConversationIntoContext: found conversation ${conversationId} with ${conversation.messages.length} messages`,
    );

    return {
      stateId: conversation.id,
      context: {
        messages: conversation.messages,
        summary: conversation.summary,
        title: conversation.title,
        lastUpdated: conversation.lastUpdated,
      },
    };
  }

  async deleteConversation(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const { error: msgError } = await SUPABASE.from("conversation_messages")
      .delete()
      .eq("conversation_id", conversationId);

    if (msgError) {
      logger.error(
        `Failed to delete messages for ${conversationId}: ${msgError.message}`,
      );
      return false;
    }

    const { error } = await SUPABASE.from("conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", userId)
      .eq("source", this.source);

    if (error) {
      logger.error(
        `Failed to delete conversation ${conversationId}: ${error.message}`,
      );
      return false;
    }

    return true;
  }

  async closeActiveConversation(userId: string): Promise<boolean> {
    const { error } = await SUPABASE.from("conversations")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("source", this.source)
      .eq("is_active", true);

    if (error) {
      logger.error(
        `Failed to close active conversation for user ${userId}: ${error.message}`,
      );
      return false;
    }

    return true;
  }

  async deleteAllConversations(userId: string): Promise<{ success: boolean; deletedCount: number }> {
    // First, get all conversation IDs for this user
    const { data: conversations, error: fetchError } = await SUPABASE
      .from("conversations")
      .select("id")
      .eq("user_id", userId)
      .eq("source", this.source);

    if (fetchError) {
      logger.error(
        `Failed to fetch conversations for deletion for user ${userId}: ${fetchError.message}`,
      );
      return { success: false, deletedCount: 0 };
    }

    if (!conversations || conversations.length === 0) {
      return { success: true, deletedCount: 0 };
    }

    const conversationIds = conversations.map((c) => c.id);

    // Delete all messages for these conversations
    const { error: msgError } = await SUPABASE
      .from("conversation_messages")
      .delete()
      .in("conversation_id", conversationIds);

    if (msgError) {
      logger.error(
        `Failed to delete messages for user ${userId}: ${msgError.message}`,
      );
      return { success: false, deletedCount: 0 };
    }

    // Delete all conversations
    const { error: convError } = await SUPABASE
      .from("conversations")
      .delete()
      .eq("user_id", userId)
      .eq("source", this.source);

    if (convError) {
      logger.error(
        `Failed to delete conversations for user ${userId}: ${convError.message}`,
      );
      return { success: false, deletedCount: 0 };
    }

    logger.info(
      `Deleted ${conversationIds.length} conversations for user ${userId}`,
    );

    return { success: true, deletedCount: conversationIds.length };
  }
}
