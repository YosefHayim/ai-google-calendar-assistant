-- Migration: Add WhatsApp Users table for WhatsApp Cloud API integration
-- Date: 2026-01-10
-- Description: Creates the whatsapp_users table to store WhatsApp user data
--              and link WhatsApp accounts to existing app users

-- ============================================================================
-- 1. CREATE WHATSAPP_USERS TABLE
-- ============================================================================
-- Store WhatsApp user information and link to app users

CREATE TABLE IF NOT EXISTS whatsapp_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- WhatsApp identification
    whatsapp_phone TEXT NOT NULL UNIQUE,  -- WhatsApp phone number (with country code)
    whatsapp_name TEXT,                    -- Display name from WhatsApp profile

    -- Link to app user (optional - can be linked later)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_linked BOOLEAN DEFAULT FALSE,

    -- User preferences
    language_code TEXT DEFAULT 'en',

    -- Onboarding and state
    pending_email TEXT,                    -- Email awaiting verification for linking
    onboarding_step TEXT,                  -- Current onboarding step if any

    -- Activity tracking
    first_message_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    message_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

-- Index for looking up users by phone number (most common operation)
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_phone
ON whatsapp_users(whatsapp_phone);

-- Index for looking up users by linked app user
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_user_id
ON whatsapp_users(user_id) WHERE user_id IS NOT NULL;

-- Index for finding unlinked users
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_unlinked
ON whatsapp_users(is_linked) WHERE is_linked = FALSE;

-- Index for activity-based queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_last_activity
ON whatsapp_users(last_activity_at DESC);

-- ============================================================================
-- 3. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE whatsapp_users IS 'Stores WhatsApp user data for the WhatsApp Cloud API integration';

COMMENT ON COLUMN whatsapp_users.whatsapp_phone IS 'WhatsApp phone number including country code (e.g., 14155551234)';
COMMENT ON COLUMN whatsapp_users.whatsapp_name IS 'Display name from the user''s WhatsApp profile';
COMMENT ON COLUMN whatsapp_users.user_id IS 'Reference to the linked app user (NULL if not linked)';
COMMENT ON COLUMN whatsapp_users.is_linked IS 'Whether this WhatsApp account is linked to an app user';
COMMENT ON COLUMN whatsapp_users.language_code IS 'User''s preferred language for responses (ISO 639-1)';
COMMENT ON COLUMN whatsapp_users.pending_email IS 'Email address pending verification for account linking';
COMMENT ON COLUMN whatsapp_users.onboarding_step IS 'Current step in the onboarding flow';
COMMENT ON COLUMN whatsapp_users.first_message_at IS 'Timestamp of the first message received from this user';
COMMENT ON COLUMN whatsapp_users.message_count IS 'Total number of messages received from this user';

-- ============================================================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================

-- Create or replace the trigger function for updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_whatsapp_users_updated_at ON whatsapp_users;
CREATE TRIGGER trigger_whatsapp_users_updated_at
    BEFORE UPDATE ON whatsapp_users
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_users_updated_at();

-- ============================================================================
-- 5. ADD WHATSAPP TO CONVERSATION SOURCE ENUM (IF NOT EXISTS)
-- ============================================================================
-- Note: 'whatsapp' is already in the enum based on the types file,
-- but including this for safety

DO $$
BEGIN
    -- Check if 'whatsapp' value exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'whatsapp'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'conversation_source')
    ) THEN
        -- Add 'whatsapp' to the enum if it doesn't exist
        ALTER TYPE conversation_source ADD VALUE IF NOT EXISTS 'whatsapp';
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- Enum doesn't exist, skip this step
        NULL;
END $$;

-- ============================================================================
-- 6. CREATE ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE whatsapp_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own linked WhatsApp records
CREATE POLICY whatsapp_users_select_own ON whatsapp_users
    FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL);

-- Policy: Service role can do everything (for backend operations)
CREATE POLICY whatsapp_users_service_role ON whatsapp_users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users (limited)
GRANT SELECT ON whatsapp_users TO authenticated;

-- Grant full permissions to service role (for backend operations)
GRANT ALL ON whatsapp_users TO service_role;
