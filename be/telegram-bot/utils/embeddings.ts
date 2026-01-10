/**
 * Embeddings functionality - DISABLED
 *
 * The conversation_embeddings table was dropped for simpler architecture.
 * These functions are stubbed out to maintain API compatibility.
 *
 * To re-enable:
 * 1. Create conversation_embeddings table with pgvector extension
 * 2. Create match_conversation_embeddings RPC function
 * 3. Implement actual embedding storage and search
 */

import { logger } from "@/utils/logger";

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

// Generate embedding vector for text - stubbed
export const generateEmbedding = async (_text: string): Promise<number[]> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return [];
};

// Store conversation embedding in the database - stubbed
export const storeConversationEmbedding = async (
  _chatId: number,
  _telegramUserId: number,
  _content: string,
  _role: "user" | "assistant",
  _messageId?: string,
  _conversationId?: string
): Promise<boolean> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return true;
};

// Search for similar conversations using vector similarity - stubbed
export const searchSimilarConversations = async (
  _userId: number,
  _query: string,
  _options?: {
    threshold?: number;
    limit?: number;
  }
): Promise<SimilarConversation[]> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return [];
};

export const buildSemanticContext = (conversations: SimilarConversation[]): string => {
  if (conversations.length === 0) {
    return "";
  }

  const sorted = conversations.sort((a, b) => b.similarity - a.similarity);
  const contextParts: string[] = [];

  for (const conv of sorted) {
    const role = conv.metadata?.role === "user" ? "User" : "Assistant";
    const similarity = Math.round(conv.similarity * 100);
    const part = `[${similarity}% relevant] ${role}: ${conv.content}`;
    contextParts.push(part);
  }

  return contextParts.length > 0 ? `Relevant past conversations:\n${contextParts.join("\n")}` : "";
};

// Store embedding in background (non-blocking) - stubbed
export const storeEmbeddingAsync = (
  _chatId: number,
  _telegramUserId: number,
  _content: string,
  _role: "user" | "assistant",
  _messageId?: string,
  _conversationId?: string
): void => {
  // Embeddings disabled - conversation_embeddings table dropped
};

// Get relevant context for a query - stubbed
export const getRelevantContext = async (
  _userId: number,
  _query: string,
  _options?: {
    threshold?: number;
    limit?: number;
  }
): Promise<string> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return "";
};
