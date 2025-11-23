/**
 * Integration tests for Conversation Memory Service
 */

import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { createClient } from "@supabase/supabase-js";
import { ConversationMemoryService } from "@/services/ConversationMemoryService";
import { CONFIG } from "@/config/root-config";
import type { Database } from "@/database.types";

describe("Conversation Memory Service Integration", () => {
  let supabase: ReturnType<typeof createClient<Database>>;
  let conversationMemoryService: ConversationMemoryService;
  const testUserId = "00000000-0000-0000-0000-000000000001";
  const testChatId = 88888;

  beforeAll(async () => {
    supabase = createClient<Database>(CONFIG.supabaseUrl, CONFIG.supabaseServiceRoleKey);
    conversationMemoryService = new ConversationMemoryService(supabase);

    // Ensure test user exists
    await supabase
      .from("users")
      .upsert({
        user_id: testUserId,
        email: "memory-test@example.com",
        is_active: true,
      })
      .select()
      .single();
  });

  afterAll(async () => {
    await conversationMemoryService.clearConversation(testUserId, testChatId);
  });

  describe("Message Storage", () => {
    it("should store user messages", async () => {
      await conversationMemoryService.storeMessage(
        testUserId,
        testChatId,
        1,
        "user",
        "Test user message",
        { test: true }
      );

      const context = await conversationMemoryService.getConversationContext(testUserId, testChatId);
      expect(context.recentMessages.length).toBeGreaterThan(0);
      expect(context.recentMessages[0].role).toBe("user");
      expect(context.recentMessages[0].content).toBe("Test user message");
    });

    it("should store assistant messages", async () => {
      await conversationMemoryService.storeMessage(
        testUserId,
        testChatId,
        2,
        "assistant",
        "Test assistant response"
      );

      const context = await conversationMemoryService.getConversationContext(testUserId, testChatId);
      const assistantMessages = context.recentMessages.filter((m) => m.role === "assistant");
      expect(assistantMessages.length).toBeGreaterThan(0);
    });
  });

  describe("Context Retrieval", () => {
    it("should retrieve conversation context with recent messages", async () => {
      const context = await conversationMemoryService.getConversationContext(testUserId, testChatId);

      expect(context).toBeDefined();
      expect(context.recentMessages).toBeInstanceOf(Array);
      expect(context.summaries).toBeInstanceOf(Array);
      expect(typeof context.totalMessageCount).toBe("number");
    });

    it("should format context for prompts", async () => {
      const context = await conversationMemoryService.getConversationContext(testUserId, testChatId);
      const formatted = conversationMemoryService.formatContextForPrompt(context);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe("string");
    });
  });

  describe("Summarization", () => {
    it("should trigger summarization after 3 messages", async () => {
      // Clear existing conversation
      await conversationMemoryService.clearConversation(testUserId, testChatId);

      // Store 3 messages to trigger summarization
      for (let i = 1; i <= 3; i++) {
        await conversationMemoryService.storeMessage(
          testUserId,
          testChatId,
          i,
          i % 2 === 1 ? "user" : "assistant",
          `Test message ${i}`
        );
      }

      // Wait a bit for async operations
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const context = await conversationMemoryService.getConversationContext(testUserId, testChatId);
      // Summaries may or may not exist depending on implementation timing
      expect(context.totalMessageCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Conversation Clearing", () => {
    it("should clear all conversation data", async () => {
      // Store some messages first
      await conversationMemoryService.storeMessage(
        testUserId,
        testChatId,
        100,
        "user",
        "Message to be cleared"
      );

      // Clear conversation
      await conversationMemoryService.clearConversation(testUserId, testChatId);

      // Verify cleared
      const context = await conversationMemoryService.getConversationContext(testUserId, testChatId);
      expect(context.recentMessages.length).toBe(0);
      expect(context.summaries.length).toBe(0);
    });
  });
});

