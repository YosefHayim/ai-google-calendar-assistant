import { SUPABASE } from "@/config/clients/supabase";
import { logger } from "@/utils/logger";
import type { userAndAiMessageProps } from "@/types";

const MAX_CONTEXT_LENGTH = 1000;
const CONVERSATION_STATE_TABLE = "conversation_state";
const CONVERSATION_SUMMARIES_TABLE = "conversation_summaries";

type ConversationContext = {
  messages: userAndAiMessageProps[];
  summary?: string;
  lastUpdated: string;
};

type ConversationStateRow = {
  id: number;
  chat_id: number;
  telegram_user_id: number;
  context_window: ConversationContext | null;
  message_count: number;
  last_message_id: number | null;
  last_summarized_at: string | null;
  metadata: Record<string, unknown> | null;
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

// Fetch today's conversation state for a user (query by chat_id only)
export const getTodayConversationState = async (chatId: number): Promise<ConversationStateRow | null> => {
  const { data, error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  // Check if the conversation is from today
  const updatedAt = data.updated_at || data.created_at;
  if (!isToday(updatedAt)) {
    return null; // Not today's conversation
  }

  return data as ConversationStateRow;
};

// Create a new conversation state for today
export const createConversationState = async (chatId: number, userId: number, initialMessage?: userAndAiMessageProps): Promise<ConversationStateRow | null> => {
  // --- FIX START: Ensure the user exists first ---
  const { error: userError } = await SUPABASE.from("user_telegram_links") // Make sure this matches your user table name exactly
    .upsert({ telegram_user_id: userId }, { onConflict: "telegram_user_id" });

  if (userError) {
    console.error("Error ensuring user exists:", userError);
    // You might want to return null here, or continue and risk the FK error
    return null;
  }
  // --- FIX END ---

  const context: ConversationContext = {
    messages: initialMessage ? [initialMessage] : [],
    lastUpdated: new Date().toISOString(),
  };

  const { data, error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .insert({
      chat_id: chatId,
      telegram_user_id: userId,
      context_window: context,
      message_count: initialMessage ? 1 : 0,
      last_message_id: null,
      last_summarized_at: null,
      metadata: null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating conversation state:", error);
    return null;
  }

  return data as ConversationStateRow;
};

// Update conversation state with new messages
export const updateConversationState = async (stateId: number, context: ConversationContext, messageCount: number): Promise<boolean> => {
  logger.info(`Telegram Bot: Conversation History: Updating conversation state: ${stateId}, ${context.messages.length}, ${messageCount}`);
  const { error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .update({
      context_window: context,
      message_count: messageCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", stateId);

  logger.info(`Telegram Bot: Conversation History: Updating conversation state: ${stateId}, ${context.messages.length}, ${messageCount}`);
  if (error) {
    logger.error(`Telegram Bot: Conversation History: Error updating conversation state: ${stateId}, ${context.messages.length}, ${messageCount}, ${error}`);
    console.error("Error updating conversation state:", error);
    return false;
  }
  logger.info(`Telegram Bot: Conversation History: Conversation state updated: ${stateId}, ${context.messages.length}, ${messageCount}`);
  return true;
};

// Store a summary in the database
export const storeSummary = async (chatId: number, userId: number, summaryText: string, messageCount: number): Promise<boolean> => {
  logger.info(`Telegram Bot: Conversation History: Storing summary: ${chatId}, ${userId}, ${summaryText}, ${messageCount}`);
  const { error } = await SUPABASE.from(CONVERSATION_SUMMARIES_TABLE).insert({
    chat_id: chatId,
    telegram_user_id: userId,
    summary_text: summaryText,
    message_count: messageCount,
    first_message_id: 0,
    last_message_id: 0,
  });

  if (error) {
    logger.error(`Telegram Bot: Conversation History: Error storing summary: ${chatId}, ${userId}, ${summaryText}, ${messageCount}, ${error}`);
    console.error("Error storing summary:", error);
    return false;
  }

  logger.info(`Telegram Bot: Conversation History: Summary stored: ${chatId}, ${userId}, ${summaryText}, ${messageCount}`);
  return true;
};

// Mark conversation as summarized
export const markAsSummarized = async (stateId: number): Promise<boolean> => {
  logger.info(`Telegram Bot: Conversation History: Marking as summarized: ${stateId}`);
  const { error } = await SUPABASE.from(CONVERSATION_STATE_TABLE)
    .update({
      last_summarized_at: new Date().toISOString(),
    })
    .eq("id", stateId);

  if (error) {
    logger.error(`Telegram Bot: Conversation History: Error marking as summarized: ${stateId}, ${error}`);
    console.error("Error marking as summarized:", error);
    return false;
  }

  logger.info(`Telegram Bot: Conversation History: Marked as summarized: ${stateId}`);
  return true;
};

// Get or create today's conversation context (query by chat_id)
export const getOrCreateTodayContext = async (chatId: number, userId: number): Promise<{ stateId: number; context: ConversationContext }> => {
  logger.info(`Telegram Bot: Conversation History: Getting or creating today's context: ${chatId}, ${userId}`);
  // Try to get existing state for today (query by chat_id only)
  const existingState = await getTodayConversationState(chatId);

  if (existingState) {
    const context = (existingState.context_window as ConversationContext) || {
      messages: [],
      lastUpdated: new Date().toISOString(),
    };
    logger.info(`Telegram Bot: Conversation History: Existing state found: ${chatId}, ${userId}, ${existingState.id}`);
    return { stateId: existingState.id, context };
  }

  // Create new state for today (userId needed for insert)
  const newState = await createConversationState(chatId, userId);

  if (!newState) {
    // Fallback to empty context if creation fails
    logger.error(`Telegram Bot: Conversation History: Error creating new state: ${chatId}, ${userId}`);
    return {
      stateId: -1,
      context: { messages: [], lastUpdated: new Date().toISOString() },
    };
  }

  logger.info(`Telegram Bot: Conversation History: New state created: ${chatId}, ${userId}, ${newState.id}`);
  return {
    stateId: newState.id,
    context: { messages: [], lastUpdated: new Date().toISOString() },
  };
};

// Add a message to the conversation and check if summarization is needed
export const addMessageToContext = async (
  chatId: number,
  userId: number,
  message: userAndAiMessageProps,
  summarizeFn: (messages: userAndAiMessageProps[]) => Promise<string>
): Promise<ConversationContext> => {
  logger.info(`Telegram Bot: Conversation History: Adding message to context: ${chatId}, ${userId}, ${message.content}`);
  const { stateId, context } = await getOrCreateTodayContext(chatId, userId);

  // Add new message
  context.messages.push(message);
  logger.info(`Telegram Bot: Conversation History: Message added: ${chatId}, ${userId}, ${message.content}`);
  context.lastUpdated = new Date().toISOString();
  logger.info(`Telegram Bot: Conversation History: Last updated: ${chatId}, ${userId}, ${context.lastUpdated}`);

  // Check if we need to summarize
  const totalLength = calculateContextLength(context.messages);
  logger.info(`Telegram Bot: Conversation History: Total length: ${chatId}, ${userId}, ${totalLength}`);

  if (totalLength > MAX_CONTEXT_LENGTH && context.messages.length > 2) {
    // Summarize older messages, keep the last 2
    const messagesToSummarize = context.messages.slice(0, -2);
    const recentMessages = context.messages.slice(-2);
    logger.info(`Telegram Bot: Conversation History: Recent messages: ${chatId}, ${userId}, ${recentMessages}`);

    try {
      const summary = await summarizeFn(messagesToSummarize);
      logger.info(`Telegram Bot: Conversation History: Summary: ${chatId}, ${userId}, ${summary}`);
      // Store the summary
      await storeSummary(chatId, userId, summary, messagesToSummarize.length);
      logger.info(`Telegram Bot: Conversation History: Summary stored: ${chatId}, ${userId}, ${summary}`);
      // Update context with summary + recent messages
      context.summary = context.summary ? `${context.summary}\n\n${summary}` : summary;
      context.messages = recentMessages;
      logger.info(`Telegram Bot: Conversation History: Context updated: ${chatId}, ${userId}, ${context.messages}`);
      // Mark as summarized
      await markAsSummarized(stateId);
      logger.info(`Telegram Bot: Conversation History: Marked as summarized: ${chatId}, ${userId}, ${stateId}`);
    } catch (error) {
      console.error("Error during summarization:", error);
      // Continue without summarization if it fails
      logger.error(`Telegram Bot: Conversation History: Error during summarization: ${chatId}, ${userId}, ${error}`);
    }
  }

  // Save updated context
  if (stateId !== -1) {
    await updateConversationState(stateId, context, context.messages.length);
    logger.info(`Telegram Bot: Conversation History: Context updated: ${chatId}, ${userId}, ${context.messages}`);
  }

  return context;
};

// Build prompt context from conversation history
export const buildContextPrompt = (context: ConversationContext): string => {
  logger.info(`Telegram Bot: Conversation History: Building context prompt: ${context.summary}, ${context.messages.length}`);
  const parts: string[] = [];

  // Add summary if exists
  if (context.summary) {
    logger.info(`Telegram Bot: Conversation History: Summary: ${context.summary}`);
    parts.push(`Previous conversation summary:\n${context.summary}`);
  }

  // Add recent messages
  if (context.messages.length > 0) {
    logger.info(`Telegram Bot: Conversation History: Recent messages: ${context.messages.length}`);
    const messageHistory = context.messages.map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`).join("\n");
    logger.info(`Telegram Bot: Conversation History: Message history: ${messageHistory}`);
    parts.push(`Recent messages:\n${messageHistory}`);
  }

  return parts.join("\n\n");
};

// Get full conversation context for a user
export const getConversationContext = async (chatId: number, userId: number): Promise<ConversationContext> => {
  logger.info(`Telegram Bot: Conversation History: Getting conversation context: ${chatId}, ${userId}`);
  const { context } = await getOrCreateTodayContext(chatId, userId);
  return context;
};
