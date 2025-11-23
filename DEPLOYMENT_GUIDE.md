# Deployment Guide - Telegram Bot Enhancements

## Overview

This guide covers deploying the new features: vector search, conversation memory, and enhanced Telegram bot integration.

## Prerequisites

- Supabase project set up
- OpenAI API key configured (`OPEN_API_KEY` or `OPENAI_API_KEY`)
- Node.js and npm/pnpm installed
- Supabase CLI installed (optional, for local testing)

## Step 1: Apply Database Migrations

### Option A: Using Supabase Dashboard (Recommended for Production)

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project → **SQL Editor**
3. Apply migrations in this order:

```sql
-- 1. Enable pgvector extension
-- Copy and paste contents of: supabase/migrations/20250123000001_enable_pgvector.sql

-- 2. Create conversation memory tables
-- Copy and paste contents of: supabase/migrations/20250123000002_create_conversation_memory.sql

-- 3. Create vector search RPC functions
-- Copy and paste contents of: supabase/migrations/20250123000003_create_vector_search_functions.sql
```

### Option B: Using Supabase CLI

```bash
# Link to your project (if not already linked)
npx supabase link --project-ref your-project-ref

# Push all migrations
npx supabase db push
```

### Option C: Using Migration Script

```bash
# Make script executable
chmod +x scripts/apply-migrations.sh

# Apply migrations (local or remote)
./scripts/apply-migrations.sh --local   # For local Supabase
./scripts/apply-migrations.sh --remote  # For remote Supabase (with confirmation)
```

## Step 2: Verify Migrations

After applying migrations, verify the following:

```sql
-- Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'conversation_embeddings',
  'event_embeddings',
  'user_preference_embeddings',
  'conversation_messages',
  'conversation_summaries',
  'conversation_state'
);

-- Check if RPC functions exist
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'match_conversation_embeddings',
  'match_event_embeddings',
  'match_user_preference_embeddings'
);
```

## Step 3: Update Database Types

After migrations are applied, regenerate TypeScript types:

```bash
# For remote database
npx supabase gen types typescript --project-id your-project-id > database.types.ts

# For local database
npx supabase gen types typescript --local > database.types.ts
```

## Step 4: Configure Environment Variables

Ensure these environment variables are set:

```bash
# Required
OPEN_API_KEY=your_openai_api_key_here  # or OPENAI_API_KEY
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
TELEGRAM_BOT_ACCESS_TOKEN=your_telegram_bot_token

# Optional (for local development)
SUPABASE_URL=your_supabase_url
```

## Step 5: Test the Implementation

### Test Vector Search

```bash
npx ts-node -r tsconfig-paths/register scripts/test-vector-search.ts
```

**Expected Output:**
- ✅ Generated embedding with dimension: 1536
- ✅ Stored conversation embedding with ID: [number]
- ✅ Found [N] similar conversations

### Test Conversation Memory

```bash
npx ts-node -r tsconfig-paths/register scripts/test-conversation-memory.ts
```

**Expected Output:**
- ✅ Stored messages
- ✅ Retrieved context
- ✅ Created summary (after 3 messages)

### Test Telegram Integration

```bash
npx ts-node -r tsconfig-paths/register scripts/test-telegram-integration.ts
```

**Expected Output:**
- ✅ All integration tests pass

### Run Integration Tests

```bash
npm test -- __tests__/integration/
```

## Step 6: Deploy Application

### Start the Telegram Bot

```bash
npm start
# or
npm run dev
```

The bot will:
- Automatically store conversation messages
- Generate embeddings for semantic search
- Summarize conversations every 3 messages
- Use context from previous conversations

## Troubleshooting

### Issue: "Could not find the table 'public.conversation_embeddings'"

**Solution:** Migrations haven't been applied. Follow Step 1.

### Issue: "OpenAI API key not found"

**Solution:** Set `OPEN_API_KEY` or `OPENAI_API_KEY` environment variable.

### Issue: "RPC function not found"

**Solution:** The RPC functions migration (20250123000003) hasn't been applied. The service will fall back to basic queries, but vector similarity search won't work optimally.

### Issue: Vector storage fails

**Solution:** Ensure pgvector extension is enabled. Check with:
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

If not enabled, run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Performance Considerations

1. **IVFFlat Index**: The migration creates IVFFlat indexes with `lists = 100`. For large datasets (>100K vectors), consider increasing this value.

2. **Embedding Generation**: Each message generates an embedding via OpenAI API. This adds latency (~200-500ms per message). Consider:
   - Batching embeddings
   - Using async processing
   - Caching common queries

3. **Summarization**: Summarization happens every 3 messages. This uses OpenAI's chat API. Monitor token usage.

## Monitoring

Monitor these metrics:
- Vector search query performance
- Embedding generation latency
- Summarization frequency and token usage
- Conversation context retrieval time
- Database query performance

## Rollback Plan

If you need to rollback:

```bash
# Rollback migrations (if script exists)
./scripts/rollback-migrations.sh

# Or manually drop tables
DROP TABLE IF EXISTS public.conversation_embeddings CASCADE;
DROP TABLE IF EXISTS public.event_embeddings CASCADE;
DROP TABLE IF EXISTS public.user_preference_embeddings CASCADE;
DROP TABLE IF EXISTS public.conversation_messages CASCADE;
DROP TABLE IF EXISTS public.conversation_summaries CASCADE;
DROP TABLE IF EXISTS public.conversation_state CASCADE;

# Drop functions
DROP FUNCTION IF EXISTS match_conversation_embeddings CASCADE;
DROP FUNCTION IF EXISTS match_event_embeddings CASCADE;
DROP FUNCTION IF EXISTS match_user_preference_embeddings CASCADE;
```

## Next Steps

1. Monitor production usage
2. Optimize vector indexes based on query patterns
3. Fine-tune summarization prompts
4. Add analytics for conversation patterns
5. Implement rate limiting for embedding generation

