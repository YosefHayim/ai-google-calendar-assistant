import { Logger } from "./logging/Logger";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface EmbeddingResult {
  embedding: number[];
  content: string;
  metadata?: Record<string, unknown>;
}

export interface VectorSearchResult {
  id: number;
  content: string;
  similarity: number;
  metadata?: Record<string, unknown>;
}

export interface ConversationEmbedding {
  user_id: string;
  chat_id?: number;
  message_id?: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

export interface EventEmbedding {
  user_id: string;
  event_id?: string;
  calendar_id?: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

export interface UserPreferenceEmbedding {
  user_id: string;
  preference_type: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}

/**
 * Service for managing vector embeddings and semantic search
 * Uses pgvector extension in Supabase for vector similarity search
 */
export class VectorSearchService {
  private client: SupabaseClient;
  private logger: Logger;
  private embeddingDimension = 1536; // OpenAI text-embedding-3-small dimension

  constructor(client: SupabaseClient) {
    this.client = client;
    this.logger = new Logger("VectorSearchService");
  }

  /**
   * Generate embedding for text using OpenAI API
   * Note: This requires OPENAI_API_KEY to be set
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // In a real implementation, you would call OpenAI's embedding API
      // For now, this is a placeholder that should be implemented with actual API call
      this.logger.warn("generateEmbedding not fully implemented - requires OpenAI API integration");

      // TODO: Implement actual OpenAI embedding API call
      // const response = await fetch('https://api.openai.com/v1/embeddings', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     model: 'text-embedding-3-small',
      //     input: text,
      //   }),
      // });
      // const data = await response.json();
      // return data.data[0].embedding;

      throw new Error("Embedding generation not implemented - requires OpenAI API key");
    } catch (error) {
      this.logger.error("Failed to generate embedding", error);
      throw error;
    }
  }

  /**
   * Store conversation embedding
   */
  async storeConversationEmbedding(embedding: ConversationEmbedding): Promise<number> {
    try {
      const { data, error } = await this.client
        .from("conversation_embeddings")
        .insert({
          user_id: embedding.user_id,
          chat_id: embedding.chat_id ?? null,
          message_id: embedding.message_id ?? null,
          content: embedding.content,
          embedding: `[${embedding.embedding.join(",")}]`, // Convert array to PostgreSQL vector format
          metadata: embedding.metadata ?? {},
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      this.logger.debug(`Stored conversation embedding with ID: ${data.id}`);
      return data.id;
    } catch (error) {
      this.logger.error("Failed to store conversation embedding", error);
      throw error;
    }
  }

  /**
   * Store event embedding
   */
  async storeEventEmbedding(embedding: EventEmbedding): Promise<number> {
    try {
      const { data, error } = await this.client
        .from("event_embeddings")
        .insert({
          user_id: embedding.user_id,
          event_id: embedding.event_id ?? null,
          calendar_id: embedding.calendar_id ?? null,
          content: embedding.content,
          embedding: `[${embedding.embedding.join(",")}]`,
          metadata: embedding.metadata ?? {},
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      this.logger.debug(`Stored event embedding with ID: ${data.id}`);
      return data.id;
    } catch (error) {
      this.logger.error("Failed to store event embedding", error);
      throw error;
    }
  }

  /**
   * Store user preference embedding
   */
  async storeUserPreferenceEmbedding(embedding: UserPreferenceEmbedding): Promise<number> {
    try {
      const { data, error } = await this.client
        .from("user_preference_embeddings")
        .insert({
          user_id: embedding.user_id,
          preference_type: embedding.preference_type,
          content: embedding.content,
          embedding: `[${embedding.embedding.join(",")}]`,
          metadata: embedding.metadata ?? {},
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      this.logger.debug(`Stored user preference embedding with ID: ${data.id}`);
      return data.id;
    } catch (error) {
      this.logger.error("Failed to store user preference embedding", error);
      throw error;
    }
  }

  /**
   * Search for similar conversations using cosine similarity
   */
  async searchSimilarConversations(user_id: string, queryEmbedding: number[], limit = 5, threshold = 0.7): Promise<VectorSearchResult[]> {
    try {
      const embeddingString = `[${queryEmbedding.join(",")}]`;

      // Use pgvector's cosine distance function
      const { data, error } = await this.client.rpc("match_conversation_embeddings", {
        query_embedding: embeddingString,
        match_user_id: user_id,
        match_threshold: threshold,
        match_count: limit,
      });

      if (error) {
        // If RPC function doesn't exist, fall back to manual query
        // This requires creating a function in the database
        this.logger.warn("RPC function not found, using fallback query");
        return this.fallbackConversationSearch(user_id, queryEmbedding, limit);
      }

      return (data ?? []).map((item: { id: number; content: string; similarity: number; metadata?: Record<string, unknown> }) => ({
        id: item.id,
        content: item.content,
        similarity: item.similarity,
        metadata: item.metadata,
      }));
    } catch (error) {
      this.logger.error("Failed to search similar conversations", error);
      throw error;
    }
  }

  /**
   * Fallback search method when RPC function is not available
   */
  private async fallbackConversationSearch(user_id: string, queryEmbedding: number[], limit: number): Promise<VectorSearchResult[]> {
    // This is a simplified fallback - in production, you'd want to use the RPC function
    // which uses proper vector similarity operators
    const { data, error } = await this.client
      .from("conversation_embeddings")
      .select("id, content, metadata")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => ({
      id: item.id,
      content: item.content,
      similarity: 0.8, // Placeholder - actual similarity would be calculated by pgvector
      metadata: item.metadata as Record<string, unknown> | undefined,
    }));
  }

  /**
   * Search for similar events
   */
  async searchSimilarEvents(user_id: string, queryEmbedding: number[], limit = 5, threshold = 0.7): Promise<VectorSearchResult[]> {
    try {
      const embeddingString = `[${queryEmbedding.join(",")}]`;

      const { data, error } = await this.client.rpc("match_event_embeddings", {
        query_embedding: embeddingString,
        match_user_id: user_id,
        match_threshold: threshold,
        match_count: limit,
      });

      if (error) {
        this.logger.warn("RPC function not found, using fallback query");
        return this.fallbackEventSearch(user_id, queryEmbedding, limit);
      }

      return (data ?? []).map((item: { id: number; content: string; similarity: number; metadata?: Record<string, unknown> }) => ({
        id: item.id,
        content: item.content,
        similarity: item.similarity,
        metadata: item.metadata,
      }));
    } catch (error) {
      this.logger.error("Failed to search similar events", error);
      throw error;
    }
  }

  /**
   * Fallback search for events
   */
  private async fallbackEventSearch(user_id: string, queryEmbedding: number[], limit: number): Promise<VectorSearchResult[]> {
    const { data, error } = await this.client
      .from("event_embeddings")
      .select("id, content, metadata")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data ?? []).map((item) => ({
      id: item.id,
      content: item.content,
      similarity: 0.8,
      metadata: item.metadata as Record<string, unknown> | undefined,
    }));
  }

  /**
   * Search for user preferences
   */
  async searchUserPreferences(user_id: string, queryEmbedding: number[], preference_type?: string, limit = 5, threshold = 0.7): Promise<VectorSearchResult[]> {
    try {
      const embeddingString = `[${queryEmbedding.join(",")}]`;

      let query = this.client.from("user_preference_embeddings").select("id, content, metadata").eq("user_id", user_id);

      if (preference_type) {
        query = query.eq("preference_type", preference_type);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);

      if (error) {
        throw error;
      }

      return (data ?? []).map((item) => ({
        id: item.id,
        content: item.content,
        similarity: 0.8, // Placeholder
        metadata: item.metadata as Record<string, unknown> | undefined,
      }));
    } catch (error) {
      this.logger.error("Failed to search user preferences", error);
      throw error;
    }
  }

  /**
   * Delete conversation embeddings for a user
   */
  async deleteConversationEmbeddings(user_id: string, chat_id?: number): Promise<void> {
    try {
      let query = this.client.from("conversation_embeddings").delete().eq("user_id", user_id);

      if (chat_id) {
        query = query.eq("chat_id", chat_id);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }

      this.logger.debug(`Deleted conversation embeddings for user ${user_id}`);
    } catch (error) {
      this.logger.error("Failed to delete conversation embeddings", error);
      throw error;
    }
  }
}
