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
  SharedConversation,
  SummarizeFn,
  TelegramConversationRow,
  WebConversationRow,
} from "./types";
import { DEFAULT_CONVERSATION_CONFIG } from "./types";
import crypto from "node:crypto";

type ConversationInsert =
  Database["public"]["Tables"]["conversations"]["Insert"];

const TITLE_TRUNCATE_LENGTH = 50;
const TITLE_TRUNCATE_SUFFIX_LENGTH = 47;
const TITLE_CLEANUP_REGEX = /^[-•*]\s*/;

/**
 * @description Maps a message role string to the database-compatible MessageRole type.
 * @param {("user" | "assistant" | "system")} role - The role of the message sender.
 * @returns {MessageRole} The role cast to MessageRole type for database storage.
 * @example
 * const dbRole = mapRoleToDb("user"); // Returns "user" as MessageRole
 */
const mapRoleToDb = (role: "user" | "assistant" | "system"): MessageRole =>
  role as MessageRole;

/**
 * @description Calculates the total character length of all message contents in an array.
 * Used to determine when conversation context should be summarized.
 * @param {userAndAiMessageProps[]} messages - Array of conversation messages.
 * @returns {number} The total character count of all message contents.
 * @example
 * const length = calculateContextLength([
 *   { role: "user", content: "Hello" },
 *   { role: "assistant", content: "Hi there!" }
 * ]); // Returns 15
 */
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

/**
 * @description Service class for managing conversation state, messages, and summaries.
 * Handles CRUD operations for conversations stored in Supabase, including automatic
 * summarization of long conversations to maintain context within size limits.
 * @example
 * const service = new ConversationService("web", { maxContextLength: 2000 });
 * const conversation = await service.createConversation(userId);
 */
export class ConversationService {
  private readonly source: ConversationSource;
  private readonly config: ConversationConfig;

  /**
   * @description Creates a new ConversationService instance for managing conversations.
   * @param {ConversationSource} source - The source platform for conversations ("web" or "telegram").
   * @param {Partial<ConversationConfig>} [config={}] - Optional configuration overrides for context limits and summarization thresholds.
   * @example
   * const webService = new ConversationService("web");
   * const telegramService = new ConversationService("telegram", {
   *   maxContextLength: 1500,
   *   maxMessagesBeforeSummarize: 6
   * });
   */
  constructor(
    source: ConversationSource,
    config: Partial<ConversationConfig> = {},
  ) {
    this.source = source;
    this.config = { ...DEFAULT_CONVERSATION_CONFIG, ...config };
  }

  /**
   * @description Retrieves all messages for a specific conversation from the database.
   * Messages are filtered to only include user and assistant roles, ordered by sequence number.
   * Image metadata is extracted and included in the returned message objects.
   * @param {string} conversationId - The unique identifier of the conversation.
   * @returns {Promise<userAndAiMessageProps[]>} Array of messages with role, content, and optional images.
   * @example
   * const messages = await service.getConversationMessages("conv-123");
   * // Returns: [{ role: "user", content: "Hello" }, { role: "assistant", content: "Hi!" }]
   */
  async getConversationMessages(
    conversationId: string,
  ): Promise<userAndAiMessageProps[]> {
    logger.info(`getConversationMessages: fetching messages for conversation ${conversationId}`);

    const { data, error } = await SUPABASE.from("conversation_messages")
      .select("role, content, sequence_number, metadata")
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
      .map((msg) => {
        const message: userAndAiMessageProps = {
          role: msg.role as "user" | "assistant",
          content: msg.content,
        };

        // Extract images from metadata if present
        if (msg.metadata && typeof msg.metadata === "object" && "images" in msg.metadata) {
          const metadata = msg.metadata as { images?: unknown };
          if (Array.isArray(metadata.images)) {
            message.images = metadata.images;
          }
        }

        return message;
      });
  }

  /**
   * @description Retrieves the active conversation for today based on the identifier.
   * For web source, uses user_id; for telegram, uses external_chat_id.
   * Returns null if no active conversation exists or if it wasn't updated today.
   * @param {string | number} identifier - User ID (string) for web or chat ID (number) for telegram.
   * @returns {Promise<WebConversationRow | TelegramConversationRow | null>} The conversation row if found and updated today, null otherwise.
   * @example
   * // Web usage
   * const webConvo = await service.getTodayConversation("user-uuid-123");
   * // Telegram usage
   * const telegramConvo = await service.getTodayConversation(123456789);
   */
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

  /**
   * @description Creates a new conversation in the database with optional initial message.
   * For telegram conversations, also stores the external chat ID.
   * @param {string} userId - The UUID of the user creating the conversation.
   * @param {number} [externalChatId] - Optional telegram chat ID for telegram source conversations.
   * @param {userAndAiMessageProps} [initialMessage] - Optional first message to add to the conversation.
   * @returns {Promise<{ id: string; context: ConversationContext } | null>} The created conversation with its ID and context, or null on failure.
   * @example
   * // Create empty conversation
   * const convo = await service.createConversation("user-uuid-123");
   * // Create with initial message
   * const convoWithMsg = await service.createConversation("user-uuid-123", undefined, {
   *   role: "user",
   *   content: "Hello, assistant!"
   * });
   */
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

  /**
   * @description Updates the conversation state in the database with current context.
   * Updates message count, summary, timestamps, and optionally the title.
   * @param {string} conversationId - The unique identifier of the conversation to update.
   * @param {ConversationContext} context - The current conversation context containing messages, summary, and title.
   * @param {number} messageCount - The total number of messages in the conversation.
   * @returns {Promise<boolean>} True if update succeeded, false on failure.
   * @example
   * const success = await service.updateConversationState("conv-123", {
   *   messages: [...],
   *   summary: "Discussion about calendar events",
   *   title: "Calendar Planning",
   *   lastUpdated: new Date().toISOString()
   * }, 10);
   */
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

  /**
   * @description Updates the title of a conversation in the database.
   * @param {string} conversationId - The unique identifier of the conversation.
   * @param {string} title - The new title to set for the conversation.
   * @returns {Promise<boolean>} True if update succeeded, false on failure.
   * @example
   * const success = await service.updateTitle("conv-123", "Meeting Schedule Discussion");
   */
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

  /**
   * @description Stores a conversation summary in the database.
   * Updates the summary field directly in the conversations table.
   * @param {StoreSummaryParams} params - The summary parameters.
   * @param {string} params.conversationId - The conversation ID to update.
   * @param {string} params.userId - The user ID (for logging purposes).
   * @param {string} params.summaryText - The summary text to store.
   * @param {number} params.messageCount - Number of messages summarized.
   * @param {number} params.firstSequence - First message sequence number in summary.
   * @param {number} params.lastSequence - Last message sequence number in summary.
   * @returns {Promise<boolean>} True if storage succeeded, false on failure.
   * @example
   * const success = await service.storeSummary({
   *   conversationId: "conv-123",
   *   userId: "user-456",
   *   summaryText: "User asked about calendar events...",
   *   messageCount: 10,
   *   firstSequence: 1,
   *   lastSequence: 10
   * });
   */
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

  /**
   * @description Marks a conversation as summarized by updating its summary field.
   * Used after automatic summarization to persist the summary state.
   * @param {string} conversationId - The unique identifier of the conversation.
   * @param {string} summary - The summary text to store.
   * @returns {Promise<boolean>} True if update succeeded, false on failure.
   * @example
   * const success = await service.markAsSummarized("conv-123", "Conversation about scheduling meetings...");
   */
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

  /**
   * @description Condenses an existing summary with a new summary when combined length exceeds limits.
   * If the combined summaries fit within maxSummaryLength, they are simply concatenated.
   * Otherwise, uses the provided summarization function to condense them into a shorter summary.
   * @param {string} existingSummary - The current conversation summary.
   * @param {string} newSummary - The new summary to merge with the existing one.
   * @param {SummarizeFn} summarizeFn - Function to call for AI-based summarization.
   * @returns {Promise<string>} The condensed summary, truncated to maxSummaryLength.
   * @example
   * const condensed = await service.condenseSummary(
   *   "Previous discussion about meetings...",
   *   "New discussion about calendar sync...",
   *   async (messages) => await aiSummarize(messages)
   * );
   */
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

  /**
   * @description Adds a message to a conversation and triggers automatic summarization if needed.
   * Checks if context length or message count exceeds configured thresholds, and if so,
   * summarizes older messages to keep context within limits while preserving recent messages.
   * @param {AddMessageParams} params - Parameters for adding the message.
   * @param {string} params.stateId - The conversation ID.
   * @param {string} params.userId - The user ID for the conversation.
   * @param {ConversationContext} params.context - Current conversation context to update.
   * @param {userAndAiMessageProps} params.message - The message to add.
   * @param {SummarizeFn} params.summarizeFn - Function for AI-based summarization.
   * @returns {Promise<ConversationContext>} Updated conversation context with the new message and possibly a new summary.
   * @example
   * const updatedContext = await service.addMessageAndMaybeSummarize({
   *   stateId: "conv-123",
   *   userId: "user-456",
   *   context: currentContext,
   *   message: { role: "user", content: "Schedule a meeting tomorrow" },
   *   summarizeFn: async (msgs) => await aiSummarize(msgs)
   * });
   */
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

    const hasImages = message.images && message.images.length > 0;
    logger.info(
      `addMessageAndMaybeSummarize: stateId=${stateId}, role=${message.role}, hasContent=${!!message.content}, contentLen=${message.content?.length || 0}, hasImages=${hasImages}, nextSeq=${nextSequence}`,
    );

    if (message.content || hasImages) {
      // Build metadata with images if present
      const metadata = hasImages ? { images: message.images } : undefined;

      const { data: insertedMsg, error: insertError } = await SUPABASE.from(
        "conversation_messages",
      )
        .insert({
          conversation_id: stateId,
          role: mapRoleToDb(message.role),
          content: message.content || "",
          sequence_number: nextSequence,
          metadata: metadata,
        })
        .select()
        .single();

      if (insertError) {
        logger.error(
          `Failed to insert message for conversation ${stateId}: ${insertError.message}`,
        );
      } else {
        logger.info(
          `Successfully inserted message ${insertedMsg?.id} for conversation ${stateId}${hasImages ? ` with ${message.images?.length} images` : ""}`,
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

  /**
   * @description Builds a formatted prompt string from conversation context for AI consumption.
   * Combines the conversation summary (if available) and recent message history into a
   * single prompt string, respecting configured display length limits.
   * @param {ConversationContext} context - The conversation context containing summary and messages.
   * @returns {string} A formatted string containing the summary and message history, truncated to maxContextPromptLength.
   * @example
   * const prompt = service.buildContextPrompt({
   *   summary: "User has been asking about calendar events...",
   *   messages: [{ role: "user", content: "What's next?" }],
   *   lastUpdated: new Date().toISOString()
   * });
   * // Returns: "Previous conversation summary:\nUser has been...\n\nRecent messages:\nUser: What's next?"
   */
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

  /**
   * @description Retrieves a paginated list of conversations for a user.
   * Supports search filtering by title and pagination with limit/offset.
   * Falls back to using summary first line as title if no explicit title is set.
   * @param {string} userId - The UUID of the user whose conversations to list.
   * @param {Object} [options] - Optional filtering and pagination options.
   * @param {number} [options.limit=20] - Maximum number of conversations to return.
   * @param {number} [options.offset=0] - Number of conversations to skip for pagination.
   * @param {string} [options.search] - Search term to filter conversations by title (min 2 chars).
   * @returns {Promise<ConversationListItem[]>} Array of conversation list items with id, title, messageCount, lastUpdated, and createdAt.
   * @example
   * const conversations = await service.getConversationList("user-123", {
   *   limit: 10,
   *   offset: 0,
   *   search: "meeting"
   * });
   */
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

  /**
   * @description Retrieves a full conversation by ID including all its messages.
   * Validates that the conversation belongs to the specified user and source.
   * @param {string} conversationId - The unique identifier of the conversation.
   * @param {string} userId - The UUID of the user who owns the conversation.
   * @returns {Promise<FullConversation | null>} The full conversation with messages, or null if not found or access denied.
   * @example
   * const conversation = await service.getConversationById("conv-123", "user-456");
   * if (conversation) {
   *   console.log(`Found ${conversation.messages.length} messages`);
   * }
   */
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

  /**
   * @description Loads an existing conversation into a context object for continued interaction.
   * Retrieves the full conversation and transforms it into a ConversationContext format
   * suitable for adding new messages and building prompts.
   * @param {string} conversationId - The unique identifier of the conversation to load.
   * @param {string} userId - The UUID of the user who owns the conversation.
   * @returns {Promise<{ stateId: string; context: ConversationContext } | null>} Object with conversation ID and context, or null if not found.
   * @example
   * const loaded = await service.loadConversationIntoContext("conv-123", "user-456");
   * if (loaded) {
   *   const { stateId, context } = loaded;
   *   // Continue conversation with context.messages
   * }
   */
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

  /**
   * @description Permanently deletes a conversation and all its associated messages.
   * First deletes all messages in the conversation, then deletes the conversation record.
   * Validates that the conversation belongs to the specified user and source.
   * @param {string} conversationId - The unique identifier of the conversation to delete.
   * @param {string} userId - The UUID of the user who owns the conversation.
   * @returns {Promise<boolean>} True if deletion succeeded, false if any deletion failed.
   * @example
   * const success = await service.deleteConversation("conv-123", "user-456");
   * if (success) {
   *   console.log("Conversation deleted successfully");
   * }
   */
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

  /**
   * @description Closes the currently active conversation for a user by setting is_active to false.
   * This allows a new conversation to be created for subsequent interactions.
   * Only affects conversations matching the service's configured source.
   * @param {string} userId - The UUID of the user whose active conversation should be closed.
   * @returns {Promise<boolean>} True if the close operation succeeded, false on failure.
   * @example
   * const success = await service.closeActiveConversation("user-456");
   * // User can now start a new conversation
   */
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

  /**
   * @description Permanently deletes all conversations and their messages for a user.
   * First fetches all conversation IDs, then batch deletes all associated messages,
   * and finally deletes all conversation records. Useful for account cleanup or privacy requests.
   * @param {string} userId - The UUID of the user whose conversations should be deleted.
   * @returns {Promise<{ success: boolean; deletedCount: number }>} Object with success status and count of deleted conversations.
   * @example
   * const result = await service.deleteAllConversations("user-456");
   * console.log(`Deleted ${result.deletedCount} conversations`);
   */
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

  /**
   * @description Generates a unique share token for a conversation.
   * The token is a 32-character URL-safe random string.
   * @returns {string} A unique share token.
   */
  private generateShareToken(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  /**
   * @description Creates a shareable link for a conversation by generating a unique token.
   * The token expires after the specified duration (default: 7 days).
   * Only the conversation owner can create share links.
   * @param {string} conversationId - The unique identifier of the conversation to share.
   * @param {string} userId - The UUID of the user who owns the conversation.
   * @param {number} [expiresInDays=7] - Number of days until the share link expires.
   * @returns {Promise<{ token: string; expiresAt: string } | null>} The share token and expiration date, or null on failure.
   * @example
   * const share = await service.createShareLink("conv-123", "user-456", 7);
   * if (share) {
   *   console.log(`Share link expires at: ${share.expiresAt}`);
   * }
   */
  async createShareLink(
    conversationId: string,
    userId: string,
    expiresInDays = 7,
  ): Promise<{ token: string; expiresAt: string } | null> {
    // Verify the user owns this conversation
    const { data: conversation, error: fetchError } = await SUPABASE
      .from("conversations")
      .select("id, user_id")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .eq("source", this.source)
      .single();

    if (fetchError || !conversation) {
      logger.error(
        `createShareLink: conversation ${conversationId} not found for user ${userId}`,
      );
      return null;
    }

    const token = this.generateShareToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const { error: updateError } = await SUPABASE
      .from("conversations")
      .update({
        share_token: token,
        share_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    if (updateError) {
      logger.error(
        `createShareLink: failed to update conversation ${conversationId}: ${updateError.message}`,
      );
      return null;
    }

    logger.info(
      `createShareLink: created share link for conversation ${conversationId}, expires ${expiresAt.toISOString()}`,
    );

    return { token, expiresAt: expiresAt.toISOString() };
  }

  /**
   * @description Revokes an existing share link by clearing the share token.
   * Only the conversation owner can revoke share links.
   * @param {string} conversationId - The unique identifier of the conversation.
   * @param {string} userId - The UUID of the user who owns the conversation.
   * @returns {Promise<boolean>} True if the share link was revoked, false on failure.
   * @example
   * const revoked = await service.revokeShareLink("conv-123", "user-456");
   */
  async revokeShareLink(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const { error } = await SUPABASE
      .from("conversations")
      .update({
        share_token: null,
        share_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
      .eq("user_id", userId)
      .eq("source", this.source);

    if (error) {
      logger.error(
        `revokeShareLink: failed to revoke share for ${conversationId}: ${error.message}`,
      );
      return false;
    }

    logger.info(`revokeShareLink: revoked share link for conversation ${conversationId}`);
    return true;
  }

  /**
   * @description Retrieves a shared conversation by its share token.
   * Validates that the token exists and has not expired.
   * Does not require authentication - anyone with the token can access.
   * @param {string} token - The unique share token.
   * @returns {Promise<SharedConversation | null>} The shared conversation with messages, or null if invalid/expired.
   * @example
   * const shared = await service.getSharedConversation("abc123def456...");
   * if (shared) {
   *   console.log(`Viewing shared conversation: ${shared.title}`);
   * }
   */
  async getSharedConversation(token: string): Promise<SharedConversation | null> {
    const { data: conversation, error } = await SUPABASE
      .from("conversations")
      .select("id, title, summary, created_at, share_expires_at, message_count")
      .eq("share_token", token)
      .eq("source", this.source)
      .single();

    if (error || !conversation) {
      logger.warn(`getSharedConversation: invalid token or conversation not found`);
      return null;
    }

    // Check if share link has expired
    if (conversation.share_expires_at) {
      const expiresAt = new Date(conversation.share_expires_at);
      if (expiresAt < new Date()) {
        logger.warn(
          `getSharedConversation: share link expired for conversation ${conversation.id}`,
        );
        return null;
      }
    }

    // Fetch messages for the shared conversation
    const messages = await this.getConversationMessages(conversation.id);

    return {
      id: conversation.id,
      title: conversation.title || "Shared Conversation",
      messages,
      messageCount: conversation.message_count || messages.length,
      createdAt: conversation.created_at,
      expiresAt: conversation.share_expires_at || undefined,
    };
  }

  /**
   * @description Gets the current share status of a conversation.
   * Returns the share token and expiration if the conversation is shared.
   * @param {string} conversationId - The unique identifier of the conversation.
   * @param {string} userId - The UUID of the user who owns the conversation.
   * @returns {Promise<{ isShared: boolean; token?: string; expiresAt?: string } | null>} Share status or null if not found.
   */
  async getShareStatus(
    conversationId: string,
    userId: string,
  ): Promise<{ isShared: boolean; token?: string; expiresAt?: string } | null> {
    const { data, error } = await SUPABASE
      .from("conversations")
      .select("share_token, share_expires_at")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .eq("source", this.source)
      .single();

    if (error || !data) {
      return null;
    }

    const isExpired = data.share_expires_at
      ? new Date(data.share_expires_at) < new Date()
      : false;

    return {
      isShared: !!data.share_token && !isExpired,
      token: data.share_token || undefined,
      expiresAt: data.share_expires_at || undefined,
    };
  }
}
