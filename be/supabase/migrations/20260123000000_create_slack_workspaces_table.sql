-- Migration: Create slack_workspaces table for Slack OAuth integration
-- This table stores workspace-level OAuth tokens and configuration
-- for multi-workspace Slack bot installations

CREATE TABLE slack_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id TEXT NOT NULL UNIQUE,
  team_name TEXT,
  bot_token TEXT NOT NULL,
  bot_user_id TEXT,
  app_id TEXT,
  scope TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  authed_user_id TEXT,
  enterprise_id TEXT,
  enterprise_name TEXT,
  is_enterprise_install BOOLEAN DEFAULT false,
  installed_by_user_id TEXT,
  webhook_url TEXT,
  webhook_channel TEXT,
  webhook_channel_id TEXT,
  webhook_configuration_url TEXT,
  installed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_slack_workspaces_team_id ON slack_workspaces(team_id);
CREATE INDEX idx_slack_workspaces_is_active ON slack_workspaces(is_active) WHERE is_active = true;
CREATE INDEX idx_slack_workspaces_enterprise_id ON slack_workspaces(enterprise_id) WHERE enterprise_id IS NOT NULL;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_slack_workspaces_updated_at
  BEFORE UPDATE ON slack_workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE slack_workspaces ENABLE ROW LEVEL SECURITY;

-- Service role can manage all workspace tokens (backend-only operations)
CREATE POLICY "Service role can manage slack_workspaces"
  ON slack_workspaces FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE slack_workspaces IS 'Stores Slack workspace OAuth tokens and configuration for multi-tenant bot installations';
COMMENT ON COLUMN slack_workspaces.team_id IS 'Slack workspace/team ID (Txxxxx format)';
COMMENT ON COLUMN slack_workspaces.bot_token IS 'Encrypted bot OAuth token for API calls';
COMMENT ON COLUMN slack_workspaces.is_active IS 'Whether this workspace installation is active';
COMMENT ON COLUMN slack_workspaces.is_enterprise_install IS 'Whether this is an enterprise grid installation';
