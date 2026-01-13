-- Migration: Add webhook columns to slack_workspaces
-- Description: Store incoming webhook URLs for each installed Slack workspace

-- STEP 1: Add webhook columns
ALTER TABLE slack_workspaces
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_channel TEXT,
ADD COLUMN IF NOT EXISTS webhook_channel_id TEXT,
ADD COLUMN IF NOT EXISTS webhook_configuration_url TEXT;

-- STEP 2: Add comment for documentation
COMMENT ON COLUMN slack_workspaces.webhook_url IS 'Incoming webhook URL for posting messages to Slack';
COMMENT ON COLUMN slack_workspaces.webhook_channel IS 'Default channel name for webhook messages';
COMMENT ON COLUMN slack_workspaces.webhook_channel_id IS 'Default channel ID for webhook messages';
COMMENT ON COLUMN slack_workspaces.webhook_configuration_url IS 'URL to configure the webhook in Slack';
