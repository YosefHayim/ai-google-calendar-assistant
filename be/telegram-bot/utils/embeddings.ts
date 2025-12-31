import { CONFIG } from "@/config";
import { MODELS } from "@/config/constants/ai";
import OpenAI from "openai";
import { SUPABASE } from "@/config/clients/supabase";

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

// Store conversation embedding in the database
export const storeConversationEmbedding = async (
  chatId: number,
  userId: number,
  content: string,
  role: "user" | "assistant",
  messageId?: number
): Promise<boolean> => {
  try {
    const embedding = await generateEmbedding(content);
    const embeddingString = formatEmbeddingForPgVector(embedding);

    const metadata: EmbeddingMetadata = {
      role,
      chatId,
      timestamp: new Date().toISOString(),
    };

    const { error } = await SUPABASE.from(CONVERSATION_EMBEDDINGS_TABLE).insert({
      chat_id: chatId,
      user_id: null,
      content,
      embedding: embeddingString,
      message_id: messageId || null,
      metadata,
    });

    if (error) {
      console.error("Error storing conversation embedding:", error);
      return false;
    }

    return true;
  } catch (error) {
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
      console.error("Error searching similar conversations:", error);
      return [];
    }

    return (data || []) as SimilarConversation[];
  } catch (error) {
    console.error("Error in similarity search:", error);
    return [];
  }
};

// Build context from similar conversations
export const buildSemanticContext = (conversations: SimilarConversation[]): string => {
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
export const storeEmbeddingAsync = (chatId: number, userId: number, content: string, role: "user" | "assistant", messageId?: number): void => {
  // Fire and forget - don't await
  storeConversationEmbedding(chatId, userId, content, role, messageId).catch((error) => {
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
