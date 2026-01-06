import { SUPABASE } from "@/config/clients/supabase";
import { logger } from "./logger";
import type { userAndAiMessageProps } from "@/types";
import type { Database } from "@/database.types";

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

// Map message role from our type to database enum
const mapRoleToDb = (role: "user" | "assistant" | "system"): MessageRole => {
  return role as MessageRole;
};

// Get messages for a conversation
const getConversationMessages = async (conversationId: string): Promise<userAndAiMessageProps[]> => {
  const { data, error } = await SUPABASE
    .from("conversation_messages")
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

// Fetch today's conversation state for a web user
export const getWebTodayConversationState = async (userId: string): Promise<WebConversationRow | null> => {
  const { data, error } = await SUPABASE
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .eq("source", "web")
    .eq("is_active", true)
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

  return data as WebConversationRow;
};

// Create a new conversation state for today (web user)
export const createWebConversationState = async (
  userId: string,
  initialMessage?: userAndAiMessageProps
): Promise<{ id: string; context: ConversationContext } | null> => {
  // Create conversation
  const { data: conversation, error: convError } = await SUPABASE
    .from("conversations")
    .insert({
      user_id: userId,
      source: "web",
      is_active: true,
      message_count: initialMessage ? 1 : 0,
    })
    .select()
    .single();

  if (convError || !conversation) {
    logger.error(`Failed to create conversation state for user ${userId}: ${convError?.message}`);
    return null;
  }

  // Add initial message if provided
  if (initialMessage && initialMessage.content) {
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

// Update conversation state with new messages
export const updateWebConversationState = async (
  conversationId: string,
  context: ConversationContext,
  messageCount: number
): Promise<boolean> => {
  const { error } = await SUPABASE
    .from("conversations")
    .update({
      message_count: messageCount,
      summary: context.summary,
      title: context.title,
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    logger.error(`Failed to update conversation state ${conversationId}: ${error.message}`);
    return false;
  }

  return true;
};

// Update conversation title (async, fire-and-forget)
export const updateWebConversationTitle = async (conversationId: string, title: string): Promise<boolean> => {
  const { error } = await SUPABASE
    .from("conversations")
    .update({
      title,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    logger.error(`Failed to update conversation title ${conversationId}: ${error.message}`);
    return false;
  }

  return true;
};

// Store a summary in the database (web user)
export const storeWebSummary = async (
  conversationId: string,
  userId: string,
  summaryText: string,
  messageCount: number,
  firstSequence: number,
  lastSequence: number
): Promise<boolean> => {
  const { error } = await SUPABASE.from("conversation_summaries").insert({
    conversation_id: conversationId,
    user_id: userId,
    summary_text: summaryText,
    message_count: messageCount,
    first_message_sequence: firstSequence,
    last_message_sequence: lastSequence,
  });

  if (error) {
    logger.error(`Failed to store summary for conversation ${conversationId}: ${error.message}`);
    return false;
  }

  return true;
};

// Mark conversation as summarized
export const markWebAsSummarized = async (conversationId: string, summary: string): Promise<boolean> => {
  const { error } = await SUPABASE
    .from("conversations")
    .update({
      summary,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    logger.error(`Failed to mark conversation ${conversationId} as summarized: ${error.message}`);
    return false;
  }

  return true;
};

// Get or create today's conversation context (web user)
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
      lastUpdated: existingConversation.updated_at || existingConversation.created_at,
    };
    return { stateId: existingConversation.id, context };
  }

  const newState = await createWebConversationState(userId);

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
};

// Add a message to the conversation and check if summarization is needed
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
  const { data: lastMsg } = await SUPABASE
    .from("conversation_messages")
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
      await storeWebSummary(stateId, userId, summary, messagesToSummarize.length, firstSeq, lastSeq);

      context.summary = context.summary ? `${context.summary}\n\n${summary}` : summary;
      context.messages = recentMessages;

      await markWebAsSummarized(stateId, context.summary);
    } catch (error) {
      logger.error(`Failed to summarize conversation for user ${userId}: ${error}`);
      // Continue without summarization if it fails
    }
  }

  await updateWebConversationState(stateId, context, context.messages.length);

  return context;
};

// Build prompt context from conversation history
export const buildWebContextPrompt = (context: ConversationContext): string => {
  const parts: string[] = [];

  if (context.summary) {
    parts.push(`Previous conversation summary:\n${context.summary}`);
  }

  if (context.messages.length > 0) {
    const messageHistory = context.messages
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n");
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
  id: string;
  title: string;
  messageCount: number;
  lastUpdated: string;
  createdAt: string;
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

// Get title from conversation
const getConversationTitle = (conversation: WebConversationRow, messages: userAndAiMessageProps[]): string => {
  if (conversation.title) {
    return conversation.title;
  }

  if (conversation.summary) {
    const firstLine = conversation.summary.split("\n")[0].replace(/^[-•*]\s*/, "");
    return firstLine.length > 50 ? `${firstLine.slice(0, 47)}...` : firstLine;
  }

  const firstUserMessage = messages.find((m) => m.role === "user");
  if (firstUserMessage?.content) {
    const content = firstUserMessage.content;
    return content.length > 50 ? `${content.slice(0, 47)}...` : content;
  }

  return "New Conversation";
};

// Get list of user's conversations (for sidebar/list view)
export const getWebConversationList = async (
  userId: string,
  options?: { limit?: number; offset?: number; search?: string }
): Promise<ConversationListItem[]> => {
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;
  const search = options?.search;

  let query = SUPABASE
    .from("conversations")
    .select("id, message_count, title, summary, created_at, updated_at, last_message_at")
    .eq("user_id", userId)
    .eq("source", "web");

  // Add title search filter (case-insensitive) if search is provided and has 2+ characters
  if (search && search.length >= 2) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error(`Failed to fetch conversation list for user ${userId}: ${error.message}`);
    return [];
  }

  return (data || []).map((row) => {
    // Generate title from available data
    let title = row.title || "New Conversation";
    if (!row.title && row.summary) {
      const firstLine = row.summary.split("\n")[0].replace(/^[-•*]\s*/, "");
      title = firstLine.length > 50 ? `${firstLine.slice(0, 47)}...` : firstLine;
    }

    return {
      id: row.id,
      title,
      messageCount: row.message_count || 0,
      lastUpdated: row.last_message_at || row.updated_at || row.created_at,
      createdAt: row.created_at,
    };
  });
};

// Get a specific conversation by ID
export const getWebConversationById = async (
  conversationId: string,
  userId: string
): Promise<FullConversation | null> => {
  const { data, error } = await SUPABASE
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .eq("source", "web")
    .single();

  if (error || !data) {
    logger.error(`Failed to fetch conversation ${conversationId}: ${error?.message}`);
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

// Load a conversation into context (for continuing a conversation)
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

// Delete a conversation
export const deleteWebConversation = async (conversationId: string, userId: string): Promise<boolean> => {
  // First delete all messages in the conversation
  const { error: msgError } = await SUPABASE
    .from("conversation_messages")
    .delete()
    .eq("conversation_id", conversationId);

  if (msgError) {
    logger.error(`Failed to delete messages for conversation ${conversationId}: ${msgError.message}`);
    return false;
  }

  // Then delete the conversation itself
  const { error } = await SUPABASE
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId)
    .eq("source", "web");

  if (error) {
    logger.error(`Failed to delete conversation ${conversationId}: ${error.message}`);
    return false;
  }

  return true;
};
