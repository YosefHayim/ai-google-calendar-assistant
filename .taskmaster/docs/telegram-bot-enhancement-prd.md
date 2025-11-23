# Telegram Bot Enhancement & Agent Integration PRD

## Overview
This PRD outlines the enhancements needed to properly wire AI agents to the Telegram bot, implement vector search capabilities, add conversation memory with summarization, and update agent prompts and tool descriptions. Additionally, we need to ensure Supabase tables match the new database structure.

## Current State
- 902 tests passing with 42 test suites
- Telegram bot initialized with basic agent integration
- AI agents system in place with orchestrator pattern
- New database structure created via migrations
- Existing Supabase tables may not match new structure

## Requirements

### 1. Database Migration & Schema Alignment
**Priority: High**

- Override/update existing Supabase tables to match the new database structure defined in migrations
- Ensure all tables (users, user_calendar_tokens, calendar_categories, user_telegram_links) align with migration files
- Verify foreign key relationships are correct
- Update database.types.ts to reflect actual database schema
- Ensure RLS policies are properly applied
- Test data migration if needed (backup existing data)

**Migration Files to Review:**
- `20250119000001_create_users_table.sql`
- `20250119000002_redesign_user_calendar_tokens.sql`
- `20250119000003_redesign_calendar_categories.sql`
- `20250119000004_redesign_user_telegram_links.sql`
- `20250119000005_implement_rls_policies.sql`

### 2. Vector Database Integration
**Priority: High**

- Implement vector database for semantic search capabilities
- Choose appropriate vector DB solution (e.g., Supabase Vector, Pinecone, Weaviate, or pgvector)
- Create vector embeddings for:
  - User conversation history
  - Calendar event descriptions
  - User preferences and context
- Implement vector search functionality for:
  - Finding similar past conversations
  - Retrieving relevant context for agent responses
  - Semantic search of calendar events
- Create service layer for vector operations
- Add vector storage to conversation context retrieval

**Technical Considerations:**
- Embedding model selection (OpenAI embeddings, Cohere, or local models)
- Vector dimension configuration
- Indexing strategy for fast retrieval
- Integration with existing Supabase infrastructure

### 3. Conversation Memory with Summarization
**Priority: High**

- Implement conversation memory system that maintains user context
- Store conversation history per user (linked via Telegram chat ID or user_id)
- Implement summarization mechanism:
  - Every 3 messages, summarize the conversation
  - Preserve key information (user intent, preferences, context)
  - Reduce token count while maintaining context quality
- Create conversation summarization service
- Implement sliding window approach:
  - Keep last 2 messages in full detail
  - Summarize older messages
  - Maintain summary chain for long conversations
- Store summaries in database (new table or extend existing)
- Retrieve and inject summarized context into agent prompts

**Memory Structure:**
- User ID / Telegram Chat ID
- Message sequence
- Timestamps
- Summarized context
- Full message history (for last N messages)
- Metadata (intent, entities, preferences)

### 4. Telegram Bot Agent Integration
**Priority: High**

- Properly wire all agents to Telegram bot message handler
- Enhance `init-bot.ts` to:
  - Integrate conversation memory system
  - Inject summarized context into agent prompts
  - Handle agent responses with proper formatting
  - Manage conversation state per user
- Update `activateAgent` utility to:
  - Accept conversation context
  - Handle memory injection
  - Support vector search for context retrieval
- Implement error handling and retry logic
- Add typing indicators during agent processing
- Implement message queuing for concurrent requests

**Integration Points:**
- Telegram bot middleware
- Agent activation system
- Conversation memory service
- Vector search service
- Error handling and logging

### 5. Agent Prompts & Instructions Enhancement
**Priority: Medium**

- Review and refine all agent instructions in `agentInstructions.ts`
- Update prompts to:
  - Better utilize conversation context
  - Include relevant vector search results
  - Reference user preferences from memory
  - Provide clearer guidance on tool usage
- Enhance orchestrator agent to:
  - Better understand user intent from conversation history
  - Make more informed decisions about agent handoffs
  - Handle multi-turn conversations more effectively
- Update handoff agent instructions for better context awareness
- Add instructions for handling conversation summaries

**Agents to Update:**
- Orchestrator agent
- Insert event handoff agent
- Get event handoff agent
- Update event handoff agent
- Delete event handoff agent
- Register user handoff agent
- All specialized agents (normalize, validate, etc.)

### 6. Tool Descriptions Enhancement
**Priority: Medium**

- Review and enhance all tool descriptions in `toolsDescription.ts`
- Ensure descriptions are:
  - Clear and unambiguous
  - Include proper examples
  - Specify required vs optional parameters
  - Document expected return formats
  - Include error handling guidance
- Add descriptions for new tools:
  - Vector search tools
  - Conversation memory tools
  - Summarization tools
- Update tool descriptions to reflect conversation context usage
- Ensure consistency across all tool descriptions

### 7. Testing & Validation
**Priority: High**

- Create integration tests for:
  - Telegram bot with agent integration
  - Conversation memory system
  - Vector search functionality
  - Summarization accuracy
- Test conversation flow with multiple turns
- Validate token reduction through summarization
- Test vector search accuracy and performance
- Ensure all existing tests (902 tests) still pass
- Add end-to-end tests for complete user flows

## Technical Architecture

### New Components Needed

1. **ConversationMemoryService**
   - Store/retrieve conversation history
   - Implement summarization logic
   - Manage conversation context windows

2. **VectorSearchService**
   - Generate embeddings
   - Store vectors
   - Perform similarity searches
   - Retrieve relevant context

3. **TelegramBotEnhancements**
   - Enhanced message handler
   - Context injection middleware
   - Memory management per user

4. **Database Schema Updates**
   - Conversation history table
   - Vector embeddings table (if using pgvector)
   - Summary storage

## Success Criteria

1. ✅ All Supabase tables match new database structure
2. ✅ Vector search implemented and functional
3. ✅ Conversation memory maintains context across 10+ message turns
4. ✅ Summarization reduces token count by 40%+ while preserving context
5. ✅ All agents properly integrated with Telegram bot
6. ✅ Agent prompts updated and optimized
7. ✅ Tool descriptions clear and comprehensive
8. ✅ All existing tests pass
9. ✅ New integration tests added and passing

## Dependencies

- Supabase client configuration
- Vector database service (to be selected)
- Embedding model API access
- LLM API for summarization
- Telegram Bot API

## Risks & Mitigation

1. **Data Loss During Migration**
   - Mitigation: Full backup before migration, test on staging first

2. **Token Limit Issues**
   - Mitigation: Implement aggressive summarization, monitor token usage

3. **Vector Search Performance**
   - Mitigation: Proper indexing, caching, performance testing

4. **Context Loss in Summarization**
   - Mitigation: Careful prompt engineering, testing with real conversations

## Timeline Estimate

- Database Migration: 2-3 days
- Vector DB Integration: 3-4 days
- Conversation Memory: 4-5 days
- Telegram Bot Integration: 2-3 days
- Agent & Tool Updates: 2-3 days
- Testing: 3-4 days

**Total: ~18-22 days**

