import { SUPABASE } from "@/config/clients/supabase";
import { logger } from "./logger";
import type { userAndAiMessageProps } from "@/types";

const MAX_CONTEXT_LENGTH = 1000;
const CONVERSATION_STATE_TABLE = "conversation_state";
const CONVERSATION_SUMMARIES_TABLE = "conversation_summaries";

type ConversationContext = {
  messages: userAndAiMessageProps[];
  summary?: string;
  title?: string;
  lastUpdated: string;
};

type WebConversationStateRow = {
  id: number;
  user_id: string;
  context_window: ConversationContext | null;
  message_count: number;
  last_message_id: number | null;
  last_summarized_at: string | null;
  metadata: Record<string, unknown> | null;
  source: string;
  created_at: string;
  updated_at: string | null;
};

// Get start of day timestamp for comparison
const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Check if a date is from today
const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = getStartOfDay();
  const dateStart = getStartOfDay(date);
  return dateStart.getTime() === today.getTime();
};

// Calculate total text length of messages
const calculateContextLength = (messages: userAndAiMessageProps[]): number => {
  return messages.reduce((total, msg) => total + (msg.content?.length || 0), 0);
};

// Fetch today's conversation state for a web user
export const getWebTodayConversationState = async (userId: string): Promise<WebConversationStateRow | null> => {
  const { data, error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("source", "web")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error(`Failed to fetch conversation state for user ${userId}: ${error.message}`);
    return null;
  }

  if (!data) return null;

  // Check if the conversation is from today
  const updatedAt = data.updated_at || data.created_at;
  if (!isToday(updatedAt)) {
    return null;
  }

  return data as WebConversationStateRow;
};

// Create a new conversation state for today (web user)
export const createWebConversationState = async (userId: string, initialMessage?: userAndAiMessageProps): Promise<WebConversationStateRow | null> => {
  const context: ConversationContext = {
    messages: initialMessage ? [initialMessage] : [],
    lastUpdated: new Date().toISOString(),
  };

  const { data, error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .insert({
      user_id: userId,
      chat_id: null,
      telegram_user_id: null,
      context_window: context,
      message_count: initialMessage ? 1 : 0,
      last_message_id: null,
      last_summarized_at: null,
      metadata: null,
      source: "web",
    })
    .select()
    .single();

  if (error) {
    logger.error(`Failed to create conversation state for user ${userId}: ${error.message}`);
    return null;
  }

  return data as WebConversationStateRow;
};

// Update conversation state with new messages
export const updateWebConversationState = async (stateId: number, context: ConversationContext, messageCount: number): Promise<boolean> => {
  const { error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .update({
      context_window: context,
      message_count: messageCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stateId);

  if (error) {
    logger.error(`Failed to update conversation state ${stateId}: ${error.message}`);
    return false;
  }

  return true;
};

// Update conversation title (async, fire-and-forget)
export const updateWebConversationTitle = async (stateId: number, title: string): Promise<boolean> => {
  const { data, error: fetchError } = await SUPABASE.from(CONVERSATION_STATE_TABLE).select("context_window").eq("id", stateId).single();

  if (fetchError || !data) {
    logger.error(`Failed to fetch conversation ${stateId} for title update: ${fetchError?.message}`);
    return false;
  }

  const context = (data.context_window as ConversationContext) || {
    messages: [],
    lastUpdated: new Date().toISOString(),
  };

  context.title = title;

  const { error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .update({
      context_window: context,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stateId);

  if (error) {
    logger.error(`Failed to update conversation title ${stateId}: ${error.message}`);
    return false;
  }

  return true;
};

// Store a summary in the database (web user)
// Note: For web users, summaries are stored in the context_window of conversation_state table,
// not in conversation_summaries (which has a FK constraint to user_telegram_links for telegram chat_id).
// This function is kept for API compatibility but the actual storage happens via updateWebConversationState.
export const storeWebSummary = async (_userId: string, _summaryText: string, _messageCount: number): Promise<boolean> => {
  // Web summaries are stored in context_window of conversation_state, not in conversation_summaries
  // The conversation_summaries table requires a valid chat_id from user_telegram_links (telegram-only)
  return true;
};

// Mark conversation as summarized
export const markWebAsSummarized = async (stateId: number): Promise<boolean> => {
  const { error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .update({
      last_summarized_at: new Date().toISOString(),
    })
    .eq("id", stateId);

  if (error) {
    logger.error(`Failed to mark conversation ${stateId} as summarized: ${error.message}`);
    return false;
  }

  return true;
};

// Get or create today's conversation context (web user)
export const getOrCreateWebTodayContext = async (userId: string): Promise<{ stateId: number; context: ConversationContext }> => {
  const existingState = await getWebTodayConversationState(userId);

  if (existingState) {
    const context = (existingState.context_window as ConversationContext) || {
      messages: [],
      lastUpdated: new Date().toISOString(),
    };
    return { stateId: existingState.id, context };
  }

  const newState = await createWebConversationState(userId);

  if (!newState) {
    logger.warn(`Failed to create conversation state for user ${userId}, using fallback`);
    return {
      stateId: -1,
      context: { messages: [], lastUpdated: new Date().toISOString() },
    };
  }

  return {
    stateId: newState.id,
    context: { messages: [], lastUpdated: new Date().toISOString() },
  };
};

// Add a message to the conversation and check if summarization is needed
export const addWebMessageToContext = async (
  userId: string,
  message: userAndAiMessageProps,
  summarizeFn: (messages: userAndAiMessageProps[]) => Promise<string>
): Promise<ConversationContext> => {
  const { stateId, context } = await getOrCreateWebTodayContext(userId);

  context.messages.push(message);
  context.lastUpdated = new Date().toISOString();

  // Check if we need to summarize
  const totalLength = calculateContextLength(context.messages);

  if (totalLength > MAX_CONTEXT_LENGTH && context.messages.length > 2) {
    const messagesToSummarize = context.messages.slice(0, -2);
    const recentMessages = context.messages.slice(-2);

    try {
      const summary = await summarizeFn(messagesToSummarize);
      await storeWebSummary(userId, summary, messagesToSummarize.length);

      context.summary = context.summary ? `${context.summary}\n\n${summary}` : summary;
      context.messages = recentMessages;

      await markWebAsSummarized(stateId);
      logger.info(`Summarized ${messagesToSummarize.length} messages for user ${userId}`);
    } catch (error) {
      logger.error(`Failed to summarize conversation for user ${userId}: ${error}`);
      // Continue without summarization if it fails
    }
  }

  if (stateId !== -1) {
    await updateWebConversationState(stateId, context, context.messages.length);
  }

  return context;
};

// Build prompt context from conversation history
export const buildWebContextPrompt = (context: ConversationContext): string => {
  const parts: string[] = [];

  if (context.summary) {
    parts.push(`Previous conversation summary:\n${context.summary}`);
  }

  if (context.messages.length > 0) {
    const messageHistory = context.messages.map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`).join("\n");
    parts.push(`Recent messages:\n${messageHistory}`);
  }

  return parts.join("\n\n");
};

// Get full conversation context for a web user
export const getWebConversationContext = async (userId: string): Promise<ConversationContext> => {
  const { context } = await getOrCreateWebTodayContext(userId);
  return context;
};

// ============================================
// Conversation List & Retrieval Functions
// ============================================

export type ConversationListItem = {
  id: number;
  title: string;
  messageCount: number;
  lastUpdated: string;
  createdAt: string;
};

export type FullConversation = {
  id: number;
  userId: string;
  messages: userAndAiMessageProps[];
  summary?: string;
  messageCount: number;
  lastUpdated: string;
  createdAt: string;
};

// Get title from conversation context (uses AI-generated title if available)
const getConversationTitle = (context: ConversationContext | null): string => {
  if (!context) return "New Conversation";

  if (context.title) {
    return context.title;
  }

  if (context.summary) {
    const firstLine = context.summary.split("\n")[0].replace(/^[-•*]\s*/, "");
    return firstLine.length > 50 ? `${firstLine.slice(0, 47)}...` : firstLine;
  }

  const firstUserMessage = context.messages.find((m) => m.role === "user");
  if (firstUserMessage?.content) {
    const content = firstUserMessage.content;
    return content.length > 50 ? `${content.slice(0, 47)}...` : content;
  }

  return "New Conversation";
};

// Get list of user's conversations (for sidebar/list view)
export const getWebConversationList = async (userId: string, options?: { limit?: number; offset?: number }): Promise<ConversationListItem[]> => {
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  const { data, error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .select("id, context_window, message_count, created_at, updated_at")
    .eq("user_id", userId)
    .eq("source", "web")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error(`Failed to fetch conversation list for user ${userId}: ${error.message}`);
    return [];
  }

  return (data || []).map((row) => {
    const context = row.context_window as ConversationContext | null;
    return {
      id: row.id,
      title: getConversationTitle(context),
      messageCount: row.message_count || 0,
      lastUpdated: row.updated_at || row.created_at,
      createdAt: row.created_at,
    };
  });
};

// Get a specific conversation by ID
export const getWebConversationById = async (conversationId: number, userId: string): Promise<FullConversation | null> => {
  const { data, error } = await SUPABASE.from(CONVERSATION_STATE_TABLE).select("*").eq("id", conversationId).eq("user_id", userId).eq("source", "web").single();

  if (error || !data) {
    logger.error(`Failed to fetch conversation ${conversationId}: ${error?.message}`);
    return null;
  }

  const context = (data.context_window as ConversationContext) || {
    messages: [],
    lastUpdated: data.updated_at || data.created_at,
  };

  return {
    id: data.id,
    userId: data.user_id,
    messages: context.messages || [],
    summary: context.summary,
    messageCount: data.message_count || 0,
    lastUpdated: data.updated_at || data.created_at,
    createdAt: data.created_at,
  };
};

// Load a conversation into context (for continuing a conversation)
export const loadWebConversationIntoContext = async (
  conversationId: number,
  userId: string
): Promise<{ stateId: number; context: ConversationContext } | null> => {
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

// Delete a conversation
export const deleteWebConversation = async (conversationId: number, userId: string): Promise<boolean> => {
  const { error } = await SUPABASE.from(CONVERSATION_STATE_TABLE).delete().eq("id", conversationId).eq("user_id", userId).eq("source", "web");

  if (error) {
    logger.error(`Failed to delete conversation ${conversationId}: ${error.message}`);
    return false;
  }

  return true;
};
