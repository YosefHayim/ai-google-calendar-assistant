import { CONFIG } from "@/config";
import { MODELS } from "@/config/constants/ai";
import OpenAI from "openai";
import { SUPABASE } from "@/config/clients/supabase";
import { logger } from "@/utils/logger";

const openai = new OpenAI({ apiKey: CONFIG.openAiApiKey });

const EMBEDDING_MODEL = MODELS.TEXT_EMBEDDING_3_SMALL;
const CONVERSATION_EMBEDDINGS_TABLE = "conversation_embeddings";
const SIMILARITY_THRESHOLD = 0.7;
const MAX_RESULTS = 5;
const MAX_SEMANTIC_CONTEXT_LENGTH = 800;

type EmbeddingMetadata = {
  role: "user" | "assistant";
  chatId: number;
  timestamp: string;
};

type SimilarConversation = {
  content: string;
  id: number;
  metadata: EmbeddingMetadata | null;
  similarity: number;
};

// Generate embedding vector for text
export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate embedding for empty text");
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
  });

  const embedding = response.data[0]?.embedding;

  if (!embedding) {
    logger.error(`Telegram Bot: Embeddings: Failed to generate embedding: ${text}`);
    throw new Error("Failed to generate embedding");
  }
  return embedding;
};

// Format embedding array to pgvector string format
const formatEmbeddingForPgVector = (embedding: number[]): string => {
  return `[${embedding.join(",")}]`;
};

// Helper to get user_id from telegram_user_id
const getUserIdFromTelegram = async (telegramUserId: number): Promise<string | null> => {
  const { data, error } = await SUPABASE.from("telegram_users").select("user_id").eq("telegram_user_id", telegramUserId).single();

  if (error || !data?.user_id) {
    return null;
  }

  return data.user_id;
};

// Store conversation embedding in the database
export const storeConversationEmbedding = async (
  chatId: number,
  telegramUserId: number,
  content: string,
  role: "user" | "assistant",
  messageId?: string,
  conversationId?: string
): Promise<boolean> => {
  try {
    // Get user_id from telegram_users table
    const userId = await getUserIdFromTelegram(telegramUserId);
    if (!userId) {
      logger.error(`Telegram Bot: Embeddings: User not found for telegram_user_id=${telegramUserId}`);
      return false;
    }

    const embedding = await generateEmbedding(content);
    const embeddingString = formatEmbeddingForPgVector(embedding);
    const metadata: EmbeddingMetadata = {
      role,
      chatId,
      timestamp: new Date().toISOString(),
    };
    const { error } = await SUPABASE.from(CONVERSATION_EMBEDDINGS_TABLE).insert({
      user_id: userId,
      content,
      embedding: embeddingString,
      message_id: messageId || null,
      conversation_id: conversationId || null,
      metadata,
      source: "telegram",
    });

    if (error) {
      logger.error(
        `Telegram Bot: Embeddings: Error storing conversation embedding: chatId=${chatId}, telegramUserId=${telegramUserId}, role=${role}, messageId=${messageId}, error=${
          error.message || error
        }`
      );
      console.error("Error storing conversation embedding:", error);
      return false;
    }
    return true;
  } catch (error) {
    logger.error(
      `Telegram Bot: Embeddings: Error generating/storing embedding: chatId=${chatId}, telegramUserId=${telegramUserId}, role=${role}, messageId=${messageId}, error=${
        error instanceof Error ? error.message : error
      }`
    );
    console.error("Error generating/storing embedding:", error);
    return false;
  }
};

// Search for similar conversations using vector similarity
export const searchSimilarConversations = async (
  userId: number,
  query: string,
  options?: {
    threshold?: number;
    limit?: number;
  }
): Promise<SimilarConversation[]> => {
  try {
    // 1. Generate the embedding (number[])
    const queryEmbedding = await generateEmbedding(query);
    // 2. Call the RPC function
    // Note: We pass queryEmbedding directly. Supabase converts number[] -> vector automatically.
    const { data, error } = await SUPABASE.rpc("match_conversation_embeddings", {
      query_embedding: formatEmbeddingForPgVector(queryEmbedding),
      match_user_id: userId,
      match_threshold: options?.threshold || SIMILARITY_THRESHOLD,
      match_count: options?.limit || MAX_RESULTS,
    });

    if (error) {
      logger.error(
        `Telegram Bot: Embeddings: Error searching similar conversations: userId=${userId}, queryLength=${query.length}, error=${error.message || error}`
      );
      console.error("Error searching similar conversations:", error);
      return [];
    }
    return (data || []) as SimilarConversation[];
  } catch (error) {
    logger.error(
      `Telegram Bot: Embeddings: Error in similarity search: userId=${userId}, queryLength=${query.length}, error=${
        error instanceof Error ? error.message : error
      }`
    );
    console.error("Error in similarity search:", error);
    return [];
  }
};

export const buildSemanticContext = (conversations: SimilarConversation[]): string => {
  if (conversations.length === 0) {
    return "";
  }

  const sorted = conversations.sort((a, b) => b.similarity - a.similarity);
  const contextParts: string[] = [];
  let totalLength = 0;

  for (const conv of sorted) {
    const role = conv.metadata?.role === "user" ? "User" : "Assistant";
    const similarity = Math.round(conv.similarity * 100);
    const part = `[${similarity}% relevant] ${role}: ${conv.content}`;

    if (totalLength + part.length > MAX_SEMANTIC_CONTEXT_LENGTH) {
      break;
    }

    contextParts.push(part);
    totalLength += part.length + 1;
  }

  if (contextParts.length === 0) {
    return "";
  }

  return `Relevant past conversations:\n${contextParts.join("\n")}`;
};

// Store embedding in background (non-blocking)
export const storeEmbeddingAsync = (
  chatId: number,
  telegramUserId: number,
  content: string,
  role: "user" | "assistant",
  messageId?: string,
  conversationId?: string
): void => {
  // Fire and forget - don't await
  storeConversationEmbedding(chatId, telegramUserId, content, role, messageId, conversationId).catch((error) => {
    logger.error(
      `Telegram Bot: Embeddings: Error storing embedding asynchronously: chatId=${chatId}, telegramUserId=${telegramUserId}, role=${role}, messageId=${messageId}, error=${
        error instanceof Error ? error.message : error
      }`
    );
    console.error("Background embedding storage failed:", error);
  });
};

// Get relevant context for a query
export const getRelevantContext = async (
  userId: number,
  query: string,
  options?: {
    threshold?: number;
    limit?: number;
  }
): Promise<string> => {
  const similarConversations = await searchSimilarConversations(userId, query, options);
  return buildSemanticContext(similarConversations);
};
