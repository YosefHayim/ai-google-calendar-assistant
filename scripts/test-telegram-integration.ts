#!/usr/bin/env ts-node
/**
 * Test script for Telegram Bot Integration with Conversation Memory and Vector Search
 * Run with: npx ts-node -r tsconfig-paths/register scripts/test-telegram-integration.ts
 */

import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { ConversationMemoryService } from "../services/ConversationMemoryService";
import { VectorSearchService } from "../services/VectorSearchService";
import { CONFIG } from "../config/root-config";
import type { Database } from "../database.types";
import { activateAgent, type AgentContext } from "../utils/activateAgent";
import { ORCHESTRATOR_AGENT } from "../ai-agents/agents";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function testTelegramIntegration() {
  console.log("🧪 Testing Telegram Bot Integration...\n");

  try {
    // Initialize services
    const supabase = createClient<Database>(CONFIG.supabaseUrl, CONFIG.supabaseServiceRoleKey);
    const conversationMemoryService = new ConversationMemoryService(supabase);
    const vectorSearchService = new VectorSearchService(supabase);

    // Test user setup
    const testEmail = "test@example.com";
    const testChatId = 12345;
    const testUserId = "00000000-0000-0000-0000-000000000000";

    // Ensure test user exists
    const { data: existingUser } = await supabase.from("users").select("user_id").eq("email", testEmail).single();
    let userId = existingUser?.user_id || testUserId;

    if (!existingUser) {
      const { data: newUser } = await supabase
        .from("users")
        .insert({
          email: testEmail,
          is_active: true,
        })
        .select("user_id")
        .single();
      if (newUser?.user_id) {
        userId = newUser.user_id;
      }
    }

    console.log(`✅ Using user_id: ${userId}\n`);

    // Test 1: Simulate conversation flow
    console.log("Test 1: Simulating conversation flow...");
    const messages = [
      { role: "user" as const, content: "I need to schedule a meeting tomorrow at 2pm", messageId: 1 },
      { role: "assistant" as const, content: "I'll help you schedule that meeting. What's the meeting about?", messageId: 2 },
      { role: "user" as const, content: "It's a team standup meeting", messageId: 3 },
    ];

    for (const msg of messages) {
      await conversationMemoryService.storeMessage(userId, testChatId, msg.messageId, msg.role, msg.content);
      console.log(`   ✅ Stored ${msg.role} message`);
    }
    console.log();

    // Test 2: Get conversation context
    console.log("Test 2: Getting conversation context...");
    const context = await conversationMemoryService.getConversationContext(userId, testChatId);
    const formattedContext = conversationMemoryService.formatContextForPrompt(context);
    console.log(`✅ Retrieved context (${formattedContext.length} chars)\n`);

    // Test 3: Vector search
    console.log("Test 3: Testing vector search...");
    const queryText = "schedule a meeting";
    const queryEmbedding = await vectorSearchService.generateEmbedding(queryText);
    const similarConversations = await vectorSearchService.searchSimilarConversations(userId, queryEmbedding, 3, 0.5);
    console.log(`✅ Found ${similarConversations.length} similar conversations\n`);

    // Test 4: Agent activation with context
    console.log("Test 4: Testing agent activation with context...");
    const agentContext: AgentContext = {
      conversationContext: formattedContext,
      vectorSearchResults: similarConversations.map((r, i) => `${i + 1}. ${r.content} (similarity: ${r.similarity.toFixed(2)})`).join("\n"),
    };

    const testPrompt = `Current date and time is ${new Date().toISOString()}. User ${testEmail} requesting for help with: Can you remind me about the meeting?`;

    console.log("   Activating agent with context...");
    const result = await activateAgent(ORCHESTRATOR_AGENT, testPrompt, agentContext);
    console.log(`✅ Agent responded: ${result.finalOutput?.substring(0, 100)}...\n`);

    // Test 5: Store conversation embedding
    console.log("Test 5: Storing conversation embedding...");
    const conversationText = `User: ${messages[0].content}\nAssistant: ${messages[1].content}`;
    const embedding = await vectorSearchService.generateEmbedding(conversationText);
    const embeddingId = await vectorSearchService.storeConversationEmbedding({
      user_id: userId,
      chat_id: testChatId,
      message_id: 1,
      content: conversationText,
      embedding,
    });
    console.log(`✅ Stored conversation embedding with ID: ${embeddingId}\n`);

    console.log("✅ All Telegram integration tests passed!\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  }
}

testTelegramIntegration();
