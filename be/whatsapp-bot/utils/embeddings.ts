/**
 * WhatsApp Embeddings Utility - DISABLED
 *
 * The conversation_embeddings table was dropped for simpler architecture.
 * These functions are stubbed out to maintain API compatibility.
 *
 * To re-enable:
 * 1. Create conversation_embeddings table with pgvector extension
 * 2. Create match_conversation_embeddings_v2 RPC function
 * 3. Implement actual embedding storage and search
 */

type EmbeddingMetadata = {
  role: "user" | "assistant"
  phoneNumber: string
  timestamp: string
}

type SimilarConversation = {
  content: string
  id: string
  metadata: EmbeddingMetadata | null
  similarity: number
}

/**
 * Generates an embedding vector for text - stubbed
 */
export const generateEmbedding = (_text: string): number[] => {
  // Embeddings disabled - conversation_embeddings table dropped
  return []
}

/**
 * Stores a conversation embedding in the database - stubbed
 */
export const storeConversationEmbedding = (_params: {
  phoneNumber: string
  content: string
  role: "user" | "assistant"
  messageId?: string
  conversationId?: string
}): boolean => {
  // Embeddings disabled - conversation_embeddings table dropped
  return true
}

/**
 * Searches for similar conversations using vector similarity - stubbed
 */
export const searchSimilarConversations = (
  _phoneNumber: string,
  _query: string,
  _options?: {
    threshold?: number
    limit?: number
  }
): SimilarConversation[] => {
  // Embeddings disabled - conversation_embeddings table dropped
  return []
}

/**
 * Builds semantic context from similar conversations
 */
export const buildSemanticContext = (
  conversations: SimilarConversation[]
): string => {
  if (conversations.length === 0) {
    return ""
  }

  const sorted = conversations.sort((a, b) => b.similarity - a.similarity)
  const contextParts: string[] = []

  for (const conv of sorted) {
    const role = conv.metadata?.role === "user" ? "User" : "Assistant"
    const similarity = Math.round(conv.similarity * 100)
    const part = `[${similarity}% relevant] ${role}: ${conv.content}`
    contextParts.push(part)
  }

  return contextParts.length > 0
    ? `Relevant past conversations:\n${contextParts.join("\n")}`
    : ""
}

/**
 * Stores embedding in background (non-blocking) - stubbed
 */
export const storeEmbeddingAsync = (
  _phoneNumber: string,
  _content: string,
  _role: "user" | "assistant",
  _messageId?: string,
  _conversationId?: string
): void => {
  // Embeddings disabled - conversation_embeddings table dropped
}

/**
 * Gets relevant context for a query - stubbed
 */
export const getRelevantContext = (
  _phoneNumber: string,
  _query: string,
  _options?: {
    threshold?: number
    limit?: number
  }
): string => {
  // Embeddings disabled - conversation_embeddings table dropped
  return ""
}
