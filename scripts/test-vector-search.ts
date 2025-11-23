#!/usr/bin/env ts-node
/**
 * Test script for VectorSearchService
 * Run with: npx ts-node -r tsconfig-paths/register scripts/test-vector-search.ts
 */

import { CONFIG } from "../config/root-config";
import type { Database } from "../database.types";
import { VectorSearchService } from "../services/VectorSearchService";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function testVectorSearch() {
  console.log("🧪 Testing VectorSearchService...\n");

  try {
    // Initialize Supabase client
    const supabase = createClient<Database>(CONFIG.supabaseUrl, CONFIG.supabaseServiceRoleKey);
    const vectorService = new VectorSearchService(supabase);

    // Test 1: Generate embedding
    console.log("Test 1: Generating embedding...");
    const testText = "I need to schedule a meeting tomorrow at 2pm";
    const embedding = await vectorService.generateEmbedding(testText);
    console.log(`✅ Generated embedding with dimension: ${embedding.length}`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).join(", ")}...]\n`);

    // Test 2: Store conversation embedding
    console.log("Test 2: Storing conversation embedding...");
    const testUserId = "00000000-0000-0000-0000-000000000000"; // Test UUID
    const embeddingId = await vectorService.storeConversationEmbedding({
      user_id: testUserId,
      chat_id: 12345,
      message_id: 1,
      content: testText,
      embedding,
      metadata: { test: true },
    });
    console.log(`✅ Stored conversation embedding with ID: ${embeddingId}\n`);

    // Test 3: Search similar conversations
    console.log("Test 3: Searching similar conversations...");
    const queryText = "schedule a meeting";
    const queryEmbedding = await vectorService.generateEmbedding(queryText);
    const results = await vectorService.searchSimilarConversations(testUserId, queryEmbedding, 5, 0.5);
    console.log(`✅ Found ${results.length} similar conversations`);
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. Similarity: ${result.similarity.toFixed(3)}, Content: ${result.content.substring(0, 50)}...`);
    });
    console.log();

    // Test 4: Store event embedding
    console.log("Test 4: Storing event embedding...");
    const eventEmbedding = await vectorService.generateEmbedding("Team standup meeting every day at 9am");
    const eventId = await vectorService.storeEventEmbedding({
      user_id: testUserId,
      event_id: "test-event-123",
      calendar_id: "primary",
      content: "Team standup meeting every day at 9am",
      embedding: eventEmbedding,
      metadata: { recurring: true },
    });
    console.log(`✅ Stored event embedding with ID: ${eventId}\n`);

    // Test 5: Search similar events
    console.log("Test 5: Searching similar events...");
    const eventQueryEmbedding = await vectorService.generateEmbedding("daily meeting");
    const eventResults = await vectorService.searchSimilarEvents(testUserId, eventQueryEmbedding, 5, 0.5);
    console.log(`✅ Found ${eventResults.length} similar events`);
    eventResults.forEach((result, index) => {
      console.log(`   ${index + 1}. Similarity: ${result.similarity.toFixed(3)}, Content: ${result.content.substring(0, 50)}...`);
    });
    console.log();

    console.log("✅ All vector search tests passed!\n");
  } catch (error) {
    console.error("❌ Test failed:", error);
    if (error instanceof Error) {
      console.error("   Error message:", error.message);
      console.error("   Stack:", error.stack);
    }
    process.exit(1);
  }
}

testVectorSearch();
