#!/usr/bin/env ts-node
/**
 * Test script for ConversationMemoryService
 * Run with: npx ts-node -r tsconfig-paths/register scripts/test-conversation-memory.ts
 */

import { CONFIG } from "../config/root-config";
import { ConversationMemoryService } from "../services/ConversationMemoryService";
import type { Database } from "../database.types";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function testConversationMemory() {
  console.log("🧪 Testing ConversationMemoryService...\n");

  try {
    // Initialize Supabase client
    const supabase = createClient<Database>(CONFIG.supabaseUrl, CONFIG.supabaseServiceRoleKey);
    const memoryService = new ConversationMemoryService(supabase);

    const testUserId = "00000000-0000-0000-0000-000000000000"; // Test UUID
    const testChatId = 99999;

    // Clear any existing conversation
    await memoryService.clearConversation(testUserId, testChatId);
    console.log("✅ Cleared existing conversation\n");

    // Test 1: Store messages
    console.log("Test 1: Storing conversation messages...");
    const messages = [
      { role: "user" as const, content: "I need to schedule a meeting tomorrow at 2pm", messageId: 1 },
      { role: "assistant" as const, content: "I'll help you schedule that meeting. What's the meeting about?", messageId: 2 },
      { role: "user" as const, content: "It's a team standup meeting", messageId: 3 },
      { role: "assistant" as const, content: "Got it. I've scheduled your team standup for tomorrow at 2pm.", messageId: 4 },
      { role: "user" as const, content: "Can you also add a reminder 30 minutes before?", messageId: 5 },
    ];

    for (const msg of messages) {
      await memoryService.storeMessage(testUserId, testChatId, msg.messageId, msg.role, msg.content, { timestamp: new Date().toISOString() });
      console.log(`   ✅ Stored ${msg.role} message: ${msg.content.substring(0, 40)}...`);
    }
    console.log();

    // Test 2: Get conversation context
    console.log("Test 2: Getting conversation context...");
    const context = await memoryService.getConversationContext(testUserId, testChatId);
    console.log(`✅ Retrieved context with ${context.recentMessages.length} recent messages and ${context.summaries.length} summaries`);
    console.log(`   Total message count: ${context.totalMessageCount}\n`);

    // Test 3: Format context for prompt
    console.log("Test 3: Formatting context for LLM prompt...");
    const formattedContext = memoryService.formatContextForPrompt(context);
    console.log("✅ Formatted context:");
    console.log(formattedContext.substring(0, 300) + "...\n");

    // Test 4: Trigger summarization (by storing more messages)
    console.log("Test 4: Testing automatic summarization...");
    const additionalMessages = [
      { role: "assistant" as const, content: "I've added a 30-minute reminder to your calendar.", messageId: 6 },
      { role: "user" as const, content: "Perfect, thank you!", messageId: 7 },
    ];

    for (const msg of additionalMessages) {
      await memoryService.storeMessage(testUserId, testChatId, msg.messageId, msg.role, msg.content);
      console.log(`   ✅ Stored ${msg.role} message: ${msg.content}`);
    }

    // Wait a bit for async operations
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if summary was created
    const updatedContext = await memoryService.getConversationContext(testUserId, testChatId);
    console.log(`✅ Updated context has ${updatedContext.summaries.length} summaries`);
    if (updatedContext.summaries.length > 0) {
      console.log(`   Summary: ${updatedContext.summaries[0].summary_text.substring(0, 100)}...`);
    }
    console.log();

    // Test 5: Clear conversation
    console.log("Test 5: Clearing conversation...");
    await memoryService.clearConversation(testUserId, testChatId);
    const clearedContext = await memoryService.getConversationContext(testUserId, testChatId);
    console.log(`✅ Conversation cleared. Messages: ${clearedContext.recentMessages.length}, Summaries: ${clearedContext.summaries.length}\n`);

    console.log("✅ All conversation memory tests passed!\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  }
}

testConversationMemory();
