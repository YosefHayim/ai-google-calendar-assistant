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
  userId: string;
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
    throw new Error("Cannot generate embedding for empty text");
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
  });

  const embedding = response.data[0]?.embedding;

  if (!embedding) {
    throw new Error("Failed to generate embedding");
  }

  return embedding;
};

// Format embedding array to pgvector string format
const formatEmbeddingForPgVector = (embedding: number[]): string => {
  return `[${embedding.join(",")}]`;
};

// Store web conversation embedding in the database
export const storeWebConversationEmbedding = async (userId: string, content: string, role: "user" | "assistant", messageId?: number): Promise<boolean> => {
  try {
    const embedding = await generateEmbedding(content);
    const embeddingString = formatEmbeddingForPgVector(embedding);

    const metadata: WebEmbeddingMetadata = {
      role,
      userId,
      timestamp: new Date().toISOString(),
      source: "web",
    };

    const { error } = await SUPABASE.from(CONVERSATION_EMBEDDINGS_TABLE).insert({
      chat_id: null,
      user_id: null,
      content,
      embedding: embeddingString,
      message_id: messageId || null,
      metadata,
      source: "web",
    });

    if (error) {
      logger.error(`Failed to store embedding for user ${userId}: ${error.message}`);
      return false;
    }

    return true;
  } catch (error) {
    logger.error(`Failed to generate/store embedding for user ${userId}: ${error}`);
    return false;
  }
};

// Search for similar conversations using vector similarity (web users)
export const searchWebSimilarConversations = async (
  userId: string,
  query: string,
  options?: {
    threshold?: number;
    limit?: number;
  }
): Promise<SimilarConversation[]> => {
  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await SUPABASE.rpc("match_conversation_embeddings_web", {
      query_embedding: formatEmbeddingForPgVector(queryEmbedding),
      match_user_email: userId,
      match_threshold: options?.threshold || SIMILARITY_THRESHOLD,
      match_count: options?.limit || MAX_RESULTS,
    });

    if (!error && data) {
      return (data || []) as SimilarConversation[];
    }

    if (error) {
      logger.warn(`RPC match_conversation_embeddings_web failed: ${error.message}. Create the function in Supabase if missing.`);
    }

    return [];
  } catch (error) {
    logger.error(`Failed to search similar conversations for user ${userId}: ${error}`);
    return [];
  }
};

// Build context from similar conversations
export const buildWebSemanticContext = (conversations: SimilarConversation[]): string => {
  if (conversations.length === 0) {
    return "";
  }

  const contextParts = conversations
    .sort((a, b) => b.similarity - a.similarity)
    .map((conv) => {
      const role = conv.metadata?.role === "user" ? "User" : "Assistant";
      const similarity = Math.round(conv.similarity * 100);
      return `[${similarity}% relevant] ${role}: ${conv.content}`;
    });

  return `Relevant past conversations:\n${contextParts.join("\n")}`;
};

// Store embedding in background (non-blocking)
export const storeWebEmbeddingAsync = (userId: string, content: string, role: "user" | "assistant", messageId?: number): void => {
  storeWebConversationEmbedding(userId, content, role, messageId).catch((error) => {
    logger.error(`Background embedding storage failed for user ${userId}: ${error}`);
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

// Delete all embeddings for a user (web)
export const deleteAllWebEmbeddings = async (userId: string): Promise<{ success: boolean; deletedCount: number }> => {
  try {
    // First count how many will be deleted
    const { count, error: countError } = await SUPABASE
      .from(CONVERSATION_EMBEDDINGS_TABLE)
      .select("*", { count: "exact", head: true })
      .contains("metadata", { userId });

    if (countError) {
      logger.error(`Failed to count embeddings for user ${userId}: ${countError.message}`);
    }

    // Delete embeddings where metadata contains userId
    const { error } = await SUPABASE
      .from(CONVERSATION_EMBEDDINGS_TABLE)
      .delete()
      .contains("metadata", { userId });

    if (error) {
      logger.error(`Failed to delete embeddings for user ${userId}: ${error.message}`);
      return { success: false, deletedCount: 0 };
    }

    logger.info(`Deleted ${count || 0} embeddings for user ${userId}`);
    return { success: true, deletedCount: count || 0 };
  } catch (error) {
    logger.error(`Failed to delete embeddings for user ${userId}: ${error}`);
    return { success: false, deletedCount: 0 };
  }
};
