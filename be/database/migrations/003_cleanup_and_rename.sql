-- =============================================================================
-- AI Google Calendar Assistant - Cleanup and Rename Migration
-- Version: 1.0.0
-- Description: Drops old legacy tables and renames _new tables to final names
-- =============================================================================

-- IMPORTANT: Run this ONLY after verifying data migration was successful!
-- Check the verification counts from 002_data_migration.sql before proceeding.

-- Note: Not using explicit BEGIN/COMMIT because DO blocks with exception 
-- handlers cannot run inside a transaction block in Supabase SQL Editor.

-- =============================================================================
-- STEP 1: Drop old legacy tables (these are replaced by new schema)
-- =============================================================================

-- Drop dependent objects first (views, functions that reference old tables)
DROP FUNCTION IF EXISTS match_conversation_embeddings(vector(1536), integer, integer, text) CASCADE;
DROP FUNCTION IF EXISTS match_conversation_embeddings_web(vector(1536), integer, text) CASCADE;
DROP FUNCTION IF EXISTS match_event_embeddings(vector(1536), integer, integer) CASCADE;
DROP FUNCTION IF EXISTS match_user_preference_embeddings(vector(1536), integer, integer) CASCADE;
DROP FUNCTION IF EXISTS get_or_create_conversation(bigint, bigint, text) CASCADE;

-- Drop old tables (order matters due to potential FK constraints)
DROP TABLE IF EXISTS conversation_summaries CASCADE;
DROP TABLE IF EXISTS conversation_embeddings CASCADE;
DROP TABLE IF EXISTS conversation_state CASCADE;
DROP TABLE IF EXISTS agent_sessions CASCADE;
DROP TABLE IF EXISTS gap_recovery_settings CASCADE;
DROP TABLE IF EXISTS gap_candidates CASCADE;
DROP TABLE IF EXISTS calendar_categories CASCADE;
DROP TABLE IF EXISTS user_telegram_links CASCADE;
DROP TABLE IF EXISTS user_calendar_tokens CASCADE;

-- Also drop any _v suffix tables if they exist (from previous migrations)
DROP TABLE IF EXISTS conversation_summaries_v CASCADE;
DROP TABLE IF EXISTS conversation_embeddings_v CASCADE;
DROP TABLE IF EXISTS conversation_state_v CASCADE;
DROP TABLE IF EXISTS agent_sessions_v CASCADE;
DROP TABLE IF EXISTS gap_recovery_settings_v CASCADE;
DROP TABLE IF EXISTS gap_candidates_v CASCADE;

-- =============================================================================
-- STEP 2: Rename _new tables to final names
-- =============================================================================

-- Rename conversation_messages_new -> conversation_messages
ALTER TABLE IF EXISTS conversation_messages_new RENAME TO conversation_messages;
ALTER INDEX IF EXISTS idx_conv_messages_new_conversation_id RENAME TO idx_conv_messages_conversation_id;
ALTER INDEX IF EXISTS idx_conv_messages_new_created_at RENAME TO idx_conv_messages_created_at;
ALTER INDEX IF EXISTS idx_conv_messages_new_role RENAME TO idx_conv_messages_role;

-- Rename conversation_embeddings_new -> conversation_embeddings
ALTER TABLE IF EXISTS conversation_embeddings_new RENAME TO conversation_embeddings;
ALTER INDEX IF EXISTS idx_conv_embeddings_new_message_id RENAME TO idx_conv_embeddings_message_id;
ALTER INDEX IF EXISTS idx_conv_embeddings_new_conversation_id RENAME TO idx_conv_embeddings_conversation_id;
ALTER INDEX IF EXISTS idx_conv_embeddings_new_hnsw RENAME TO idx_conv_embeddings_hnsw;

-- Rename conversation_summaries_new -> conversation_summaries
ALTER TABLE IF EXISTS conversation_summaries_new RENAME TO conversation_summaries;
ALTER INDEX IF EXISTS idx_conv_summaries_new_conversation_id RENAME TO idx_conv_summaries_conversation_id;
ALTER INDEX IF EXISTS idx_conv_summaries_new_created_at RENAME TO idx_conv_summaries_created_at;

-- Rename agent_sessions_new -> agent_sessions
ALTER TABLE IF EXISTS agent_sessions_new RENAME TO agent_sessions;
ALTER INDEX IF EXISTS idx_agent_sessions_new_user_id RENAME TO idx_agent_sessions_user_id;
ALTER INDEX IF EXISTS idx_agent_sessions_new_session_id RENAME TO idx_agent_sessions_session_id;
ALTER INDEX IF EXISTS idx_agent_sessions_new_expires_at RENAME TO idx_agent_sessions_expires_at;

-- Rename gap_candidates_new -> gap_candidates
ALTER TABLE IF EXISTS gap_candidates_new RENAME TO gap_candidates;
ALTER INDEX IF EXISTS idx_gap_candidates_new_user_id RENAME TO idx_gap_candidates_user_id;
ALTER INDEX IF EXISTS idx_gap_candidates_new_status RENAME TO idx_gap_candidates_status;
ALTER INDEX IF EXISTS idx_gap_candidates_new_gap_date RENAME TO idx_gap_candidates_gap_date;

-- Rename gap_recovery_settings_new -> gap_recovery_settings
ALTER TABLE IF EXISTS gap_recovery_settings_new RENAME TO gap_recovery_settings;
ALTER INDEX IF EXISTS idx_gap_settings_new_user_id RENAME TO idx_gap_settings_user_id;

-- =============================================================================
-- STEP 3: Rename constraints to match new table names (with error handling)
-- =============================================================================
-- Note: Constraint names may vary based on how PostgreSQL auto-generated them.
-- We wrap each rename in a DO block to handle cases where constraint doesn't exist.

DO $$ BEGIN
    ALTER TABLE conversation_messages 
        RENAME CONSTRAINT conversation_messages_new_conversation_id_fkey 
        TO conversation_messages_conversation_id_fkey;
EXCEPTION WHEN undefined_object THEN 
    RAISE NOTICE 'Constraint conversation_messages_new_conversation_id_fkey does not exist, skipping';
END $$;

DO $$ BEGIN
    ALTER TABLE conversation_embeddings 
        RENAME CONSTRAINT conversation_embeddings_new_message_id_fkey 
        TO conversation_embeddings_message_id_fkey;
EXCEPTION WHEN undefined_object THEN 
    RAISE NOTICE 'Constraint conversation_embeddings_new_message_id_fkey does not exist, skipping';
END $$;

DO $$ BEGIN
    ALTER TABLE conversation_embeddings 
        RENAME CONSTRAINT conversation_embeddings_new_conversation_id_fkey 
        TO conversation_embeddings_conversation_id_fkey;
EXCEPTION WHEN undefined_object THEN 
    RAISE NOTICE 'Constraint conversation_embeddings_new_conversation_id_fkey does not exist, skipping';
END $$;

DO $$ BEGIN
    ALTER TABLE conversation_summaries 
        RENAME CONSTRAINT conversation_summaries_new_conversation_id_fkey 
        TO conversation_summaries_conversation_id_fkey;
EXCEPTION WHEN undefined_object THEN 
    RAISE NOTICE 'Constraint conversation_summaries_new_conversation_id_fkey does not exist, skipping';
END $$;

DO $$ BEGIN
    ALTER TABLE agent_sessions 
        RENAME CONSTRAINT agent_sessions_new_user_id_fkey 
        TO agent_sessions_user_id_fkey;
EXCEPTION WHEN undefined_object THEN 
    RAISE NOTICE 'Constraint agent_sessions_new_user_id_fkey does not exist, skipping';
END $$;

DO $$ BEGIN
    ALTER TABLE gap_candidates 
        RENAME CONSTRAINT gap_candidates_new_user_id_fkey 
        TO gap_candidates_user_id_fkey;
EXCEPTION WHEN undefined_object THEN 
    RAISE NOTICE 'Constraint gap_candidates_new_user_id_fkey does not exist, skipping';
END $$;

DO $$ BEGIN
    ALTER TABLE gap_recovery_settings 
        RENAME CONSTRAINT gap_recovery_settings_new_user_id_fkey 
        TO gap_recovery_settings_user_id_fkey;
EXCEPTION WHEN undefined_object THEN 
    RAISE NOTICE 'Constraint gap_recovery_settings_new_user_id_fkey does not exist, skipping';
END $$;

-- =============================================================================
-- STEP 4: Recreate functions with new table names
-- =============================================================================

-- Function: Match conversation embeddings (for Telegram)
CREATE OR REPLACE FUNCTION match_conversation_embeddings(
    query_embedding vector(1536),
    match_count int DEFAULT 5,
    p_telegram_user_id bigint DEFAULT NULL,
    p_source text DEFAULT 'telegram'
)
RETURNS TABLE (
    id uuid,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.id,
        ce.content,
        1 - (ce.embedding <=> query_embedding) as similarity
    FROM conversation_embeddings ce
    JOIN conversations c ON ce.conversation_id = c.id
    LEFT JOIN telegram_users tu ON c.user_id = tu.user_id
    WHERE 
        ce.embedding IS NOT NULL
        AND (p_telegram_user_id IS NULL OR tu.telegram_user_id = p_telegram_user_id)
        AND (p_source IS NULL OR c.source::text = p_source)
    ORDER BY ce.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function: Match conversation embeddings (for Web)
CREATE OR REPLACE FUNCTION match_conversation_embeddings_web(
    query_embedding vector(1536),
    match_count int DEFAULT 5,
    p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    content text,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.id,
        ce.content,
        1 - (ce.embedding <=> query_embedding) as similarity
    FROM conversation_embeddings ce
    JOIN conversations c ON ce.conversation_id = c.id
    WHERE 
        ce.embedding IS NOT NULL
        AND (p_user_id IS NULL OR c.user_id = p_user_id)
        AND c.source = 'web'
    ORDER BY ce.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function: Get or create conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_user_id uuid,
    p_telegram_chat_id bigint DEFAULT NULL,
    p_source conversation_source DEFAULT 'web'
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    v_conversation_id uuid;
BEGIN
    -- Try to find existing active conversation
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE user_id = p_user_id
        AND source = p_source
        AND (p_telegram_chat_id IS NULL OR telegram_chat_id = p_telegram_chat_id)
        AND is_active = true
    ORDER BY updated_at DESC
    LIMIT 1;
    
    -- Create new if not found
    IF v_conversation_id IS NULL THEN
        INSERT INTO conversations (user_id, telegram_chat_id, source)
        VALUES (p_user_id, p_telegram_chat_id, p_source)
        RETURNING id INTO v_conversation_id;
    END IF;
    
    RETURN v_conversation_id;
END;
$$;

-- Function: Cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM agent_sessions
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function: Cleanup old pending gaps
CREATE OR REPLACE FUNCTION cleanup_old_pending_gaps(days_old integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    updated_count integer;
BEGIN
    UPDATE gap_candidates
    SET status = 'expired'
    WHERE status = 'pending'
        AND gap_date < CURRENT_DATE - days_old;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

-- =============================================================================
-- STEP 5: Verify final table structure
-- =============================================================================

-- Final verification: List all tables in public schema
DO $$
DECLARE
    table_record RECORD;
BEGIN
    RAISE NOTICE '=== Final Table Structure ===';
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        RAISE NOTICE 'Table: %', table_record.tablename;
    END LOOP;
END $$;

-- =============================================================================
-- Post-migration reminder
-- =============================================================================
-- After running this migration:
-- 1. Regenerate TypeScript types:
--    npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > database.types.ts
-- 2. Update backend code to use new table/column names
-- 3. Test all endpoints thoroughly
-- =============================================================================
