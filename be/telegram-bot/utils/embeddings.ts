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
  logger.info(`Telegram Bot: Embeddings: Generating embedding: ${text}`);
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot generate embedding for empty text");
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
  });

  logger.info(`Telegram Bot: Embeddings: Response received (dimensions: ${response.data[0]?.embedding?.length || 0})`);

  const embedding = response.data[0]?.embedding;
  logger.info(`Telegram Bot: Embeddings: Embedding generated for text (length: ${text.length} chars)`);

  if (!embedding) {
    logger.error(`Telegram Bot: Embeddings: Failed to generate embedding: ${text}`);
    throw new Error("Failed to generate embedding");
  }

  logger.info(`Telegram Bot: Embeddings: Embedding returned: ${text}`);
  return embedding;
};

// Format embedding array to pgvector string format
const formatEmbeddingForPgVector = (embedding: number[]): string => {
  logger.info(`Telegram Bot: Embeddings: Formatting embedding (dimensions: ${embedding.length})`);
  return `[${embedding.join(",")}]`;
};

// Store conversation embedding in the database
export const storeConversationEmbedding = async (
  chatId: number,
  userId: number,
  content: string,
  role: "user" | "assistant",
  messageId?: number
): Promise<boolean> => {
  try {
    logger.info(`Telegram Bot: Embeddings: Storing conversation embedding: chatId=${chatId}, userId=${userId}, role=${role}, messageId=${messageId}, contentLength=${content.length}`);
    const embedding = await generateEmbedding(content);
    const embeddingString = formatEmbeddingForPgVector(embedding);
    logger.info(`Telegram Bot: Embeddings: Embedding string formatted (length: ${embeddingString.length} chars)`);
    const metadata: EmbeddingMetadata = {
      role,
      chatId,
      timestamp: new Date().toISOString(),
    };
    logger.info(`Telegram Bot: Embeddings: Metadata: role=${metadata.role}, chatId=${metadata.chatId}, timestamp=${metadata.timestamp}`);
    const { error } = await SUPABASE.from(CONVERSATION_EMBEDDINGS_TABLE).insert({
      chat_id: chatId,
      user_id: null,
      content,
      embedding: embeddingString,
      message_id: messageId || null,
      metadata,
    });

    if (error) {
      logger.error(`Telegram Bot: Embeddings: Error storing conversation embedding: chatId=${chatId}, userId=${userId}, role=${role}, messageId=${messageId}, error=${error.message || error}`);
      console.error("Error storing conversation embedding:", error);
      return false;
    }

    logger.info(`Telegram Bot: Embeddings: Conversation embedding stored: chatId=${chatId}, userId=${userId}, role=${role}, messageId=${messageId}`);
    return true;
  } catch (error) {
    logger.error(`Telegram Bot: Embeddings: Error generating/storing embedding: chatId=${chatId}, userId=${userId}, role=${role}, messageId=${messageId}, error=${error instanceof Error ? error.message : error}`);
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
    logger.info(`Telegram Bot: Embeddings: Searching similar conversations: userId=${userId}, queryLength=${query.length}, threshold=${options?.threshold}, limit=${options?.limit}`);
    // 1. Generate the embedding (number[])
    const queryEmbedding = await generateEmbedding(query);
    logger.info(`Telegram Bot: Embeddings: Query embedding generated (dimensions: ${queryEmbedding.length})`);
    // 2. Call the RPC function
    // Note: We pass queryEmbedding directly. Supabase converts number[] -> vector automatically.
    const { data, error } = await SUPABASE.rpc("match_conversation_embeddings", {
      query_embedding: formatEmbeddingForPgVector(queryEmbedding),
      match_user_id: userId,
      match_threshold: options?.threshold || SIMILARITY_THRESHOLD,
      match_count: options?.limit || MAX_RESULTS,
    });

    if (error) {
      logger.error(`Telegram Bot: Embeddings: Error searching similar conversations: userId=${userId}, queryLength=${query.length}, error=${error.message || error}`);
      console.error("Error searching similar conversations:", error);
      return [];
    }

    logger.info(`Telegram Bot: Embeddings: Similar conversations found: count=${data?.length || 0}`);
    return (data || []) as SimilarConversation[];
  } catch (error) {
    logger.error(`Telegram Bot: Embeddings: Error in similarity search: userId=${userId}, queryLength=${query.length}, error=${error instanceof Error ? error.message : error}`);
    console.error("Error in similarity search:", error);
    return [];
  }
};

// Build context from similar conversations
export const buildSemanticContext = (conversations: SimilarConversation[]): string => {
  logger.info(`Telegram Bot: Embeddings: Building semantic context: count=${conversations.length}`);
  if (conversations.length === 0) {
    logger.info(`Telegram Bot: Embeddings: No similar conversations found`);
    return "";
  }

  const contextParts = conversations
    .sort((a, b) => b.similarity - a.similarity)
    .map((conv) => {
      const role = conv.metadata?.role === "user" ? "User" : "Assistant";
      const similarity = Math.round(conv.similarity * 100);
      return `[${similarity}% relevant] ${role}: ${conv.content}`;
    });

  logger.info(`Telegram Bot: Embeddings: Semantic context built: parts=${contextParts.length}, totalLength=${contextParts.join("\n").length} chars`);
  return `Relevant past conversations:\n${contextParts.join("\n")}`;
};

// Store embedding in background (non-blocking)
export const storeEmbeddingAsync = (chatId: number, userId: number, content: string, role: "user" | "assistant", messageId?: number): void => {
  logger.info(`Telegram Bot: Embeddings: Storing embedding asynchronously: chatId=${chatId}, userId=${userId}, role=${role}, messageId=${messageId}, contentLength=${content.length}`);
  // Fire and forget - don't await
  storeConversationEmbedding(chatId, userId, content, role, messageId).catch((error) => {
    logger.error(`Telegram Bot: Embeddings: Error storing embedding asynchronously: chatId=${chatId}, userId=${userId}, role=${role}, messageId=${messageId}, error=${error instanceof Error ? error.message : error}`);
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
  logger.info(`Telegram Bot: Embeddings: Getting relevant context: userId=${userId}, queryLength=${query.length}, threshold=${options?.threshold}, limit=${options?.limit}`);
  const similarConversations = await searchSimilarConversations(userId, query, options);
  logger.info(`Telegram Bot: Embeddings: Similar conversations retrieved: count=${similarConversations.length}`);
  return buildSemanticContext(similarConversations);
};
