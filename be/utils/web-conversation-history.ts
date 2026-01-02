import { SUPABASE } from "@/config/clients/supabase";
import type { userAndAiMessageProps } from "@/types";

const MAX_CONTEXT_LENGTH = 1000;
const CONVERSATION_STATE_TABLE = "conversation_state";
const CONVERSATION_SUMMARIES_TABLE = "conversation_summaries";

type ConversationContext = {
  messages: userAndAiMessageProps[];
  summary?: string;
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

  if (error || !data) {
    return null;
  }

  // Check if the conversation is from today
  const updatedAt = data.updated_at || data.created_at;
  if (!isToday(updatedAt)) {
    return null; // Not today's conversation
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
    console.error("Error creating web conversation state:", error);
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
    console.error("Error updating web conversation state:", error);
    return false;
  }

  return true;
};

// Store a summary in the database (web user)
export const storeWebSummary = async (userId: string, summaryText: string, messageCount: number): Promise<boolean> => {
  const { error } = await SUPABASE.from(CONVERSATION_SUMMARIES_TABLE).insert({
    chat_id: 0, // Required field, use 0 for web
    user_id: userId,
    telegram_user_id: null,
    summary_text: summaryText,
    message_count: messageCount,
    first_message_id: 0,
    last_message_id: 0,
    source: "web",
  });

  if (error) {
    console.error("Error storing web summary:", error);
    return false;
  }

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
    console.error("Error marking web conversation as summarized:", error);
    return false;
  }

  return true;
};

// Get or create today's conversation context (web user)
export const getOrCreateWebTodayContext = async (userId: string): Promise<{ stateId: number; context: ConversationContext }> => {
  // Try to get existing state for today
  const existingState = await getWebTodayConversationState(userId);

  if (existingState) {
    const context = (existingState.context_window as ConversationContext) || {
      messages: [],
      lastUpdated: new Date().toISOString(),
    };
    return { stateId: existingState.id, context };
  }

  // Create new state for today
  const newState = await createWebConversationState(userId);

  if (!newState) {
    // Fallback to empty context if creation fails
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

  // Add new message
  context.messages.push(message);
  context.lastUpdated = new Date().toISOString();

  // Check if we need to summarize
  const totalLength = calculateContextLength(context.messages);

  if (totalLength > MAX_CONTEXT_LENGTH && context.messages.length > 2) {
    // Summarize older messages, keep the last 2
    const messagesToSummarize = context.messages.slice(0, -2);
    const recentMessages = context.messages.slice(-2);

    try {
      const summary = await summarizeFn(messagesToSummarize);

      // Store the summary
      await storeWebSummary(userId, summary, messagesToSummarize.length);

      // Update context with summary + recent messages
      context.summary = context.summary ? `${context.summary}\n\n${summary}` : summary;
      context.messages = recentMessages;

      // Mark as summarized
      await markWebAsSummarized(stateId);
    } catch (error) {
      console.error("Error during web summarization:", error);
      // Continue without summarization if it fails
    }
  }

  // Save updated context
  if (stateId !== -1) {
    await updateWebConversationState(stateId, context, context.messages.length);
  }

  return context;
};

// Build prompt context from conversation history
export const buildWebContextPrompt = (context: ConversationContext): string => {
  const parts: string[] = [];

  // Add summary if exists
  if (context.summary) {
    parts.push(`Previous conversation summary:\n${context.summary}`);
  }

  // Add recent messages
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
