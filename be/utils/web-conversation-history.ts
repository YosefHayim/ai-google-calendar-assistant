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
  logger.info(`Web Conversation History: getStartOfDay called: date: ${date}`);
  const start = new Date(date);
  logger.info(`Web Conversation History: getStartOfDay called: start: ${start}`);
  start.setHours(0, 0, 0, 0);
  logger.info(`Web Conversation History: getStartOfDay called: start: ${start}`);
  return start;
};

// Check if a date is from today
const isToday = (dateString: string): boolean => {
  logger.info(`Web Conversation History: isToday called: dateString: ${dateString}`);
  const date = new Date(dateString);
  logger.info(`Web Conversation History: isToday called: date: ${date}`);
  const today = getStartOfDay();
  logger.info(`Web Conversation History: isToday called: today: ${today}`);
  const dateStart = getStartOfDay(date);
  logger.info(`Web Conversation History: isToday called: dateStart: ${dateStart}`);
  return dateStart.getTime() === today.getTime();
};

// Calculate total text length of messages
const calculateContextLength = (messages: userAndAiMessageProps[]): number => {
  logger.info(`Web Conversation History: calculateContextLength called: messages: ${messages}`);
  const total = messages.reduce((total, msg) => total + (msg.content?.length || 0), 0);
  logger.info(`Web Conversation History: calculateContextLength called: total: ${total}`);
  return total;
};

// Fetch today's conversation state for a web user
export const getWebTodayConversationState = async (userId: string): Promise<WebConversationStateRow | null> => {
  logger.info(`Web Conversation History: getWebTodayConversationState called: userId: ${userId}`);
  const { data, error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .select("*")
    .eq("user_id", userId)
    .eq("source", "web")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    logger.info(`Web Conversation History: getWebTodayConversationState called: error: ${error}`);
    return null;
  }

  // Check if the conversation is from today
  const updatedAt = data.updated_at || data.created_at;
  if (!isToday(updatedAt)) {
    logger.info(`Web Conversation History: getWebTodayConversationState called: not today's conversation`);
    return null; // Not today's conversation
  }

  logger.info(`Web Conversation History: getWebTodayConversationState called: data: ${data}`);
  return data as WebConversationStateRow;
};

// Create a new conversation state for today (web user)
export const createWebConversationState = async (userId: string, initialMessage?: userAndAiMessageProps): Promise<WebConversationStateRow | null> => {
  logger.info(`Web Conversation History: createWebConversationState called: userId: ${userId}`);
  logger.info(`Web Conversation History: createWebConversationState called: initialMessage: ${initialMessage}`);
  const context: ConversationContext = {
    messages: initialMessage ? [initialMessage] : [],
    lastUpdated: new Date().toISOString(),
  };
  logger.info(`Web Conversation History: createWebConversationState called: context: ${context}`);
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
  logger.info(`Web Conversation History: createWebConversationState called: data: ${data}`);
  logger.info(`Web Conversation History: createWebConversationState called: error: ${error}`);
  if (error) {
    console.error("Error creating web conversation state:", error);
    logger.error(`Web Conversation History: createWebConversationState called: error: ${error}`);
    return null;
  }

  logger.info(`Web Conversation History: createWebConversationState called: data: ${data}`);
  return data as WebConversationStateRow;
};

// Update conversation state with new messages
export const updateWebConversationState = async (stateId: number, context: ConversationContext, messageCount: number): Promise<boolean> => {
  logger.info(`Web Conversation History: updateWebConversationState called: stateId: ${stateId}`);
  logger.info(`Web Conversation History: updateWebConversationState called: context: ${context}`);
  logger.info(`Web Conversation History: updateWebConversationState called: messageCount: ${messageCount}`);
  const { error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .update({
      context_window: context,
      message_count: messageCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stateId);
  logger.info(`Web Conversation History: updateWebConversationState called: error: ${error}`);
  if (error) {
    console.error("Error updating web conversation state:", error);
    logger.error(`Web Conversation History: updateWebConversationState called: error: ${error}`);
    return false;
  }

  logger.info(`Web Conversation History: updateWebConversationState called: true`);
  return true;
};

// Update conversation title (async, fire-and-forget)
export const updateWebConversationTitle = async (stateId: number, title: string): Promise<boolean> => {
  logger.info(`Web Conversation History: updateWebConversationTitle called: stateId: ${stateId}`);
  logger.info(`Web Conversation History: updateWebConversationTitle called: title: ${title}`);
  // First get current context
  const { data, error: fetchError } = await SUPABASE.from(CONVERSATION_STATE_TABLE).select("context_window").eq("id", stateId).single();
  logger.info(`Web Conversation History: updateWebConversationTitle called: data: ${data}`);
  logger.info(`Web Conversation History: updateWebConversationTitle called: fetchError: ${fetchError}`);
  if (fetchError || !data) {
    console.error("Error fetching conversation for title update:", fetchError);
    logger.error(`Web Conversation History: updateWebConversationTitle called: fetchError: ${fetchError}`);
    return false;
  }

  const context = (data.context_window as ConversationContext) || {
    messages: [],
    lastUpdated: new Date().toISOString(),
  };
  logger.info(`Web Conversation History: updateWebConversationTitle called: context: ${context}`);
  // Add title to context
  context.title = title;
  logger.info(`Web Conversation History: updateWebConversationTitle called: context: ${context}`);
  const { error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .update({
      context_window: context,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stateId);
  logger.info(`Web Conversation History: updateWebConversationTitle called: error: ${error}`);
  if (error) {
    console.error("Error updating web conversation title:", error);
    logger.error(`Web Conversation History: updateWebConversationTitle called: error: ${error}`);
    return false;
  }

  logger.info(`Web Conversation History: updateWebConversationTitle called: true`);
  return true;
};

// Store a summary in the database (web user)
// Note: For web users, summaries are stored in the context_window of conversation_state table,
// not in conversation_summaries (which has a FK constraint to user_telegram_links for telegram chat_id).
// This function is kept for API compatibility but the actual storage happens via updateWebConversationState.
export const storeWebSummary = async (_userId: string, _summaryText: string, _messageCount: number): Promise<boolean> => {
  // Web summaries are stored in context_window of conversation_state, not in conversation_summaries
  // The conversation_summaries table requires a valid chat_id from user_telegram_links (telegram-only)
  logger.info(`Web Conversation History: storeWebSummary called: _userId: ${_userId}`);
  logger.info(`Web Conversation History: storeWebSummary called: _summaryText: ${_summaryText}`);
  logger.info(`Web Conversation History: storeWebSummary called: _messageCount: ${_messageCount}`);
  logger.info(`Web Conversation History: storeWebSummary called: true`);
  return true;
};

// Mark conversation as summarized
export const markWebAsSummarized = async (stateId: number): Promise<boolean> => {
  logger.info(`Web Conversation History: markWebAsSummarized called: stateId: ${stateId}`);
  const { error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .update({
      last_summarized_at: new Date().toISOString(),
    })
    .eq("id", stateId);
  logger.info(`Web Conversation History: markWebAsSummarized called: error: ${error}`);
  if (error) {
    console.error("Error marking web conversation as summarized:", error);
    logger.error(`Web Conversation History: markWebAsSummarized called: error: ${error}`);
    return false;
  }

  logger.info(`Web Conversation History: markWebAsSummarized called: true`);
  return true;
};

// Get or create today's conversation context (web user)
export const getOrCreateWebTodayContext = async (userId: string): Promise<{ stateId: number; context: ConversationContext }> => {
  logger.info(`Web Conversation History: getOrCreateWebTodayContext called: userId: ${userId}`);
  // Try to get existing state for today
  const existingState = await getWebTodayConversationState(userId);
  logger.info(`Web Conversation History: getOrCreateWebTodayContext called: existingState: ${existingState}`);
  if (existingState) {
    const context = (existingState.context_window as ConversationContext) || {
      messages: [],
      lastUpdated: new Date().toISOString(),
    };
    logger.info(`Web Conversation History: getOrCreateWebTodayContext called: context: ${context}`);
    return { stateId: existingState.id, context };
  }

  // Create new state for today
  const newState = await createWebConversationState(userId);
  logger.info(`Web Conversation History: getOrCreateWebTodayContext called: newState: ${newState}`);
  if (!newState) {
    // Fallback to empty context if creation fails
    logger.error(`Web Conversation History: getOrCreateWebTodayContext called: newState: ${newState}`);
    return {
      stateId: -1,
      context: { messages: [], lastUpdated: new Date().toISOString() },
    };
  }

  logger.info(`Web Conversation History: getOrCreateWebTodayContext called: newState: ${newState}`);
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
  logger.info(`Web Conversation History: addWebMessageToContext called: userId: ${userId}`);
  logger.info(`Web Conversation History: addWebMessageToContext called: message: ${message}`);
  logger.info(`Web Conversation History: addWebMessageToContext called: summarizeFn: ${summarizeFn}`);
  const { stateId, context } = await getOrCreateWebTodayContext(userId);
  logger.info(`Web Conversation History: addWebMessageToContext called: stateId: ${stateId}`);
  logger.info(`Web Conversation History: addWebMessageToContext called: context: ${context}`);

  // Add new message
  context.messages.push(message);
  context.lastUpdated = new Date().toISOString();
  logger.info(`Web Conversation History: addWebMessageToContext called: context: ${context}`);
  // Check if we need to summarize
  const totalLength = calculateContextLength(context.messages);
  logger.info(`Web Conversation History: addWebMessageToContext called: totalLength: ${totalLength}`);
  if (totalLength > MAX_CONTEXT_LENGTH && context.messages.length > 2) {
    // Summarize older messages, keep the last 2
    const messagesToSummarize = context.messages.slice(0, -2);
    const recentMessages = context.messages.slice(-2);
    logger.info(`Web Conversation History: addWebMessageToContext called: messagesToSummarize: ${messagesToSummarize}`);
    logger.info(`Web Conversation History: addWebMessageToContext called: recentMessages: ${recentMessages}`);
    try {
      const summary = await summarizeFn(messagesToSummarize);
      logger.info(`Web Conversation History: addWebMessageToContext called: summary: ${summary}`);
      // Store the summary
      await storeWebSummary(userId, summary, messagesToSummarize.length);
      logger.info(`Web Conversation History: addWebMessageToContext called: summary stored`);
      // Update context with summary + recent messages
      context.summary = context.summary ? `${context.summary}\n\n${summary}` : summary;
      context.messages = recentMessages;
      logger.info(`Web Conversation History: addWebMessageToContext called: context: ${context}`);
      // Mark as summarized
      await markWebAsSummarized(stateId);
      logger.info(`Web Conversation History: addWebMessageToContext called: marked as summarized`);
    } catch (error) {
      logger.error(`Web Conversation History: addWebMessageToContext called: error: ${error}`);
      console.error("Error during web summarization:", error);
      // Continue without summarization if it fails
    }
  }

  // Save updated context
  if (stateId !== -1) {
    await updateWebConversationState(stateId, context, context.messages.length);
    logger.info(`Web Conversation History: addWebMessageToContext called: context updated`);
  }

  logger.info(`Web Conversation History: addWebMessageToContext called: context: ${context}`);
  return context;
};

// Build prompt context from conversation history
export const buildWebContextPrompt = (context: ConversationContext): string => {
  logger.info(`Web Conversation History: buildWebContextPrompt called: context: ${context}`);
  const parts: string[] = [];

  // Add summary if exists
  if (context.summary) {
    parts.push(`Previous conversation summary:\n${context.summary}`);
  }
  logger.info(`Web Conversation History: buildWebContextPrompt called: parts: ${parts}`);
  // Add recent messages
  if (context.messages.length > 0) {
    const messageHistory = context.messages.map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`).join("\n");
    parts.push(`Recent messages:\n${messageHistory}`);
  }
  logger.info(`Web Conversation History: buildWebContextPrompt called: parts: ${parts}`);
  return parts.join("\n\n");
};

// Get full conversation context for a web user
export const getWebConversationContext = async (userId: string): Promise<ConversationContext> => {
  logger.info(`Web Conversation History: getWebConversationContext called: userId: ${userId}`);
  const { context } = await getOrCreateWebTodayContext(userId);
  logger.info(`Web Conversation History: getWebConversationContext called: context: ${context}`);
  return context;
};

// ============================================
// Conversation List & Retrieval Functions
// ============================================

export type ConversationListItem = {
  id: number;
  title: string; // Summary or first message preview
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

  // Use stored AI-generated title if available
  if (context.title) {
    return context.title;
  }

  // Fallback: If there's a summary, use first line or truncate
  if (context.summary) {
    const firstLine = context.summary.split("\n")[0].replace(/^[-•*]\s*/, "");
    return firstLine.length > 50 ? `${firstLine.slice(0, 47)}...` : firstLine;
  }

  // Otherwise use first user message
  const firstUserMessage = context.messages.find((m) => m.role === "user");
  if (firstUserMessage?.content) {
    const content = firstUserMessage.content;
    return content.length > 50 ? `${content.slice(0, 47)}...` : content;
  }

  return "New Conversation";
};

// Get list of user's conversations (for sidebar/list view)
export const getWebConversationList = async (userId: string, options?: { limit?: number; offset?: number }): Promise<ConversationListItem[]> => {
  logger.info(`Web Conversation History: getWebConversationList called: userId: ${userId}`);
  logger.info(`Web Conversation History: getWebConversationList called: options: ${options}`);
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  const { data, error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .select("id, context_window, message_count, created_at, updated_at")
    .eq("user_id", userId)
    .eq("source", "web")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);
  logger.info(`Web Conversation History: getWebConversationList called: data: ${data}`);
  logger.info(`Web Conversation History: getWebConversationList called: error: ${error}`);
  if (error) {
    console.error("Error fetching web conversations:", error);
    logger.error(`Web Conversation History: getWebConversationList called: error: ${error}`);
    return [];
  }

  logger.info(`Web Conversation History: getWebConversationList called: data: ${data}`);
  return (data || []).map((row) => {
    const context = row.context_window as ConversationContext | null;
    logger.info(`Web Conversation History: getWebConversationList called: context: ${context}`);
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
  logger.info(`Web Conversation History: getWebConversationById called: conversationId: ${conversationId}`);
  logger.info(`Web Conversation History: getWebConversationById called: userId: ${userId}`);
  const { data, error } = await SUPABASE.from(CONVERSATION_STATE_TABLE).select("*").eq("id", conversationId).eq("user_id", userId).eq("source", "web").single();
  logger.info(`Web Conversation History: getWebConversationById called: data: ${data}`);
  logger.info(`Web Conversation History: getWebConversationById called: error: ${error}`);
  if (error || !data) {
    console.error("Error fetching web conversation:", error);
    logger.error(`Web Conversation History: getWebConversationById called: error: ${error}`);
    return null;
  }

  const context = (data.context_window as ConversationContext) || {
    messages: [],
    lastUpdated: data.updated_at || data.created_at,
  };
  logger.info(`Web Conversation History: getWebConversationById called: context: ${context}`);
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
  logger.info(`Web Conversation History: loadWebConversationIntoContext called: conversationId: ${conversationId}`);
  logger.info(`Web Conversation History: loadWebConversationIntoContext called: userId: ${userId}`);
  const conversation = await getWebConversationById(conversationId, userId);
  logger.info(`Web Conversation History: loadWebConversationIntoContext called: conversation: ${conversation}`);

  if (!conversation) {
    logger.error(`Web Conversation History: loadWebConversationIntoContext called: conversation not found`);
    return null;
  }

  logger.info(`Web Conversation History: loadWebConversationIntoContext called: conversation: ${conversation}`);
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
  logger.info(`Web Conversation History: deleteWebConversation called: conversationId: ${conversationId}`);
  logger.info(`Web Conversation History: deleteWebConversation called: userId: ${userId}`);
  const { error } = await SUPABASE.from(CONVERSATION_STATE_TABLE).delete().eq("id", conversationId).eq("user_id", userId).eq("source", "web");
  logger.info(`Web Conversation History: deleteWebConversation called: error: ${error}`);

  if (error) {
    console.error("Error deleting web conversation:", error);
    logger.error(`Web Conversation History: deleteWebConversation called: error: ${error}`);
    return false;
  }

  logger.info(`Web Conversation History: deleteWebConversation called: true`);
  return true;
};
