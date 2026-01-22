-- ============================================================================
-- Migration: Create user_contacts table for storing mined calendar attendees
-- Description: Stores contacts extracted from user's calendar events for:
--   1. LLM context - helps AI find attendee emails when user says "invite John"
--   2. Analytics - shows meeting frequency, duration stats per contact
--   3. Smart suggestions - auto-complete for event attendees
-- ============================================================================

-- Create the user_contacts table
CREATE TABLE IF NOT EXISTS user_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Contact identity
  email TEXT NOT NULL,
  display_name TEXT,
  
  -- Tracking timestamps
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Meeting statistics
  meeting_count INTEGER NOT NULL DEFAULT 1,
  total_duration_minutes INTEGER DEFAULT 0,
  
  -- Categorization
  event_types TEXT[] DEFAULT '{}',           -- e.g., ['meeting', 'call', '1:1', 'standup']
  common_summaries TEXT[] DEFAULT '{}',      -- frequent event titles with this contact (top 5)
  
  -- Role tracking
  is_organizer_count INTEGER DEFAULT 0,      -- times they organized events with user
  is_attendee_count INTEGER DEFAULT 0,       -- times they were an attendee
  
  -- User preferences
  is_hidden BOOLEAN DEFAULT FALSE,           -- user can hide contacts they don't want
  is_favorite BOOLEAN DEFAULT FALSE,         -- user can mark frequent contacts
  
  -- Flexible metadata storage
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user-email pair
  UNIQUE(user_id, email)
);

-- Add comment for documentation
COMMENT ON TABLE user_contacts IS 'Stores contacts mined from calendar events for LLM context and analytics';
COMMENT ON COLUMN user_contacts.meeting_count IS 'Total number of events shared with this contact';
COMMENT ON COLUMN user_contacts.total_duration_minutes IS 'Sum of all meeting durations with this contact';
COMMENT ON COLUMN user_contacts.event_types IS 'Array of detected event types (meeting, call, 1:1, etc)';
COMMENT ON COLUMN user_contacts.common_summaries IS 'Top 5 most frequent event titles with this contact';
COMMENT ON COLUMN user_contacts.is_hidden IS 'User can hide contacts from suggestions and analytics';

-- ============================================================================
-- Indexes for fast lookups
-- ============================================================================

-- Primary lookup: get all contacts for a user
CREATE INDEX idx_user_contacts_user_id ON user_contacts(user_id);

-- Search by email (for deduplication and lookups)
CREATE INDEX idx_user_contacts_email ON user_contacts(email);

-- Get top contacts by meeting count (for analytics and suggestions)
CREATE INDEX idx_user_contacts_meeting_count ON user_contacts(user_id, meeting_count DESC);

-- Get recent contacts (for "recently met" suggestions)
CREATE INDEX idx_user_contacts_last_seen ON user_contacts(user_id, last_seen_at DESC);

-- Filter visible contacts (exclude hidden)
CREATE INDEX idx_user_contacts_visible ON user_contacts(user_id, is_hidden) WHERE is_hidden = FALSE;

-- Full-text search on display_name and email for LLM queries
CREATE INDEX idx_user_contacts_search ON user_contacts 
  USING gin(to_tsvector('english', COALESCE(display_name, '') || ' ' || email));

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE user_contacts ENABLE ROW LEVEL SECURITY;

-- Users can only view their own contacts
CREATE POLICY "Users can view own contacts"
  ON user_contacts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own contacts
CREATE POLICY "Users can insert own contacts"
  ON user_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own contacts
CREATE POLICY "Users can update own contacts"
  ON user_contacts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own contacts
CREATE POLICY "Users can delete own contacts"
  ON user_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can do anything (for backend operations)
CREATE POLICY "Service role full access"
  ON user_contacts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- User preferences table addition for contact mining opt-out
-- ============================================================================

-- Add contact_mining_enabled column to users table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'contact_mining_enabled'
  ) THEN
    ALTER TABLE users ADD COLUMN contact_mining_enabled BOOLEAN DEFAULT TRUE;
    COMMENT ON COLUMN users.contact_mining_enabled IS 'Whether to mine contacts from calendar events';
  END IF;
END $$;

-- ============================================================================
-- Trigger to auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_contacts_updated_at
  BEFORE UPDATE ON user_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_contacts_updated_at();
