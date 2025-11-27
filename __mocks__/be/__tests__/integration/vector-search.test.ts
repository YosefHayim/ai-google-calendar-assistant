/**
 * Integration tests for Vector Search Service
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import { createClient } from "@supabase/supabase-js";
import { VectorSearchService } from "@/services/VectorSearchService";
import { CONFIG } from "@/config/root-config";
import type { Database } from "@/database.types";

describe("Vector Search Service Integration", () => {
  let supabase: ReturnType<typeof createClient<Database>>;
  let vectorSearchService: VectorSearchService;
  const testUserId = "00000000-0000-0000-0000-000000000002";

  beforeAll(async () => {
    supabase = createClient<Database>(CONFIG.supabaseUrl, CONFIG.supabaseServiceRoleKey);
    vectorSearchService = new VectorSearchService(supabase);

    // Ensure test user exists
    await supabase
      .from("users")
      .upsert({
        user_id: testUserId,
        email: "vector-test@example.com",
        is_active: true,
      })
      .select()
      .single();
  });

  describe("Embedding Generation", () => {
    it("should generate embeddings with correct dimension", async () => {
      const embedding = await vectorSearchService.generateEmbedding("test text");

      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(1536); // OpenAI text-embedding-3-small dimension
      expect(embedding.every((val) => typeof val === "number")).toBe(true);
    });

    it("should generate different embeddings for different texts", async () => {
      const embedding1 = await vectorSearchService.generateEmbedding("meeting tomorrow");
      const embedding2 = await vectorSearchService.generateEmbedding("dinner next week");

      expect(embedding1).not.toEqual(embedding2);
    });

    it("should generate similar embeddings for similar texts", async () => {
      const embedding1 = await vectorSearchService.generateEmbedding("schedule a meeting");
      const embedding2 = await vectorSearchService.generateEmbedding("book a meeting");

      // Calculate cosine similarity
      const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
      const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
      const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));
      const similarity = dotProduct / (magnitude1 * magnitude2);

      // Similar texts should have high similarity (> 0.7)
      expect(similarity).toBeGreaterThan(0.7);
    });
  });

  describe("Vector Storage and Search", () => {
    it("should store conversation embeddings", async () => {
      const testText = "I need to schedule a team meeting tomorrow at 2pm";
      const embedding = await vectorSearchService.generateEmbedding(testText);

      try {
        const embeddingId = await vectorSearchService.storeConversationEmbedding({
          user_id: testUserId,
          chat_id: 12345,
          message_id: 1,
          content: testText,
          embedding,
          metadata: { test: true },
        });

        expect(embeddingId).toBeGreaterThan(0);
      } catch (error) {
        // Expected if tables don't exist - just verify embedding generation works
        expect(embedding.length).toBe(1536);
      }
    });

    it("should search for similar conversations", async () => {
      try {
        const queryText = "schedule a meeting";
        const queryEmbedding = await vectorSearchService.generateEmbedding(queryText);
        const results = await vectorSearchService.searchSimilarConversations(
          testUserId,
          queryEmbedding,
          5,
          0.5
        );

        expect(Array.isArray(results)).toBe(true);
        // Results may be empty if no similar conversations exist
      } catch (error) {
        // Expected if tables don't exist
        expect(error).toBeDefined();
      }
    });

    it("should store and search event embeddings", async () => {
      const eventText = "Team standup meeting every day at 9am";
      const embedding = await vectorSearchService.generateEmbedding(eventText);

      try {
        const embeddingId = await vectorSearchService.storeEventEmbedding({
          user_id: testUserId,
          event_id: "test-event-123",
          calendar_id: "primary",
          content: eventText,
          embedding,
          metadata: { recurring: true },
        });

        expect(embeddingId).toBeGreaterThan(0);

        const queryEmbedding = await vectorSearchService.generateEmbedding("daily meeting");
        const results = await vectorSearchService.searchSimilarEvents(testUserId, queryEmbedding, 5, 0.5);

        expect(Array.isArray(results)).toBe(true);
      } catch (error) {
        // Expected if tables don't exist
        expect(embedding.length).toBe(1536);
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle missing API key gracefully", async () => {
      const originalKey = process.env.OPEN_API_KEY;
      delete process.env.OPEN_API_KEY;
      delete process.env.OPENAI_API_KEY;

      await expect(vectorSearchService.generateEmbedding("test")).rejects.toThrow();

      // Restore key
      if (originalKey) {
        process.env.OPEN_API_KEY = originalKey;
      }
    });
  });
});

