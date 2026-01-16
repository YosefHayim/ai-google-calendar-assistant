-- Feature Flag Enhancements Migration
-- Adds: audit logging, environment support, webhook configuration

-- =====================================================
-- 1. Environment Support for Feature Flags
-- =====================================================

-- Create environment enum
CREATE TYPE feature_flag_environment AS ENUM ('development', 'staging', 'production', 'all');

-- Add environment column to feature_flags
ALTER TABLE feature_flags 
ADD COLUMN IF NOT EXISTS environment feature_flag_environment DEFAULT 'all' NOT NULL;

-- Index for environment filtering
CREATE INDEX IF NOT EXISTS idx_feature_flags_environment ON feature_flags(environment);

-- =====================================================
-- 2. Audit Logs for Feature Flag Changes
-- =====================================================

-- Create audit action enum
CREATE TYPE feature_flag_audit_action AS ENUM (
  'created',
  'updated',
  'deleted',
  'enabled',
  'disabled',
  'rollout_changed',
  'tiers_changed',
  'user_override_added',
  'user_override_removed',
  'environment_changed'
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS feature_flag_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID REFERENCES feature_flags(id) ON DELETE SET NULL,
  feature_flag_key VARCHAR(255) NOT NULL,
  action feature_flag_audit_action NOT NULL,
  actor_id UUID NOT NULL,
  actor_email VARCHAR(255),
  previous_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_ff_audit_logs_flag_id ON feature_flag_audit_logs(feature_flag_id);
CREATE INDEX IF NOT EXISTS idx_ff_audit_logs_flag_key ON feature_flag_audit_logs(feature_flag_key);
CREATE INDEX IF NOT EXISTS idx_ff_audit_logs_actor_id ON feature_flag_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_ff_audit_logs_action ON feature_flag_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_ff_audit_logs_created_at ON feature_flag_audit_logs(created_at DESC);

-- =====================================================
-- 3. Webhook Configuration for Flag Changes
-- =====================================================

-- Create webhook table
CREATE TABLE IF NOT EXISTS feature_flag_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  secret VARCHAR(255),
  events TEXT[] DEFAULT '{}' NOT NULL,
  headers JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true NOT NULL,
  retry_count INTEGER DEFAULT 3,
  timeout_ms INTEGER DEFAULT 5000,
  last_triggered_at TIMESTAMPTZ,
  last_status_code INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger to auto-update updated_at for webhooks
CREATE TRIGGER trigger_feature_flag_webhooks_updated_at
  BEFORE UPDATE ON feature_flag_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();

-- Webhook delivery logs
CREATE TABLE IF NOT EXISTS feature_flag_webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES feature_flag_webhooks(id) ON DELETE CASCADE,
  feature_flag_id UUID REFERENCES feature_flags(id) ON DELETE SET NULL,
  feature_flag_key VARCHAR(255) NOT NULL,
  event_type feature_flag_audit_action NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  attempt_number INTEGER DEFAULT 1,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for webhook deliveries
CREATE INDEX IF NOT EXISTS idx_ff_webhook_deliveries_webhook_id ON feature_flag_webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_ff_webhook_deliveries_created_at ON feature_flag_webhook_deliveries(created_at DESC);

-- =====================================================
-- 4. RLS Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE feature_flag_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flag_webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Audit logs policies
CREATE POLICY "Admins can read feature flag audit logs"
  ON feature_flag_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert feature flag audit logs"
  ON feature_flag_audit_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Webhook policies
CREATE POLICY "Admins can manage feature flag webhooks"
  ON feature_flag_webhooks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can view webhook deliveries"
  ON feature_flag_webhook_deliveries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- =====================================================
-- 5. Comments
-- =====================================================

COMMENT ON TABLE feature_flag_audit_logs IS 'Audit trail for all feature flag changes';
COMMENT ON COLUMN feature_flag_audit_logs.previous_value IS 'JSON snapshot of flag state before change';
COMMENT ON COLUMN feature_flag_audit_logs.new_value IS 'JSON snapshot of flag state after change';

COMMENT ON TABLE feature_flag_webhooks IS 'Webhook configurations for feature flag change notifications';
COMMENT ON COLUMN feature_flag_webhooks.events IS 'Array of event types to trigger webhook (empty = all events)';
COMMENT ON COLUMN feature_flag_webhooks.secret IS 'HMAC secret for webhook signature verification';

COMMENT ON TABLE feature_flag_webhook_deliveries IS 'Delivery logs for webhook attempts';

COMMENT ON COLUMN feature_flags.environment IS 'Target environment (development, staging, production, all)';
