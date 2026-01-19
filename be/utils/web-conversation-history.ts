import { SUPABASE } from "@/config/clients/supabase";
import type { Database } from "@/database.types";
import type { userAndAiMessageProps } from "@/types";
import { isToday } from "@/utils/date/date-helpers";
import { logger } from "./logger";

const MAX_CONTEXT_LENGTH = 1000;

type MessageRole = Database["public"]["Enums"]["message_role"];

type ConversationContext = {
  messages: userAndAiMessageProps[];
  summary?: string;
  title?: string;
  lastUpdated: string;
};

type WebConversationRow = {
  id: string;
  user_id: string;
  message_count: number | null;
  summary: string | null;
  title: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
};

/**
 * @description Calculates the total character length of all messages in a conversation.
 * Used to determine when the context size exceeds the threshold for summarization.
 * @param {userAndAiMessageProps[]} messages - Array of conversation messages
 * @returns {number} The total character count of all message contents
 * @example
 * const messages = [{ role: "user", content: "Hello" }, { role: "assistant", content: "Hi!" }];
 * const length = calculateContextLength(messages); // Returns 8
 */
const calculateContextLength = (messages: userAndAiMessageProps[]): number =>
  messages.reduce((total, msg) => total + (msg.content?.length || 0), 0);

/**
 * @description Maps a message role string to the database enum type.
 * Converts the role used in the application to the format expected by Supabase.
 * @param {"user" | "assistant" | "system"} role - The role to convert
 * @returns {MessageRole} The database-compatible message role enum value
 * @example
 * const dbRole = mapRoleToDb("assistant"); // Returns MessageRole enum value
 */
const mapRoleToDb = (role: "user" | "assistant" | "system"): MessageRole =>
  role as MessageRole;

/**
 * @description Retrieves all user and assistant messages for a specific conversation.
 * Fetches messages from the database ordered by sequence number and filters out
 * system and tool messages to return only the conversational exchange.
 * @param {string} conversationId - The unique identifier of the conversation
 * @returns {Promise<userAndAiMessageProps[]>} Array of user and assistant messages in chronological order
 * @example
 * const messages = await getConversationMessages("conv-uuid-123");
 * // Returns: [{ role: "user", content: "..." }, { role: "assistant", content: "..." }]
 */
const getConversationMessages = async (
  conversationId: string
): Promise<userAndAiMessageProps[]> => {
  const { data, error } = await SUPABASE.from("conversation_messages")
    .select("role, content, sequence_number")
    .eq("conversation_id", conversationId)
    .order("sequence_number", { ascending: true });

  if (error || !data) {
    return [];
  }

  // Filter to only user/assistant roles (skip system/tool messages)
  return data
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
};

/**
 * @description Fetches the active conversation from today for a web user.
 * Returns the most recent active conversation that was updated today,
 * or null if no such conversation exists.
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<WebConversationRow | null>} The conversation row if found, null otherwise
 * @example
 * const todayConversation = await getWebTodayConversationState("user-123");
 * if (todayConversation) {
 *   console.log(`Found conversation: ${todayConversation.id}`);
 * }
 */
export const getWebTodayConversationState = async (
  userId: string
): Promise<WebConversationRow | null> => {
  const { data, error } = await SUPABASE.from("conversations")
    .select("*")
    .eq("user_id", userId)
    .eq("source", "web")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error(
      `Failed to fetch conversation state for user ${userId}: ${error.message}`
    );
    return null;
  }

  if (!data) {
    return null;
  }

  // Check if the conversation is from today
  const updatedAt = data.updated_at || data.created_at;
  if (!isToday(updatedAt)) {
    return null;
  }

  return data as WebConversationRow;
};

/**
 * @description Creates a new conversation state for a web user.
 * Initializes a new conversation record in the database and optionally
 * adds an initial message to start the conversation.
 * @param {string} userId - The unique identifier of the user
 * @param {userAndAiMessageProps} [initialMessage] - Optional first message to include in the conversation
 * @returns {Promise<{ id: string; context: ConversationContext } | null>} The created conversation ID and context, or null if creation fails
 * @example
 * const result = await createWebConversationState("user-123", {
 *   role: "user",
 *   content: "Hello, schedule a meeting"
 * });
 * // result.id = "conv-uuid", result.context.messages = [initialMessage]
 */
export const createWebConversationState = async (
  userId: string,
  initialMessage?: userAndAiMessageProps
): Promise<{ id: string; context: ConversationContext } | null> => {
  // Create conversation
  const { data: conversation, error: convError } = await SUPABASE.from(
    "conversations"
  )
    .insert({
      user_id: userId,
      source: "web",
      is_active: true,
      message_count: initialMessage ? 1 : 0,
    })
    .select()
    .single();

  if (convError || !conversation) {
    logger.error(
      `Failed to create conversation state for user ${userId}: ${convError?.message}`
    );
    return null;
  }

  // Add initial message if provided
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
};

/**
 * @description Updates an existing conversation's state with new metadata.
 * Syncs the message count, summary, title, and timestamps in the database.
 * @param {string} conversationId - The unique identifier of the conversation
 * @param {ConversationContext} context - The updated context containing summary and title
 * @param {number} messageCount - The current total number of messages in the conversation
 * @returns {Promise<boolean>} True if the update succeeded, false otherwise
 * @example
 * const success = await updateWebConversationState("conv-123", {
 *   messages: [...],
 *   summary: "User asked about meetings",
 *   title: "Meeting Discussion"
 * }, 10);
 */
export const updateWebConversationState = async (
  conversationId: string,
  context: ConversationContext,
  messageCount: number
): Promise<boolean> => {
  const { error } = await SUPABASE.from("conversations")
    .update({
      message_count: messageCount,
      summary: context.summary,
      title: context.title,
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    logger.error(
      `Failed to update conversation state ${conversationId}: ${error.message}`
    );
    return false;
  }

  return true;
};

/**
 * @description Updates the title of a conversation.
 * Designed for async/fire-and-forget usage to update titles without blocking.
 * @param {string} conversationId - The unique identifier of the conversation
 * @param {string} title - The new title for the conversation
 * @returns {Promise<boolean>} True if the update succeeded, false otherwise
 * @example
 * await updateWebConversationTitle("conv-123", "Weekly Team Sync Planning");
 */
export const updateWebConversationTitle = async (
  conversationId: string,
  title: string
): Promise<boolean> => {
  const { error } = await SUPABASE.from("conversations")
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    logger.error(
      `Failed to update conversation title ${conversationId}: ${error.message}`
    );
    return false;
  }

  return true;
};

/**
 * @description Stores a conversation summary in the database.
 * Summaries are used to compress older messages and maintain context
 * without keeping all messages in memory.
 * @param {string} conversationId - The unique identifier of the conversation
 * @param {string} _userId - The user ID (reserved for future use)
 * @param {string} summaryText - The summary text to store
 * @param {number} _messageCount - Number of messages summarized (reserved for future use)
 * @param {number} _firstSequence - First message sequence number (reserved for future use)
 * @param {number} _lastSequence - Last message sequence number (reserved for future use)
 * @returns {Promise<boolean>} True if the summary was stored successfully, false otherwise
 * @example
 * await storeWebSummary("conv-123", "user-456", "User discussed upcoming meetings", 5, 1, 5);
 */
export const storeWebSummary = async (
  conversationId: string,
  _userId: string,
  summaryText: string,
  _messageCount: number,
  _firstSequence: number,
  _lastSequence: number
): Promise<boolean> => {
  const { error } = await SUPABASE.from("conversations")
    .update({
      summary: summaryText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    logger.error(
      `Failed to store summary for conversation ${conversationId}: ${error.message}`
    );
    return false;
  }

  return true;
};

/**
 * @description Marks a conversation as having been summarized with the given summary.
 * Updates the conversation's summary field to reflect the latest compressed context.
 * @param {string} conversationId - The unique identifier of the conversation
 * @param {string} summary - The complete accumulated summary text
 * @returns {Promise<boolean>} True if the operation succeeded, false otherwise
 * @example
 * await markWebAsSummarized("conv-123", "Previous: User asked about schedule. Current: Planning meetings.");
 */
export const markWebAsSummarized = async (
  conversationId: string,
  summary: string
): Promise<boolean> => {
  const { error } = await SUPABASE.from("conversations")
    .update({
      summary,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    logger.error(
      `Failed to mark conversation ${conversationId} as summarized: ${error.message}`
    );
    return false;
  }

  return true;
};

/**
 * @description Retrieves today's conversation context or creates a new one if none exists.
 * This is the main entry point for getting a user's current conversation state.
 * Returns existing messages and summary if a conversation exists for today.
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<{ stateId: string; context: ConversationContext }>} The conversation ID and full context
 * @example
 * const { stateId, context } = await getOrCreateWebTodayContext("user-123");
 * console.log(`Conversation ${stateId} has ${context.messages.length} messages`);
 */
export const getOrCreateWebTodayContext = async (
  userId: string
): Promise<{ stateId: string; context: ConversationContext }> => {
  const existingConversation = await getWebTodayConversationState(userId);

  if (existingConversation) {
    const messages = await getConversationMessages(existingConversation.id);
    const context: ConversationContext = {
      messages,
      summary: existingConversation.summary || undefined,
      title: existingConversation.title || undefined,
      lastUpdated:
        existingConversation.updated_at || existingConversation.created_at,
    };
    return { stateId: existingConversation.id, context };
  }

  const newState = await createWebConversationState(userId);

  if (!newState) {
    logger.warn(
      `Failed to create conversation state for user ${userId}, using fallback`
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
};

/**
 * @description Adds a new message to the user's conversation and handles automatic summarization.
 * Persists the message to the database and triggers summarization if the context
 * length exceeds the maximum threshold, keeping only the most recent messages.
 * @param {string} userId - The unique identifier of the user
 * @param {userAndAiMessageProps} message - The message to add (user or assistant)
 * @param {(messages: userAndAiMessageProps[]) => Promise<string>} summarizeFn - Function to generate summaries from messages
 * @returns {Promise<ConversationContext>} The updated conversation context with the new message
 * @example
 * const context = await addWebMessageToContext(
 *   "user-123",
 *   { role: "assistant", content: "Here are your meetings..." },
 *   async (msgs) => generateSummary(msgs)
 * );
 */
export const addWebMessageToContext = async (
  userId: string,
  message: userAndAiMessageProps,
  summarizeFn: (messages: userAndAiMessageProps[]) => Promise<string>
): Promise<ConversationContext> => {
  const { stateId, context } = await getOrCreateWebTodayContext(userId);

  if (!stateId) {
    // Fallback: just return context with new message
    context.messages.push(message);
    context.lastUpdated = new Date().toISOString();
    return context;
  }

  // Get current sequence number
  const { data: lastMsg } = await SUPABASE.from("conversation_messages")
    .select("sequence_number")
    .eq("conversation_id", stateId)
    .order("sequence_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSequence = (lastMsg?.sequence_number || 0) + 1;

  // Insert the new message (only if content is defined)
  if (message.content) {
    await SUPABASE.from("conversation_messages").insert({
      conversation_id: stateId,
      role: mapRoleToDb(message.role),
      content: message.content,
      sequence_number: nextSequence,
    });
  }

  context.messages.push(message);
  context.lastUpdated = new Date().toISOString();

  // Check if we need to summarize
  const totalLength = calculateContextLength(context.messages);

  if (totalLength > MAX_CONTEXT_LENGTH && context.messages.length > 2) {
    const messagesToSummarize = context.messages.slice(0, -2);
    const recentMessages = context.messages.slice(-2);

    try {
      const summary = await summarizeFn(messagesToSummarize);

      // Store summary with sequence range
      const firstSeq = nextSequence - context.messages.length + 1;
      const lastSeq = nextSequence - 2;
      await storeWebSummary(
        stateId,
        userId,
        summary,
        messagesToSummarize.length,
        firstSeq,
        lastSeq
      );

      context.summary = context.summary
        ? `${context.summary}\n\n${summary}`
        : summary;
      context.messages = recentMessages;

      await markWebAsSummarized(stateId, context.summary);
    } catch (error) {
      logger.error(
        `Failed to summarize conversation for user ${userId}: ${error}`
      );
      // Continue without summarization if it fails
    }
  }

  await updateWebConversationState(stateId, context, context.messages.length);

  return context;
};

/**
 * @description Builds a formatted prompt string from conversation context.
 * Combines the summary (if any) with recent messages to create a context
 * string suitable for including in AI prompts.
 * @param {ConversationContext} context - The conversation context containing messages and optional summary
 * @returns {string} A formatted string with the conversation history for AI context
 * @example
 * const prompt = buildWebContextPrompt({
 *   messages: [{ role: "user", content: "Hello" }],
 *   summary: "Previous discussion about meetings"
 * });
 * // Returns: "Previous conversation summary:\n...\n\nRecent messages:\n..."
 */
export const buildWebContextPrompt = (context: ConversationContext): string => {
  const parts: string[] = [];

  if (context.summary) {
    parts.push(`Previous conversation summary:\n${context.summary}`);
  }

  if (context.messages.length > 0) {
    const messageHistory = context.messages
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");
    parts.push(`Recent messages:\n${messageHistory}`);
  }

  return parts.join("\n\n");
};

/**
 * @description Retrieves the full conversation context for a web user.
 * Convenience wrapper around getOrCreateWebTodayContext that returns just the context.
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<ConversationContext>} The user's current conversation context
 * @example
 * const context = await getWebConversationContext("user-123");
 * console.log(`Summary: ${context.summary}`);
 * console.log(`Messages: ${context.messages.length}`);
 */
export const getWebConversationContext = async (
  userId: string
): Promise<ConversationContext> => {
  const { context } = await getOrCreateWebTodayContext(userId);
  return context;
};

// ============================================
// Conversation List & Retrieval Functions
// ============================================

export type ConversationListItem = {
  id: string;
  title: string;
  messageCount: number;
  lastUpdated: string;
  createdAt: string;
  pinned: boolean;
};

export type FullConversation = {
  id: string;
  userId: string;
  messages: userAndAiMessageProps[];
  summary?: string;
  messageCount: number;
  lastUpdated: string;
  createdAt: string;
};

/**
 * @description Generates or retrieves a title for a conversation.
 * Returns the explicit title if set, otherwise derives one from the summary
 * or first user message. Falls back to "New Conversation" if no content exists.
 * @param {WebConversationRow} conversation - The conversation database row
 * @param {userAndAiMessageProps[]} messages - The conversation messages
 * @returns {string} The conversation title (max 50 characters with ellipsis if truncated)
 * @example
 * const title = getConversationTitle(conversationRow, messages);
 * // Returns: "Meeting Schedule Discussion" or "New Conversation"
 */
const _getConversationTitle = (
  conversation: WebConversationRow,
  messages: userAndAiMessageProps[]
): string => {
  if (conversation.title) {
    return conversation.title;
  }

  if (conversation.summary) {
    const firstLine = conversation.summary
      .split("\n")[0]
      .replace(/^[-•*]\s*/, "");
    return firstLine.length > 50 ? `${firstLine.slice(0, 47)}...` : firstLine;
  }

  const firstUserMessage = messages.find((m) => m.role === "user");
  if (firstUserMessage?.content) {
    const content = firstUserMessage.content;
    return content.length > 50 ? `${content.slice(0, 47)}...` : content;
  }

  return "New Conversation";
};

/**
 * @description Retrieves a paginated list of conversations for a user.
 * Returns conversation metadata suitable for displaying in a sidebar or list view.
 * Supports pagination and optional title search filtering.
 * @param {string} userId - The unique identifier of the user
 * @param {Object} [options] - Optional pagination and search parameters
 * @param {number} [options.limit=20] - Maximum number of conversations to return
 * @param {number} [options.offset=0] - Number of conversations to skip for pagination
 * @param {string} [options.search] - Search term to filter by title (min 2 characters)
 * @returns {Promise<ConversationListItem[]>} Array of conversation list items sorted by most recent first
 * @example
 * const conversations = await getWebConversationList("user-123", {
 *   limit: 10,
 *   offset: 0,
 *   search: "meeting"
 * });
 */
export const getWebConversationList = async (
  userId: string,
  options?: { limit?: number; offset?: number; search?: string }
): Promise<ConversationListItem[]> => {
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;
  const search = options?.search;

  let query = SUPABASE.from("conversations")
    .select(
      "id, message_count, title, summary, created_at, updated_at, last_message_at, pinned"
    )
    .eq("user_id", userId)
    .eq("source", "web");

  // Add title search filter (case-insensitive) if search is provided and has 2+ characters
  if (search && search.length >= 2) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query
    .order("pinned", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error(
      `Failed to fetch conversation list for user ${userId}: ${error.message}`
    );
    return [];
  }

  return data.map((row) => {
    // Generate title from available data
    let title = row.title || "New Conversation";
    if (!row.title && row.summary) {
      const firstLine = row.summary.split("\n")[0].replace(/^[-•*]\s*/, "");
      title =
        firstLine.length > 50 ? `${firstLine.slice(0, 47)}...` : firstLine;
    }

    return {
      id: row.id,
      title,
      messageCount: row.message_count || 0,
      lastUpdated: row.last_message_at || row.updated_at || row.created_at,
      createdAt: row.created_at,
      pinned: row.pinned,
    };
  });
};

/**
 * @description Retrieves a complete conversation by its ID.
 * Fetches all conversation metadata and messages for display or continuation.
 * Validates that the conversation belongs to the specified user.
 * @param {string} conversationId - The unique identifier of the conversation
 * @param {string} userId - The unique identifier of the user (for authorization)
 * @returns {Promise<FullConversation | null>} The complete conversation with all messages, or null if not found
 * @example
 * const conversation = await getWebConversationById("conv-123", "user-456");
 * if (conversation) {
 *   console.log(`Found ${conversation.messages.length} messages`);
 * }
 */
export const getWebConversationById = async (
  conversationId: string,
  userId: string
): Promise<FullConversation | null> => {
  const { data, error } = await SUPABASE.from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .eq("source", "web")
    .single();

  if (error || !data) {
    logger.error(
      `Failed to fetch conversation ${conversationId}: ${error?.message}`
    );
    return null;
  }

  const messages = await getConversationMessages(conversationId);

  return {
    id: data.id,
    userId: data.user_id,
    messages,
    summary: data.summary || undefined,
    messageCount: data.message_count || 0,
    lastUpdated: data.last_message_at || data.updated_at || data.created_at,
    createdAt: data.created_at,
  };
};

/**
 * @description Loads an existing conversation into the context format for continuation.
 * Used when a user selects a previous conversation to resume.
 * Returns the conversation in a format ready for message addition.
 * @param {string} conversationId - The unique identifier of the conversation to load
 * @param {string} userId - The unique identifier of the user (for authorization)
 * @returns {Promise<{ stateId: string; context: ConversationContext } | null>} The conversation state and context, or null if not found
 * @example
 * const loaded = await loadWebConversationIntoContext("conv-123", "user-456");
 * if (loaded) {
 *   // Continue the conversation
 *   await addWebMessageToContext(loaded.stateId, newMessage, summarizeFn);
 * }
 */
export const loadWebConversationIntoContext = async (
  conversationId: string,
  userId: string
): Promise<{ stateId: string; context: ConversationContext } | null> => {
  const conversation = await getWebConversationById(conversationId, userId);

  if (!conversation) {
    return null;
  }

  return {
    stateId: conversation.id,
    context: {
      messages: conversation.messages,
      summary: conversation.summary,
      lastUpdated: conversation.lastUpdated,
    },
  };
};

/**
 * @description Permanently deletes a conversation and all its messages.
 * First removes all messages associated with the conversation, then deletes
 * the conversation record itself. Validates user ownership before deletion.
 * @param {string} conversationId - The unique identifier of the conversation to delete
 * @param {string} userId - The unique identifier of the user (for authorization)
 * @returns {Promise<boolean>} True if deletion was successful, false if any error occurred
 * @example
 * const deleted = await deleteWebConversation("conv-123", "user-456");
 * if (deleted) {
 *   console.log("Conversation deleted successfully");
 * }
 */
export const deleteWebConversation = async (
  conversationId: string,
  userId: string
): Promise<boolean> => {
  // First delete all messages in the conversation
  const { error: msgError } = await SUPABASE.from("conversation_messages")
    .delete()
    .eq("conversation_id", conversationId);

  if (msgError) {
    logger.error(
      `Failed to delete messages for conversation ${conversationId}: ${msgError.message}`
    );
    return false;
  }

  // Then delete the conversation itself
  const { error } = await SUPABASE.from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId)
    .eq("source", "web");

  if (error) {
    logger.error(
      `Failed to delete conversation ${conversationId}: ${error.message}`
    );
    return false;
  }

  return true;
};
