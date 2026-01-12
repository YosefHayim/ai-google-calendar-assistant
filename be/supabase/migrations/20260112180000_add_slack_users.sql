-- Migration: Add Slack Users Table
-- Date: 2026-01-12
-- Description: Add slack_users table for Slack bot integration

-- =====================================================
-- STEP 1: Create slack_users table
-- =====================================================
CREATE TABLE IF NOT EXISTS slack_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    slack_user_id TEXT NOT NULL UNIQUE,
    slack_team_id TEXT NOT NULL,
    slack_username TEXT,
    first_name TEXT,
    is_linked BOOLEAN DEFAULT false,
    pending_email TEXT,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 2: Create indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_slack_users_user_id ON slack_users(user_id);
CREATE INDEX IF NOT EXISTS idx_slack_users_slack_user_id ON slack_users(slack_user_id);
CREATE INDEX IF NOT EXISTS idx_slack_users_team_id ON slack_users(slack_team_id);

-- =====================================================
-- STEP 3: Enable RLS
-- =====================================================
ALTER TABLE slack_users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Create RLS policies
-- =====================================================
CREATE POLICY "Users can view their own slack links"
    ON slack_users FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own slack links"
    ON slack_users FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to slack_users"
    ON slack_users FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- STEP 5: Add update trigger for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_slack_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_slack_users_updated_at ON slack_users;
CREATE TRIGGER trigger_slack_users_updated_at
    BEFORE UPDATE ON slack_users
    FOR EACH ROW
    EXECUTE FUNCTION update_slack_users_updated_at();

-- =====================================================
-- STEP 6: Update conversations source enum (if using enum)
-- =====================================================
-- Add 'slack' to the source options for conversations
-- This assumes source is a TEXT column, not an enum
-- If it's an enum, you'll need: ALTER TYPE conversation_source ADD VALUE IF NOT EXISTS 'slack';
