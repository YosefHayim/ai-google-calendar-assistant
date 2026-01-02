import { CONFIG } from "@/config";
import { MODELS } from "@/config/constants/ai";
import OpenAI from "openai";
import { SUPABASE } from "@/config/clients/supabase";

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
export const storeWebConversationEmbedding = async (
  userId: string,
  content: string,
  role: "user" | "assistant",
  messageId?: number
): Promise<boolean> => {
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
      console.error("Error storing web conversation embedding:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error generating/storing web embedding:", error);
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
    const queryEmbedding = await generateEmbedding(query);

    // Try the web-specific RPC function first
    const { data, error } = await SUPABASE.rpc("match_conversation_embeddings_web", {
      query_embedding: formatEmbeddingForPgVector(queryEmbedding),
      match_user_email: userId,
      match_threshold: options?.threshold || SIMILARITY_THRESHOLD,
      match_count: options?.limit || MAX_RESULTS,
    });

    if (!error && data) {
      return (data || []) as SimilarConversation[];
    }

    // Fallback: RPC doesn't exist or failed, return empty
    // User should create the RPC function in Supabase
    if (error) {
      console.warn("match_conversation_embeddings_web RPC not found or failed. Create the RPC function in Supabase. See be/utils/web-embeddings.ts for SQL.", error.message);
    }

    return [];
  } catch (error) {
    console.error("Error in web similarity search:", error);
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
  // Fire and forget - don't await
  storeWebConversationEmbedding(userId, content, role, messageId).catch((error) => {
    console.error("Background web embedding storage failed:", error);
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

/*
 * SQL for Supabase RPC function - Add this to your Supabase SQL editor:
 *
 * CREATE OR REPLACE FUNCTION match_conversation_embeddings_web(
 *   query_embedding vector(1536),
 *   match_user_email text,
 *   match_threshold float DEFAULT 0.7,
 *   match_count int DEFAULT 5
 * )
 * RETURNS TABLE (
 *   id bigint,
 *   content text,
 *   metadata jsonb,
 *   similarity float
 * )
 * LANGUAGE plpgsql
 * AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT
 *     ce.id,
 *     ce.content,
 *     ce.metadata,
 *     1 - (ce.embedding <=> query_embedding) AS similarity
 *   FROM conversation_embeddings ce
 *   WHERE ce.source = 'web'
 *     AND ce.metadata->>'userId' = match_user_email
 *     AND 1 - (ce.embedding <=> query_embedding) > match_threshold
 *   ORDER BY ce.embedding <=> query_embedding
 *   LIMIT match_count;
 * END;
 * $$;
 */
