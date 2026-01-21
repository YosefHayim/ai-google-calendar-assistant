-- Migration: Create slack_users table for Slack integration
-- This table stores user mappings between Ally users and Slack users
-- for cross-platform conversation continuity and user identification

CREATE TABLE slack_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slack_user_id TEXT NOT NULL,
  slack_team_id TEXT,
  slack_username TEXT,
  first_name TEXT,
  is_linked BOOLEAN NOT NULL DEFAULT true,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Ensure one Slack user per Ally user per team
  UNIQUE(user_id, slack_team_id)
);

-- Indexes for performance
CREATE INDEX idx_slack_users_user_id ON slack_users(user_id);
CREATE INDEX idx_slack_users_slack_user_id ON slack_users(slack_user_id);
CREATE INDEX idx_slack_users_slack_team_id ON slack_users(slack_team_id);
CREATE INDEX idx_slack_users_is_linked ON slack_users(is_linked) WHERE is_linked = true;
CREATE INDEX idx_slack_users_last_activity ON slack_users(last_activity_at DESC);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_slack_users_updated_at
  BEFORE UPDATE ON slack_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE slack_users ENABLE ROW LEVEL SECURITY;

-- Users can read their own Slack connections
CREATE POLICY "Users can read own slack_users"
  ON slack_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all Slack user connections (for backend operations)
CREATE POLICY "Service role can manage slack_users"
  ON slack_users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE slack_users IS 'Maps Ally users to their Slack identities for cross-platform integration';
COMMENT ON COLUMN slack_users.user_id IS 'Reference to auth.users table';
COMMENT ON COLUMN slack_users.slack_user_id IS 'Slack user ID (Uxxxxx format)';
COMMENT ON COLUMN slack_users.slack_team_id IS 'Slack workspace/team ID';
COMMENT ON COLUMN slack_users.is_linked IS 'Whether this Slack user is actively linked to the Ally account';