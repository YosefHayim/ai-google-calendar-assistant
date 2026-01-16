import { SUPABASE } from "@/config/clients/supabase";
import type { userAndAiMessageProps } from "@/types";
import { isToday } from "@/utils/date/date-helpers";
import { logger } from "@/utils/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const slackUsersTable = () => (SUPABASE as any).from("slack_users");

const MAX_CONTEXT_LENGTH = 1500;
const MAX_SUMMARY_LENGTH = 1000;
const MAX_MESSAGES_BEFORE_SUMMARIZE = 6;

type ConversationContext = {
  messages: userAndAiMessageProps[];
  summary?: string;
  lastUpdated: string;
};

const calculateContextLength = (messages: userAndAiMessageProps[]): number =>
  messages.reduce((total, msg) => total + (msg.content?.length || 0), 0);

const slackIdToNumber = (slackUserId: string, teamId: string): number => {
  const combined = `${teamId}:${slackUserId}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }
  return Math.abs(hash);
};

export const getUserIdFromSlack = async (
  slackUserId: string
): Promise<string | null> => {
  const { data, error } = await slackUsersTable()
    .select("user_id")
    .eq("slack_user_id", slackUserId)
    .single();

  if (error || !data) {
    return null;
  }

  return (data as { user_id: string }).user_id;
};

export const getTodayConversationState = async (
  slackUserId: string,
  teamId: string
): Promise<{
  id: string;
  user_id: string;
  summary: string | null;
  updated_at: string;
  created_at: string;
} | null> => {
  const chatId = slackIdToNumber(slackUserId, teamId);

  const { data, error } = await SUPABASE.from("conversations")
    .select("id, user_id, summary, updated_at, created_at")
    .eq("external_chat_id", chatId)
    .eq("source", "api")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logger.error(`Failed to fetch Slack conversation: ${error.message}`);
    return null;
  }

  if (!data) {
    return null;
  }

  const updatedAt = data.updated_at || data.created_at;
  if (!isToday(updatedAt)) {
    return null;
  }

  return data;
};

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

  return data
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
};

export const createConversationState = async (
  slackUserId: string,
  teamId: string,
  initialMessage?: userAndAiMessageProps
): Promise<{ id: string; context: ConversationContext } | null> => {
  const userId = await getUserIdFromSlack(slackUserId);

  if (!userId) {
    logger.warn(`No user_id found for Slack user ${slackUserId}`);
    return null;
  }

  const chatId = slackIdToNumber(slackUserId, teamId);

  const { data: conversation, error: convError } = await SUPABASE.from(
    "conversations"
  )
    .insert({
      user_id: userId,
      source: "api",
      external_chat_id: chatId,
      is_active: true,
      message_count: initialMessage ? 1 : 0,
    })
    .select()
    .single();

  if (convError || !conversation) {
    logger.error(`Failed to create Slack conversation: ${convError?.message}`);
    return null;
  }

  if (initialMessage?.content) {
    await SUPABASE.from("conversation_messages").insert({
      conversation_id: conversation.id,
      role: initialMessage.role,
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

export const getOrCreateTodayContext = async (
  slackUserId: string,
  teamId: string
): Promise<{
  stateId: string;
  context: ConversationContext;
  userId?: string;
}> => {
  const existingConversation = await getTodayConversationState(
    slackUserId,
    teamId
  );

  if (existingConversation) {
    const messages = await getConversationMessages(existingConversation.id);
    const context: ConversationContext = {
      messages,
      summary: existingConversation.summary || undefined,
      lastUpdated:
        existingConversation.updated_at || existingConversation.created_at,
    };
    return {
      stateId: existingConversation.id,
      context,
      userId: existingConversation.user_id,
    };
  }

  const newState = await createConversationState(slackUserId, teamId);

  if (!newState) {
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
  slackUserId: string,
  teamId: string,
  message: userAndAiMessageProps,
  summarizeFn: (messages: userAndAiMessageProps[]) => Promise<string>
): Promise<ConversationContext> => {
  const { stateId, context, userId } = await getOrCreateTodayContext(
    slackUserId,
    teamId
  );

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
    await SUPABASE.from("conversation_messages").insert({
      conversation_id: stateId,
      role: message.role,
      content: message.content,
      sequence_number: nextSequence,
    });
  }

  context.messages.push(message);
  context.lastUpdated = new Date().toISOString();

  const totalLength = calculateContextLength(context.messages);
  const shouldSummarize =
    (totalLength > MAX_CONTEXT_LENGTH ||
      context.messages.length > MAX_MESSAGES_BEFORE_SUMMARIZE) &&
    context.messages.length > 2 &&
    userId;

  if (shouldSummarize) {
    const messagesToSummarize = context.messages.slice(0, -2);
    const recentMessages = context.messages.slice(-2);

    try {
      const newSummary = await summarizeFn(messagesToSummarize);
      context.summary = newSummary.slice(0, MAX_SUMMARY_LENGTH);
      context.messages = recentMessages;

      await SUPABASE.from("conversations")
        .update({
          summary: context.summary,
          updated_at: new Date().toISOString(),
        })
        .eq("id", stateId);
    } catch (error) {
      logger.error(`Failed to summarize Slack conversation: ${error}`);
    }
  }

  await SUPABASE.from("conversations")
    .update({
      message_count: nextSequence,
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    })
    .eq("id", stateId);

  return context;
};

const MAX_CONTEXT_PROMPT_LENGTH = 2000;
const MAX_SUMMARY_DISPLAY_LENGTH = 800;
const MAX_MESSAGES_DISPLAY_LENGTH = 1000;

export const buildContextPrompt = (context: ConversationContext): string => {
  const parts: string[] = [];

  if (context.summary) {
    const truncatedSummary =
      context.summary.length > MAX_SUMMARY_DISPLAY_LENGTH
        ? context.summary.slice(-MAX_SUMMARY_DISPLAY_LENGTH)
        : context.summary;
    parts.push(`Previous conversation summary:\n${truncatedSummary}`);
  }

  if (context.messages.length > 0) {
    let messageHistory = context.messages
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n");
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

export const slackConversation = {
  getUserIdFromSlack,
  addMessageToContext,
  buildContextPrompt,
  getOrCreateTodayContext,
};
