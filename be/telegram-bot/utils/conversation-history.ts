import type { Database } from "@/database.types";
import { SUPABASE } from "@/config/clients/supabase";
import { logger } from "@/utils/logger";
import type { userAndAiMessageProps } from "@/types";
import { getStartOfDay, isToday } from "@/utils/date/date-helpers";

const MAX_CONTEXT_LENGTH = 1500;
const MAX_SUMMARY_LENGTH = 1000;
const MAX_MESSAGES_BEFORE_SUMMARIZE = 6;

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

const calculateContextLength = (messages: userAndAiMessageProps[]): number => {
  return messages.reduce((total, msg) => total + (msg.content?.length || 0), 0);
};

const mapRoleToDb = (role: "user" | "assistant" | "system"): MessageRole => {
  return role as MessageRole;
};

const condenseSummary = async (
  existingSummary: string,
  newSummary: string,
  summarizeFn: (messages: userAndAiMessageProps[]) => Promise<string>
): Promise<string> => {
  const combined = `${existingSummary}\n\n${newSummary}`;

  if (combined.length <= MAX_SUMMARY_LENGTH) {
    return combined;
  }

  try {
    const condensedSummary = await summarizeFn([
      { role: "user", content: `Please condense this conversation summary:\n${combined}` },
    ]);
    return condensedSummary.slice(0, MAX_SUMMARY_LENGTH);
  } catch {
    return combined.slice(-MAX_SUMMARY_LENGTH);
  }
};

export const getUserIdFromTelegram = async (telegramUserId: number): Promise<string | null> => {
  const { data, error } = await SUPABASE.from("telegram_users").select("user_id").eq("telegram_user_id", telegramUserId).single();

  if (error || !data?.user_id) {
    return null;
  }

  return data.user_id;
};

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

  const updatedAt = data.updated_at || data.created_at;
  if (!isToday(updatedAt)) {
    return null;
  }

  return data as ConversationRow;
};

const getConversationMessages = async (conversationId: string): Promise<userAndAiMessageProps[]> => {
  const { data, error } = await SUPABASE.from("conversation_messages")
    .select("role, content, sequence_number")
    .eq("conversation_id", conversationId)
    .order("sequence_number", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
};

export const createConversationState = async (
  chatId: number,
  telegramUserId: number,
  initialMessage?: userAndAiMessageProps
): Promise<{ id: string; context: ConversationContext } | null> => {
  const userId = await getUserIdFromTelegram(telegramUserId);

  if (!userId) {
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

// Summary is now stored directly in conversations.summary column
export const storeSummary = async (
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
    logger.error(`Failed to store summary for conversation ${conversationId}: ${error.message}`);
    return false;
  }

  return true;
};

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

export const addMessageToContext = async (
  chatId: number,
  telegramUserId: number,
  message: userAndAiMessageProps,
  summarizeFn: (messages: userAndAiMessageProps[]) => Promise<string>
): Promise<ConversationContext> => {
  const { stateId, context, userId } = await getOrCreateTodayContext(chatId, telegramUserId);

  if (!stateId) {
    context.messages.push(message);
    context.lastUpdated = new Date().toISOString();
    return context;
  }

  const { data: lastMsg } = await SUPABASE.from("conversation_messages")
    .select("sequence_number")
    .eq("conversation_id", stateId)
    .order("sequence_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSequence = (lastMsg?.sequence_number || 0) + 1;

  if (message.content) {
    const { error: insertError } = await SUPABASE.from("conversation_messages").insert({
      conversation_id: stateId,
      role: mapRoleToDb(message.role),
      content: message.content,
      sequence_number: nextSequence,
    });

    if (insertError) {
      logger.error(`Failed to insert message for conversation ${stateId}: ${insertError.message}`);
    }
  }

  context.messages.push(message);
  context.lastUpdated = new Date().toISOString();

  const totalLength = calculateContextLength(context.messages);
  const shouldSummarize =
    (totalLength > MAX_CONTEXT_LENGTH || context.messages.length > MAX_MESSAGES_BEFORE_SUMMARIZE) &&
    context.messages.length > 2 &&
    userId;

  if (shouldSummarize) {
    const messagesToSummarize = context.messages.slice(0, -2);
    const recentMessages = context.messages.slice(-2);

    try {
      const newSummary = await summarizeFn(messagesToSummarize);

      const firstSeq = nextSequence - context.messages.length + 1;
      const lastSeq = nextSequence - 2;
      await storeSummary(stateId, userId, newSummary, messagesToSummarize.length, firstSeq, lastSeq);

      if (context.summary) {
        context.summary = await condenseSummary(context.summary, newSummary, summarizeFn);
      } else {
        context.summary = newSummary.slice(0, MAX_SUMMARY_LENGTH);
      }

      context.messages = recentMessages;

      await markAsSummarized(stateId, context.summary);
    } catch (error) {
      logger.error(`Failed to summarize conversation for chat ${chatId}: ${error}`);
    }
  }

  // Use nextSequence as the actual message count (represents total messages in DB)
  // Not context.messages.length which can be reduced after summarization
  await updateConversationState(stateId, context, nextSequence);

  return context;
};

const MAX_CONTEXT_PROMPT_LENGTH = 2000;
const MAX_SUMMARY_DISPLAY_LENGTH = 800;
const MAX_MESSAGES_DISPLAY_LENGTH = 1000;

export const buildContextPrompt = (context: ConversationContext): string => {
  const parts: string[] = [];

  if (context.summary) {
    const truncatedSummary = context.summary.length > MAX_SUMMARY_DISPLAY_LENGTH 
      ? context.summary.slice(-MAX_SUMMARY_DISPLAY_LENGTH) 
      : context.summary;
    parts.push(`Previous conversation summary:\n${truncatedSummary}`);
  }

  if (context.messages.length > 0) {
    let messageHistory = context.messages.map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`).join("\n");
    if (messageHistory.length > MAX_MESSAGES_DISPLAY_LENGTH) {
      messageHistory = messageHistory.slice(-MAX_MESSAGES_DISPLAY_LENGTH);
    }
    parts.push(`Recent messages:\n${messageHistory}`);
  }

  const result = parts.join("\n\n");
  
  if (result.length > MAX_CONTEXT_PROMPT_LENGTH) {
    return result.slice(-MAX_CONTEXT_PROMPT_LENGTH);
  }
  
  return result;
};

export const getConversationContext = async (chatId: number, telegramUserId: number): Promise<ConversationContext> => {
  const { context } = await getOrCreateTodayContext(chatId, telegramUserId);
  return context;
};
