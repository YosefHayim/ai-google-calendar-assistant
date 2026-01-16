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

/**
 * @description Generates an embedding vector for the given text.
 * Currently stubbed as the embedding functionality is disabled.
 * When re-enabled, this would use an embedding model (e.g., OpenAI) to create
 * a vector representation of the text for semantic search.
 * @param {string} _text - The text to generate an embedding for (currently unused)
 * @returns {Promise<number[]>} An empty array (stubbed) - would return embedding vector when enabled
 * @example
 * const embedding = await generateEmbedding("Schedule a meeting tomorrow");
 * // Returns: [] (currently disabled)
 */
export const generateEmbedding = async (_text: string): Promise<number[]> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return [];
};

/**
 * @description Stores an embedding for a conversation message in the database.
 * Currently stubbed as the embedding functionality is disabled.
 * When re-enabled, this would generate and store a vector embedding for semantic search.
 * @param {string} _userId - The unique identifier of the user (currently unused)
 * @param {string} _content - The message content to embed (currently unused)
 * @param {"user" | "assistant"} _role - The role of the message author (currently unused)
 * @param {number} [_messageId] - Optional message ID for reference (currently unused)
 * @returns {Promise<boolean>} Always returns true (stubbed)
 * @example
 * await storeWebConversationEmbedding("user-123", "Meeting at 3pm", "user", 42);
 * // Returns: true (currently disabled, no-op)
 */
export const storeWebConversationEmbedding = async (
  _userId: string,
  _content: string,
  _role: "user" | "assistant",
  _messageId?: number
): Promise<boolean> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return true;
};

/**
 * @description Searches for semantically similar conversations using vector similarity.
 * Currently stubbed as the embedding functionality is disabled.
 * When re-enabled, this would use pgvector to find conversations with similar content.
 * @param {string} _userId - The unique identifier of the user (currently unused)
 * @param {string} _query - The search query to find similar conversations (currently unused)
 * @param {Object} [_options] - Optional search parameters
 * @param {number} [_options.threshold] - Minimum similarity score (0-1) to include results
 * @param {number} [_options.limit] - Maximum number of results to return
 * @returns {Promise<SimilarConversation[]>} An empty array (stubbed) - would return similar conversations when enabled
 * @example
 * const similar = await searchWebSimilarConversations("user-123", "team meetings", {
 *   threshold: 0.7,
 *   limit: 5
 * });
 * // Returns: [] (currently disabled)
 */
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

/**
 * @description Builds a formatted context string from similar conversation results.
 * Sorts conversations by relevance and formats them with similarity scores
 * for inclusion in AI prompts. Active even when embeddings are disabled.
 * @param {SimilarConversation[]} conversations - Array of similar conversation results
 * @returns {string} A formatted string with relevant past conversations, or empty string if no results
 * @example
 * const context = buildWebSemanticContext([
 *   { content: "Meeting at 3pm", similarity: 0.85, metadata: { role: "user" } }
 * ]);
 * // Returns: "Relevant past conversations:\n[85% relevant] User: Meeting at 3pm"
 */
export const buildWebSemanticContext = (
  conversations: SimilarConversation[]
): string => {
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

/**
 * @description Stores an embedding asynchronously in a non-blocking manner.
 * Currently stubbed as the embedding functionality is disabled.
 * When re-enabled, this would queue embedding generation without blocking the response.
 * @param {string} _userId - The unique identifier of the user (currently unused)
 * @param {string} _content - The message content to embed (currently unused)
 * @param {"user" | "assistant"} _role - The role of the message author (currently unused)
 * @param {number} [_messageId] - Optional message ID for reference (currently unused)
 * @returns {void}
 * @example
 * // Fire and forget - doesn't block
 * storeWebEmbeddingAsync("user-123", "Check my calendar", "user");
 */
export const storeWebEmbeddingAsync = (
  _userId: string,
  _content: string,
  _role: "user" | "assistant",
  _messageId?: number
): void => {
  // Embeddings disabled - conversation_embeddings table dropped
};

/**
 * @description Retrieves relevant context for a query using semantic search.
 * Currently stubbed as the embedding functionality is disabled.
 * When re-enabled, this would search for similar conversations and build context.
 * @param {string} _userId - The unique identifier of the user (currently unused)
 * @param {string} _query - The query to find relevant context for (currently unused)
 * @param {Object} [_options] - Optional search parameters
 * @param {number} [_options.threshold] - Minimum similarity score (0-1) to include results
 * @param {number} [_options.limit] - Maximum number of results to include
 * @returns {Promise<string>} An empty string (stubbed) - would return relevant context when enabled
 * @example
 * const context = await getWebRelevantContext("user-123", "upcoming meetings", {
 *   threshold: 0.6,
 *   limit: 3
 * });
 * // Returns: "" (currently disabled)
 */
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

/**
 * @description Deletes all embedding vectors for a specific user.
 * Currently stubbed as the embedding functionality is disabled.
 * When re-enabled, this would remove all stored embeddings for data cleanup or GDPR compliance.
 * @param {string} _userId - The unique identifier of the user whose embeddings to delete (currently unused)
 * @returns {Promise<{ success: boolean; deletedCount: number }>} Success status and count of deleted embeddings (always 0 when stubbed)
 * @example
 * const result = await deleteAllWebEmbeddings("user-123");
 * // Returns: { success: true, deletedCount: 0 } (currently disabled)
 */
export const deleteAllWebEmbeddings = async (
  _userId: string
): Promise<{ success: boolean; deletedCount: number }> => {
  // Embeddings disabled - conversation_embeddings table dropped
  return { success: true, deletedCount: 0 };
};
