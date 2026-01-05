-- =============================================================================
-- Migration: 003_add_unique_constraints.sql
-- Description: Add missing unique constraints required for upsert operations
-- Issue: ON CONFLICT clauses fail without matching unique constraints
-- =============================================================================

-- Users table: unique on email
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
    END IF;
END $$;

-- OAuth tokens: unique on (user_id, provider)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'oauth_tokens_user_provider_unique'
    ) THEN
        ALTER TABLE oauth_tokens ADD CONSTRAINT oauth_tokens_user_provider_unique UNIQUE (user_id, provider);
    END IF;
END $$;

-- User calendars: unique on (user_id, calendar_id)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'user_calendars_user_calendar_unique'
    ) THEN
        ALTER TABLE user_calendars ADD CONSTRAINT user_calendars_user_calendar_unique UNIQUE (user_id, calendar_id);
    END IF;
END $$;

-- Telegram users: unique on telegram_user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'telegram_users_telegram_id_unique'
    ) THEN
        ALTER TABLE telegram_users ADD CONSTRAINT telegram_users_telegram_id_unique UNIQUE (telegram_user_id);
    END IF;
END $$;

-- Agent sessions: unique on (session_id, user_id, agent_name)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'agent_sessions_composite_unique'
    ) THEN
        ALTER TABLE agent_sessions ADD CONSTRAINT agent_sessions_composite_unique UNIQUE (session_id, user_id, agent_name);
    END IF;
END $$;

-- =============================================================================
-- End of migration
-- =============================================================================
