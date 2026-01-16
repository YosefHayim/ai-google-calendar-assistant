-- Feature Flags table for runtime feature toggles
-- Supports: global on/off, per-tier access, per-user overrides, gradual rollout

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT false NOT NULL,
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  allowed_tiers TEXT[] DEFAULT '{}',
  allowed_user_ids UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);

-- Index for enabled flags lookup
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled) WHERE enabled = true;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();

-- RLS Policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage flags
CREATE POLICY "Admins can manage feature flags"
  ON feature_flags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow authenticated users to read enabled flags
CREATE POLICY "Authenticated users can read feature flags"
  ON feature_flags
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert some default feature flags
INSERT INTO feature_flags (key, name, description, enabled, allowed_tiers) VALUES
  ('voice_mode', 'Voice Mode', 'Enable voice input/output in the chat interface', true, '{"pro", "enterprise"}'),
  ('gap_recovery', 'Gap Recovery', 'Enable AI-powered gap detection and recovery', true, '{}'),
  ('advanced_analytics', 'Advanced Analytics', 'Enable advanced calendar analytics dashboard', true, '{"pro", "enterprise"}'),
  ('telegram_bot', 'Telegram Bot', 'Enable Telegram bot integration', true, '{}'),
  ('whatsapp_bot', 'WhatsApp Bot', 'Enable WhatsApp bot integration (beta)', false, '{}'),
  ('ai_insights', 'AI Insights', 'Enable AI-generated calendar insights', true, '{"pro", "enterprise"}'),
  ('multi_calendar', 'Multi Calendar', 'Enable multi-calendar support', true, '{}')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE feature_flags IS 'Runtime feature toggles for controlling feature availability';
COMMENT ON COLUMN feature_flags.key IS 'Unique identifier used in code (snake_case)';
COMMENT ON COLUMN feature_flags.rollout_percentage IS 'Percentage of users who see this feature (0-100)';
COMMENT ON COLUMN feature_flags.allowed_tiers IS 'Subscription tiers that can access this feature (empty = all)';
COMMENT ON COLUMN feature_flags.allowed_user_ids IS 'Specific user IDs that can access this feature regardless of tier';
COMMENT ON COLUMN feature_flags.metadata IS 'Additional configuration (variants, A/B test config, etc.)';
