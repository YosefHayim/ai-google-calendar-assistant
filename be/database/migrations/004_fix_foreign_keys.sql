-- =============================================================================
-- Migration: 004_fix_foreign_keys.sql
-- Description: Drop foreign key constraints that reference the users table
-- Issue: Tables use Supabase Auth user IDs, but FK references custom users table
-- Solution: Remove FK constraints to allow Supabase Auth user IDs
-- =============================================================================

-- Drop foreign key on agent_sessions
ALTER TABLE IF EXISTS agent_sessions 
DROP CONSTRAINT IF EXISTS agent_sessions_user_id_fkey;

-- Drop foreign key on conversations (if exists)
ALTER TABLE IF EXISTS conversations 
DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;

-- Drop foreign key on conversation_embeddings (if exists)  
ALTER TABLE IF EXISTS conversation_embeddings 
DROP CONSTRAINT IF EXISTS conversation_embeddings_user_id_fkey;

-- Drop foreign key on conversation_summaries (if exists)
ALTER TABLE IF EXISTS conversation_summaries 
DROP CONSTRAINT IF EXISTS conversation_summaries_user_id_fkey;

-- Drop foreign key on gap_candidates (if exists)
ALTER TABLE IF EXISTS gap_candidates 
DROP CONSTRAINT IF EXISTS gap_candidates_user_id_fkey;

-- Drop foreign key on gap_recovery_settings (if exists)
ALTER TABLE IF EXISTS gap_recovery_settings 
DROP CONSTRAINT IF EXISTS gap_recovery_settings_user_id_fkey;

-- Drop foreign key on user_preferences (if exists)
ALTER TABLE IF EXISTS user_preferences 
DROP CONSTRAINT IF EXISTS user_preferences_user_id_fkey;

-- Drop foreign key on audit_logs (if exists)
ALTER TABLE IF EXISTS audit_logs 
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- =============================================================================
-- End of migration
-- =============================================================================
