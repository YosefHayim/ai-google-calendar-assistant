import type { Database } from "@/database.types";
import { SUPABASE } from "@/config/clients/supabase";
import { logger } from "@/utils/logger";
import type { userAndAiMessageProps } from "@/types";

const MAX_CONTEXT_LENGTH = 1000;

type MessageRole = Database["public"]["Enums"]["message_role"];

type ConversationContext = {
  messages: userAndAiMessageProps[];
  summary?: string;
  lastUpdated: string;
};

type ConversationRow = {
  id: string;
  user_id: string;
  external_chat_id: number | null;
  message_count: number | null;
  summary: string | null;
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

// Get user_id from telegram_users table by telegram_user_id
export const getUserIdFromTelegram = async (telegramUserId: number): Promise<string | null> => {
  const { data, error } = await SUPABASE.from("telegram_users").select("user_id").eq("telegram_user_id", telegramUserId).single();

  if (error || !data?.user_id) {
    return null;
  }

  return data.user_id;
};

// Fetch today's conversation for a telegram user (query by external_chat_id)
export const getTodayConversationState = async (chatId: number): Promise<ConversationRow | null> => {
  const { data, error } = await SUPABASE.from("conversations")
    .select("*")
    .eq("external_chat_id", chatId)
    .eq("source", "telegram")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error(`Failed to fetch conversation for chat ${chatId}: ${error.message}`);
    return null;
  }

  if (!data) return null;

  // Check if the conversation is from today
  const updatedAt = data.updated_at || data.created_at;
  if (!isToday(updatedAt)) {
    return null;
  }

  return data as ConversationRow;
};

// Get messages for a conversation
const getConversationMessages = async (conversationId: string): Promise<userAndAiMessageProps[]> => {
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

// Create a new conversation for today
export const createConversationState = async (
  chatId: number,
  telegramUserId: number,
  initialMessage?: userAndAiMessageProps
): Promise<{ id: string; context: ConversationContext } | null> => {
  // Get the user_id from telegram_users
  const userId = await getUserIdFromTelegram(telegramUserId);

  if (!userId) {
    // Create telegram user entry first if it doesn't exist
    const { data: newTgUser, error: tgError } = await SUPABASE.from("telegram_users")
      .upsert(
        {
          telegram_user_id: telegramUserId,
          telegram_chat_id: chatId,
        },
        { onConflict: "telegram_user_id" }
      )
      .select("user_id")
      .single();

    if (tgError || !newTgUser?.user_id) {
      logger.error(`Failed to ensure telegram user exists for chat ${chatId}: ${tgError?.message}`);
      return null;
    }
  }

  const finalUserId = userId || (await getUserIdFromTelegram(telegramUserId));
  if (!finalUserId) {
    logger.error(`Failed to get user_id for telegram user ${telegramUserId}`);
    return null;
  }

  // Create conversation
  const { data: conversation, error: convError } = await SUPABASE.from("conversations")
    .insert({
      user_id: finalUserId,
      source: "telegram",
      external_chat_id: chatId,
      is_active: true,
      message_count: initialMessage ? 1 : 0,
    })
    .select()
    .single();

  if (convError || !conversation) {
    logger.error(`Failed to create conversation for chat ${chatId}: ${convError?.message}`);
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

// Update conversation with new message count
export const updateConversationState = async (conversationId: string, context: ConversationContext, messageCount: number): Promise<boolean> => {
  const { error } = await SUPABASE.from("conversations")
    .update({
      message_count: messageCount,
      summary: context.summary,
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    logger.error(`Failed to update conversation ${conversationId}: ${error.message}`);
    return false;
  }

  return true;
};

// Store a summary in the database
export const storeSummary = async (
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

// Mark conversation summary updated
export const markAsSummarized = async (conversationId: string, summary: string): Promise<boolean> => {
  const { error } = await SUPABASE.from("conversations")
    .update({
      summary,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  if (error) {
    logger.error(`Failed to update summary for conversation ${conversationId}: ${error.message}`);
    return false;
  }

  return true;
};

// Get or create today's conversation context (query by external_chat_id)
export const getOrCreateTodayContext = async (
  chatId: number,
  telegramUserId: number
): Promise<{ stateId: string; context: ConversationContext; userId?: string }> => {
  const existingConversation = await getTodayConversationState(chatId);

  if (existingConversation) {
    const messages = await getConversationMessages(existingConversation.id);
    const context: ConversationContext = {
      messages,
      summary: existingConversation.summary || undefined,
      lastUpdated: existingConversation.updated_at || existingConversation.created_at,
    };
    return { stateId: existingConversation.id, context, userId: existingConversation.user_id };
  }

  const newState = await createConversationState(chatId, telegramUserId);

  if (!newState) {
    logger.warn(`Failed to create conversation for chat ${chatId}, using fallback`);
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
export const addMessageToContext = async (
  chatId: number,
  telegramUserId: number,
  message: userAndAiMessageProps,
  summarizeFn: (messages: userAndAiMessageProps[]) => Promise<string>
): Promise<ConversationContext> => {
  const { stateId, context, userId } = await getOrCreateTodayContext(chatId, telegramUserId);

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

  if (totalLength > MAX_CONTEXT_LENGTH && context.messages.length > 2 && userId) {
    const messagesToSummarize = context.messages.slice(0, -2);
    const recentMessages = context.messages.slice(-2);

    try {
      const summary = await summarizeFn(messagesToSummarize);

      // Store summary with sequence range
      const firstSeq = nextSequence - context.messages.length + 1;
      const lastSeq = nextSequence - 2;
      await storeSummary(stateId, userId, summary, messagesToSummarize.length, firstSeq, lastSeq);

      context.summary = context.summary ? `${context.summary}\n\n${summary}` : summary;
      context.messages = recentMessages;

      await markAsSummarized(stateId, context.summary);
    } catch (error) {
      logger.error(`Failed to summarize conversation for chat ${chatId}: ${error}`);
      // Continue without summarization if it fails
    }
  }

  await updateConversationState(stateId, context, context.messages.length);

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
export const getConversationContext = async (chatId: number, telegramUserId: number): Promise<ConversationContext> => {
  const { context } = await getOrCreateTodayContext(chatId, telegramUserId);
  return context;
};
