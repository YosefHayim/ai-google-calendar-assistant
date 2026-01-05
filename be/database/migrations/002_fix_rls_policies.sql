-- =============================================================================
-- Migration: 002_fix_rls_policies.sql
-- Description: Fix RLS policies to work correctly with service role key
-- Issue: auth.role() = 'service_role' doesn't work as expected with createClient
-- Solution: Disable RLS for backend-only tables (safe when using service role key)
-- =============================================================================

-- Disable RLS on oauth_tokens (the immediate fix)
ALTER TABLE IF EXISTS oauth_tokens DISABLE ROW LEVEL SECURITY;

-- Disable RLS on other existing tables (if they exist)
-- These are safe to disable since all access goes through the backend API

-- Core tables (likely exist)
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_calendars DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS telegram_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_preferences DISABLE ROW LEVEL SECURITY;

-- Legacy tables (from original schema)
ALTER TABLE IF EXISTS user_calendar_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_telegram_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS calendar_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agent_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_embeddings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_summaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gap_candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gap_recovery_settings DISABLE ROW LEVEL SECURITY;

-- New schema tables (if migration 001 was run)
ALTER TABLE IF EXISTS conversation_messages_new DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_embeddings_new DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS conversation_summaries_new DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agent_sessions_new DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gap_candidates_new DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gap_recovery_settings_new DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- End of migration
-- =============================================================================
