-- Migration: Add slack_workspaces table
-- Description: Store OAuth tokens for each installed Slack workspace (public distribution)

-- STEP 1: Create slack_workspaces table
CREATE TABLE IF NOT EXISTS slack_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL UNIQUE,
  team_name TEXT,
  bot_token TEXT NOT NULL,
  bot_user_id TEXT,
  app_id TEXT,
  scope TEXT,
  authed_user_id TEXT,
  enterprise_id TEXT,
  enterprise_name TEXT,
  is_enterprise_install BOOLEAN DEFAULT FALSE,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  installed_by_user_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_slack_workspaces_team_id ON slack_workspaces(team_id);
CREATE INDEX IF NOT EXISTS idx_slack_workspaces_is_active ON slack_workspaces(is_active);

-- STEP 3: Enable RLS
ALTER TABLE slack_workspaces ENABLE ROW LEVEL SECURITY;

-- STEP 4: RLS Policies - service role only (tokens are sensitive)
CREATE POLICY "Service role has full access to slack_workspaces"
ON slack_workspaces FOR ALL
USING (auth.role() = 'service_role');

-- STEP 5: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_slack_workspaces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_slack_workspaces_updated_at ON slack_workspaces;
CREATE TRIGGER trigger_slack_workspaces_updated_at
BEFORE UPDATE ON slack_workspaces
FOR EACH ROW
EXECUTE FUNCTION update_slack_workspaces_updated_at();
