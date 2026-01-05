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

  if (error) {
    logger.error(`Failed to fetch conversation state for chat ${chatId}: ${error.message}`);
    return null;
  }

  if (!data) return null;

  // Check if the conversation is from today
  const updatedAt = data.updated_at || data.created_at;
  if (!isToday(updatedAt)) {
    return null;
  }

  return data as ConversationStateRow;
};

// Create a new conversation state for today
export const createConversationState = async (chatId: number, userId: number, initialMessage?: userAndAiMessageProps): Promise<ConversationStateRow | null> => {
  // Ensure the user exists first (set both telegram_user_id and chat_id from the start)
  const { error: userError } = await SUPABASE.from("user_telegram_links").upsert(
    { 
      telegram_user_id: userId,
      chat_id: chatId, // In private chats, chat_id === userId
    }, 
    { onConflict: "telegram_user_id" }
  );

  if (userError) {
    logger.error(`Failed to ensure user exists for chat ${chatId}: ${userError.message}`);
    return null;
  }

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
    logger.error(`Failed to create conversation state for chat ${chatId}: ${error.message}`);
    return null;
  }

  return data as ConversationStateRow;
};

// Update conversation state with new messages
export const updateConversationState = async (stateId: number, context: ConversationContext, messageCount: number): Promise<boolean> => {
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

// Store a summary in the database
export const storeSummary = async (chatId: number, userId: number, summaryText: string, messageCount: number): Promise<boolean> => {
  const { error } = await SUPABASE.from(CONVERSATION_SUMMARIES_TABLE).insert({
    chat_id: chatId,
    telegram_user_id: userId,
    summary_text: summaryText,
    message_count: messageCount,
    first_message_id: 0,
    last_message_id: 0,
  });

  if (error) {
    logger.error(`Failed to store summary for chat ${chatId}: ${error.message}`);
    return false;
  }

  return true;
};

// Mark conversation as summarized
export const markAsSummarized = async (stateId: number): Promise<boolean> => {
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

// Get or create today's conversation context (query by chat_id)
export const getOrCreateTodayContext = async (chatId: number, userId: number): Promise<{ stateId: number; context: ConversationContext }> => {
  const existingState = await getTodayConversationState(chatId);

  if (existingState) {
    const context = (existingState.context_window as ConversationContext) || {
      messages: [],
      lastUpdated: new Date().toISOString(),
    };
    return { stateId: existingState.id, context };
  }

  const newState = await createConversationState(chatId, userId);

  if (!newState) {
    logger.warn(`Failed to create conversation state for chat ${chatId}, using fallback`);
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
export const addMessageToContext = async (
  chatId: number,
  userId: number,
  message: userAndAiMessageProps,
  summarizeFn: (messages: userAndAiMessageProps[]) => Promise<string>
): Promise<ConversationContext> => {
  const { stateId, context } = await getOrCreateTodayContext(chatId, userId);

  context.messages.push(message);
  context.lastUpdated = new Date().toISOString();

  // Check if we need to summarize
  const totalLength = calculateContextLength(context.messages);

  if (totalLength > MAX_CONTEXT_LENGTH && context.messages.length > 2) {
    const messagesToSummarize = context.messages.slice(0, -2);
    const recentMessages = context.messages.slice(-2);

    try {
      const summary = await summarizeFn(messagesToSummarize);
      await storeSummary(chatId, userId, summary, messagesToSummarize.length);

      context.summary = context.summary ? `${context.summary}\n\n${summary}` : summary;
      context.messages = recentMessages;

      await markAsSummarized(stateId);
    } catch (error) {
      logger.error(`Failed to summarize conversation for chat ${chatId}: ${error}`);
      // Continue without summarization if it fails
    }
  }

  if (stateId !== -1) {
    await updateConversationState(stateId, context, context.messages.length);
  }

  return context;
};

// Build prompt context from conversation history
export const buildContextPrompt = (context: ConversationContext): string => {
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

// Get full conversation context for a user
export const getConversationContext = async (chatId: number, userId: number): Promise<ConversationContext> => {
  const { context } = await getOrCreateTodayContext(chatId, userId);
  return context;
};
