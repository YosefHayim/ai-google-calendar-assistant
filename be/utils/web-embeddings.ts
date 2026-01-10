/**
 * Web Embeddings functionality - DISABLED
 *
 * The conversation_embeddings table was dropped for simpler architecture.
 * These functions are stubbed out to maintain API compatibility.
 *
 * To re-enable:
 * 1. Create conversation_embeddings table with pgvector extension
 * 2. Create match_conversation_embeddings_web RPC function
 * 3. Implement actual embedding storage and search
 */

import { logger } from "./logger";

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

// Generate embedding vector for text - stubbed
export const generateEmbedding = async (_text: string): Promise<number[]> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return [];
};

// Store web conversation embedding in the database - stubbed
export const storeWebConversationEmbedding = async (
  _userId: string,
  _content: string,
  _role: "user" | "assistant",
  _messageId?: number
): Promise<boolean> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return true;
};

// Search for similar conversations using vector similarity (web users) - stubbed
export const searchWebSimilarConversations = async (
  _userId: string,
  _query: string,
  _options?: {
    threshold?: number;
    limit?: number;
  }
): Promise<SimilarConversation[]> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return [];
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

// Store embedding in background (non-blocking) - stubbed
export const storeWebEmbeddingAsync = (
  _userId: string,
  _content: string,
  _role: "user" | "assistant",
  _messageId?: number
): void => {
  // Embeddings disabled - conversation_embeddings table dropped
};

// Get relevant context for a query (web user) - stubbed
export const getWebRelevantContext = async (
  _userId: string,
  _query: string,
  _options?: {
    threshold?: number;
    limit?: number;
  }
): Promise<string> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return "";
};

// Delete all embeddings for a user (web) - stubbed
export const deleteAllWebEmbeddings = async (
  _userId: string
): Promise<{ success: boolean; deletedCount: number }> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return { success: true, deletedCount: 0 };
};
