import { CONFIG } from "@/config";
import { MODELS } from "@/config/constants/ai";
import OpenAI from "openai";
import { SUPABASE } from "@/config/clients/supabase";
import { logger } from "./logger";

const openai = new OpenAI({ apiKey: CONFIG.openAiApiKey });

const EMBEDDING_MODEL = MODELS.TEXT_EMBEDDING_3_SMALL;
const CONVERSATION_EMBEDDINGS_TABLE = "conversation_embeddings";
const SIMILARITY_THRESHOLD = 0.7;
const MAX_RESULTS = 5;

type WebEmbeddingMetadata = {
  role: "user" | "assistant";
  userId: string; // email
  timestamp: string;
  source: "web";
};

type SimilarConversation = {
  content: string;
  id: number;
  metadata: WebEmbeddingMetadata | null;
  similarity: number;
};

// Generate embedding vector for text
export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!text || text.trim().length === 0) {
    logger.error(`Web Embeddings: generateEmbedding called: text: ${text}`);
    throw new Error("Cannot generate embedding for empty text");
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
  });

  const embedding = response.data[0]?.embedding;

  if (!embedding) {
    logger.error(`Web Embeddings: generateEmbedding called: embedding: ${embedding}`);
    throw new Error("Failed to generate embedding");
  }

  logger.info(`Web Embeddings: generateEmbedding called: embedding: ${embedding}`);
  return embedding;
};

// Format embedding array to pgvector string format
const formatEmbeddingForPgVector = (embedding: number[]): string => {
  logger.info(`Web Embeddings: formatEmbeddingForPgVector called: embedding: ${embedding}`);
  return `[${embedding.join(",")}]`;
};

// Store web conversation embedding in the database
export const storeWebConversationEmbedding = async (userId: string, content: string, role: "user" | "assistant", messageId?: number): Promise<boolean> => {
  try {
    logger.info(`Web Embeddings: storeWebConversationEmbedding called: userId: ${userId}`);
    logger.info(`Web Embeddings: storeWebConversationEmbedding called: content: ${content}`);
    logger.info(`Web Embeddings: storeWebConversationEmbedding called: role: ${role}`);
    logger.info(`Web Embeddings: storeWebConversationEmbedding called: messageId: ${messageId}`);
    const embedding = await generateEmbedding(content);
    const embeddingString = formatEmbeddingForPgVector(embedding);
    logger.info(`Web Embeddings: storeWebConversationEmbedding called: embeddingString: ${embeddingString}`);
    const metadata: WebEmbeddingMetadata = {
      role,
      userId,
      timestamp: new Date().toISOString(),
      source: "web",
    };
    logger.info(`Web Embeddings: storeWebConversationEmbedding called: metadata: ${metadata}`);
    const { error } = await SUPABASE.from(CONVERSATION_EMBEDDINGS_TABLE).insert({
      chat_id: null,
      user_id: null,
      content,
      embedding: embeddingString,
      message_id: messageId || null,
      metadata,
      source: "web",
    });
    logger.info(`Web Embeddings: storeWebConversationEmbedding called: error: ${error}`);
    if (error) {
      console.error("Error storing web conversation embedding:", error);
      logger.error(`Web Embeddings: storeWebConversationEmbedding called: error: ${error}`);
      return false;
    }

    logger.info(`Web Embeddings: storeWebConversationEmbedding called: true`);
    return true;
  } catch (error) {
    console.error("Error generating/storing web embedding:", error);
    logger.error(`Web Embeddings: storeWebConversationEmbedding called: error: ${error}`);
    return false;
  }
};

// Search for similar conversations using vector similarity (web users)
// Uses RPC function match_conversation_embeddings_web if available,
// otherwise falls back to fetching and filtering
export const searchWebSimilarConversations = async (
  userId: string,
  query: string,
  options?: {
    threshold?: number;
    limit?: number;
  }
): Promise<SimilarConversation[]> => {
  try {
    logger.info(`Web Embeddings: searchWebSimilarConversations called: userId: ${userId}`);
    logger.info(`Web Embeddings: searchWebSimilarConversations called: query: ${query}`);
    logger.info(`Web Embeddings: searchWebSimilarConversations called: options: ${options}`);
    const queryEmbedding = await generateEmbedding(query);
    logger.info(`Web Embeddings: searchWebSimilarConversations called: queryEmbedding: ${queryEmbedding}`);

    // Try the web-specific RPC function first
    const { data, error } = await SUPABASE.rpc("match_conversation_embeddings_web", {
      query_embedding: formatEmbeddingForPgVector(queryEmbedding),
      match_user_email: userId,
      match_threshold: options?.threshold || SIMILARITY_THRESHOLD,
      match_count: options?.limit || MAX_RESULTS,
    });
    logger.info(`Web Embeddings: searchWebSimilarConversations called: data: ${data}`);
    logger.info(`Web Embeddings: searchWebSimilarConversations called: error: ${error}`);
    if (!error && data) {
      return (data || []) as SimilarConversation[];
    }

    // Fallback: RPC doesn't exist or failed, return empty
    // User should create the RPC function in Supabase
    if (error) {
      logger.error(`Web Embeddings: searchWebSimilarConversations called: error: ${error}`);
      console.error(
        `Web Embeddings: searchWebSimilarConversations called: match_conversation_embeddings_web RPC not found or failed. Create the RPC function in Supabase. See be/utils/web-embeddings.ts for SQL. ${error.message}`,
        error.message
      );
      logger.error(`Web Embeddings: searchWebSimilarConversations called: error: ${error}`);
    }

    return [];
  } catch (error) {
    console.error(`Web Embeddings: searchWebSimilarConversations called: error: ${error}`);
    logger.error(`Web Embeddings: searchWebSimilarConversations called: error: ${error}`);
    return [];
  }
};

// Build context from similar conversations
export const buildWebSemanticContext = (conversations: SimilarConversation[]): string => {
  logger.info(`Web Embeddings: buildWebSemanticContext called: conversations: ${conversations}`);
  if (conversations.length === 0) {
    logger.info(`Web Embeddings: buildWebSemanticContext called: conversations: ${conversations}`);
    return "";
  }
  logger.info(`Web Embeddings: buildWebSemanticContext called: conversations: ${conversations}`);
  const contextParts = conversations
    .sort((a, b) => b.similarity - a.similarity)
    .map((conv) => {
      const role = conv.metadata?.role === "user" ? "User" : "Assistant";
      const similarity = Math.round(conv.similarity * 100);
      return `[${similarity}% relevant] ${role}: ${conv.content}`;
    });

  logger.info(`Web Embeddings: buildWebSemanticContext called: contextParts: ${contextParts}`);
  return `Relevant past conversations:\n${contextParts.join("\n")}`;
};

// Store embedding in background (non-blocking)
export const storeWebEmbeddingAsync = (userId: string, content: string, role: "user" | "assistant", messageId?: number): void => {
  logger.info(`Web Embeddings: storeWebEmbeddingAsync called: userId: ${userId}`);
  logger.info(`Web Embeddings: storeWebEmbeddingAsync called: content: ${content}`);
  logger.info(`Web Embeddings: storeWebEmbeddingAsync called: role: ${role}`);
  logger.info(`Web Embeddings: storeWebEmbeddingAsync called: messageId: ${messageId}`);
  // Fire and forget - don't await
  storeWebConversationEmbedding(userId, content, role, messageId).catch((error) => {
    console.error(`Web Embeddings: storeWebEmbeddingAsync called: background web embedding storage failed: ${error}`);
    logger.error(`Web Embeddings: storeWebEmbeddingAsync called: error: ${error}`);
  });
};

// Get relevant context for a query (web user)
export const getWebRelevantContext = async (
  userId: string,
  query: string,
  options?: {
    threshold?: number;
    limit?: number;
  }
): Promise<string> => {
  const similarConversations = await searchWebSimilarConversations(userId, query, options);
  return buildWebSemanticContext(similarConversations);
};
