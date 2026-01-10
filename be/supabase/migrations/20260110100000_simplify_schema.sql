-- Migration: Simplify Database Schema
-- Date: 2026-01-10
-- Description: Remove unused tables and consolidate schema for minimalistic architecture

-- =====================================================
-- STEP 1: Add preferences JSONB column to users table
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Migrate existing user_preferences to users.preferences JSON
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT user_id, preference_key, preference_value FROM user_preferences
  LOOP
    UPDATE users
    SET preferences = preferences || jsonb_build_object(r.preference_key, r.preference_value)
    WHERE id = r.user_id;
  END LOOP;
END $$;

-- =====================================================
-- STEP 2: Drop unused/redundant tables
-- =====================================================

-- Drop agent_sessions (unused - no code references)
DROP TABLE IF EXISTS agent_sessions CASCADE;

-- Drop conversation_embeddings (unused - future feature)
DROP TABLE IF EXISTS conversation_embeddings CASCADE;

-- Drop conversation_summaries (summary already stored in conversations.summary)
DROP TABLE IF EXISTS conversation_summaries CASCADE;

-- Drop user_preferences (migrated to users.preferences JSONB)
DROP TABLE IF EXISTS user_preferences CASCADE;

-- Drop gap analysis feature tables (optional feature not actively used)
DROP TABLE IF EXISTS gap_candidates CASCADE;
DROP TABLE IF EXISTS gap_recovery_settings CASCADE;

-- Drop credit_packs (not actively selling credits)
DROP TABLE IF EXISTS credit_packs CASCADE;

-- Drop usage_records (detailed logging not needed, use subscriptions.ai_interactions_used)
DROP TABLE IF EXISTS usage_records CASCADE;

-- Drop payment_history (use LemonSqueezy dashboard instead)
DROP TABLE IF EXISTS payment_history CASCADE;

-- Drop audit_logs (not required for compliance currently)
DROP TABLE IF EXISTS audit_logs CASCADE;

-- =====================================================
-- STEP 3: Drop related functions if they exist
-- =====================================================
DROP FUNCTION IF EXISTS match_user_preference_embeddings CASCADE;
DROP FUNCTION IF EXISTS record_usage CASCADE;

-- =====================================================
-- STEP 4: Clean up any orphaned policies
-- =====================================================
-- Policies are automatically dropped with their tables

-- =====================================================
-- VERIFICATION: List remaining tables
-- =====================================================
-- After this migration, you should have these tables:
-- 1. users (with new preferences JSONB column)
-- 2. oauth_tokens
-- 3. user_calendars
-- 4. conversations
-- 5. conversation_messages
-- 6. subscriptions
-- 7. plans
-- 8. lemonsqueezy_webhook_events
-- 9. telegram_users
-- 10. whatsapp_users
