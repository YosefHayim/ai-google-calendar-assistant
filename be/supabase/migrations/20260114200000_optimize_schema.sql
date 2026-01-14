-- =====================================================
-- OPTIMIZED SCHEMA MIGRATION
-- Consolidates 9 tables into 5 modular tables
-- =====================================================

-- =====================================================
-- STEP 1: Create new unified INVITATIONS table
-- Replaces: referrals, team_invites
-- =====================================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_type TEXT NOT NULL CHECK (invite_type IN ('referral', 'team', 'collaboration', 'beta')),
  
  -- Inviter/Invitee
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inviter_email TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Core fields
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled', 'signed_up', 'converted', 'rewarded')),
  invite_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Type-specific metadata (JSON)
  -- For referrals: { "referral_code": "ABC123" }
  -- For team invites: { "team_id": "uuid", "team_name": "...", "role": "admin", "message": "..." }
  metadata JSONB DEFAULT '{}',
  
  -- Rewards (primarily for referrals, null for other types)
  reward_type TEXT CHECK (reward_type IN ('free_month', 'discount', 'credits', 'custom')),
  reward_amount INTEGER DEFAULT 1,
  reward_claimed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Indexes for invitations
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_email ON invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_invitations_type_status ON invitations(invite_type, status);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_invitations_created_at ON invitations(created_at);
CREATE INDEX IF NOT EXISTS idx_invitations_metadata ON invitations USING GIN (metadata);

-- RLS for invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Users can view invitations they sent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view invitations they sent') THEN
    CREATE POLICY "Users can view invitations they sent"
      ON invitations FOR SELECT
      TO authenticated
      USING (auth.uid() = inviter_id);
  END IF;
END
$$;

-- Users can view invitations sent to them
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view invitations sent to them') THEN
    CREATE POLICY "Users can view invitations sent to them"
      ON invitations FOR SELECT
      TO authenticated
      USING (auth.jwt() ->> 'email' = invitee_email);
  END IF;
END
$$;

-- Users can create invitations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create invitations') THEN
    CREATE POLICY "Users can create invitations"
      ON invitations FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = inviter_id);
  END IF;
END
$$;

-- Users can update invitations they sent or received
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update invitations') THEN
    CREATE POLICY "Users can update invitations"
      ON invitations FOR UPDATE
      TO authenticated
      USING (auth.uid() = inviter_id OR auth.jwt() ->> 'email' = invitee_email);
  END IF;
END
$$;

-- Users can delete invitations they sent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete invitations they sent') THEN
    CREATE POLICY "Users can delete invitations they sent"
      ON invitations FOR DELETE
      TO authenticated
      USING (auth.uid() = inviter_id);
  END IF;
END
$$;

-- Public can view referral invitations by code for validation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view referral by token') THEN
    CREATE POLICY "Public can view referral by token"
      ON invitations FOR SELECT
      TO public
      USING (invite_type = 'referral' AND metadata->>'referral_code' IS NOT NULL);
  END IF;
END
$$;

-- Function to generate invite token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate referral code (shorter, uppercase)
CREATE OR REPLACE FUNCTION generate_referral_code_v2()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate tokens and referral codes
CREATE OR REPLACE FUNCTION set_invitation_tokens()
RETURNS TRIGGER AS $$
BEGIN
  -- Always generate invite token
  IF NEW.invite_token IS NULL OR NEW.invite_token = '' THEN
    NEW.invite_token := generate_invitation_token();
  END IF;
  
  -- For referrals, also generate referral_code in metadata
  IF NEW.invite_type = 'referral' AND (NEW.metadata IS NULL OR NEW.metadata->>'referral_code' IS NULL) THEN
    NEW.metadata := COALESCE(NEW.metadata, '{}'::jsonb) || jsonb_build_object('referral_code', generate_referral_code_v2());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_invitation_tokens ON invitations;
CREATE TRIGGER trigger_set_invitation_tokens
  BEFORE INSERT ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_tokens();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_invitations_updated_at ON invitations;
CREATE TRIGGER trigger_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitations_updated_at();

-- =====================================================
-- STEP 2: Create unified MARKETING_SUBSCRIPTIONS table
-- Replaces: newsletter_subscriptions, waiting_list
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT,
  
  -- Multi-list support (array of subscription types)
  subscription_types TEXT[] DEFAULT ARRAY['newsletter'],
  
  -- Source and tracking
  source TEXT DEFAULT 'landing_page',
  ip_address TEXT,
  user_agent TEXT,
  
  -- Metadata for type-specific data
  -- { "waitlist_position": 42, "priority": "high", "notes": "..." }
  metadata JSONB DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced', 'invited', 'registered')),
  unsubscribed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for marketing_subscriptions
CREATE INDEX IF NOT EXISTS idx_marketing_email ON marketing_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_marketing_types ON marketing_subscriptions USING GIN (subscription_types);
CREATE INDEX IF NOT EXISTS idx_marketing_status ON marketing_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_marketing_created_at ON marketing_subscriptions(created_at);
CREATE INDEX IF NOT EXISTS idx_marketing_user_id ON marketing_subscriptions(user_id);

-- RLS for marketing_subscriptions
ALTER TABLE marketing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can subscribe to marketing') THEN
    CREATE POLICY "Anyone can subscribe to marketing"
      ON marketing_subscriptions FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END
$$;

-- Users can view their own subscription
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own marketing subscription') THEN
    CREATE POLICY "Users can view own marketing subscription"
      ON marketing_subscriptions FOR SELECT
      TO public
      USING (auth.jwt() ->> 'email' = email);
  END IF;
END
$$;

-- Users can update their own subscription
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own marketing subscription') THEN
    CREATE POLICY "Users can update own marketing subscription"
      ON marketing_subscriptions FOR UPDATE
      TO public
      USING (auth.jwt() ->> 'email' = email);
  END IF;
END
$$;

-- Function to auto-assign waitlist position
CREATE OR REPLACE FUNCTION assign_waitlist_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign position if joining waitlist and not already set
  IF 'waitlist' = ANY(NEW.subscription_types) AND (NEW.metadata IS NULL OR NEW.metadata->>'waitlist_position' IS NULL) THEN
    NEW.metadata := COALESCE(NEW.metadata, '{}'::jsonb) || jsonb_build_object(
      'waitlist_position', 
      (SELECT COALESCE(MAX((metadata->>'waitlist_position')::integer), 0) + 1 FROM marketing_subscriptions WHERE 'waitlist' = ANY(subscription_types))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_assign_waitlist_position ON marketing_subscriptions;
CREATE TRIGGER trigger_assign_waitlist_position
  BEFORE INSERT ON marketing_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION assign_waitlist_position();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_marketing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_marketing_updated_at ON marketing_subscriptions;
CREATE TRIGGER trigger_marketing_updated_at
  BEFORE UPDATE ON marketing_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_updated_at();

-- =====================================================
-- STEP 3: Create unified INTEGRATIONS table
-- Replaces: slack_workspaces, slack_users
-- =====================================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type TEXT NOT NULL CHECK (integration_type IN ('slack', 'teams', 'discord', 'telegram')),
  
  -- Workspace/Organization
  workspace_id TEXT NOT NULL,
  workspace_data JSONB NOT NULL DEFAULT '{}',
  -- { "team_name": "...", "domain": "...", "enterprise_id": "...", "is_enterprise": false }
  
  -- User mappings (array of user links)
  -- [{ "user_id": "supabase_uuid", "external_id": "slack_id", "username": "...", "is_linked": true }]
  user_mappings JSONB DEFAULT '[]',
  
  -- OAuth tokens
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  bot_user_id TEXT,
  scope TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'revoked')),
  last_sync_at TIMESTAMPTZ,
  installed_by TEXT,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(integration_type, workspace_id)
);

-- Indexes for integrations
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_integrations_workspace ON integrations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_user_mappings ON integrations USING GIN (user_mappings);

-- RLS for integrations (service role only for sensitive data)
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role has full access to integrations') THEN
    CREATE POLICY "Service role has full access to integrations"
      ON integrations FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_integrations_updated_at ON integrations;
CREATE TRIGGER trigger_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

-- =====================================================
-- STEP 4: Simplify teams table (add settings JSONB)
-- =====================================================
ALTER TABLE teams ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- =====================================================
-- STEP 5: Add invite_id to team_members for tracking
-- =====================================================
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS invite_id UUID REFERENCES invitations(id) ON DELETE SET NULL;

-- =====================================================
-- STEP 6: Migrate existing data
-- =====================================================

-- Migrate referrals to invitations
INSERT INTO invitations (
  id, invite_type, inviter_id, inviter_email, invitee_email, invitee_id,
  status, invite_token, expires_at, metadata, reward_type, reward_amount,
  reward_claimed_at, created_at, updated_at, converted_at
)
SELECT 
  id,
  'referral',
  referrer_id,
  referrer_email,
  COALESCE(referred_email, ''),
  referred_id,
  status,
  COALESCE(referral_code, generate_invitation_token()),
  expires_at,
  jsonb_build_object('referral_code', referral_code),
  reward_type,
  reward_amount,
  reward_claimed_at,
  created_at,
  updated_at,
  converted_at
FROM referrals
WHERE EXISTS (SELECT 1 FROM referrals LIMIT 1)
ON CONFLICT (id) DO NOTHING;

-- Migrate team_invites to invitations
INSERT INTO invitations (
  id, invite_type, inviter_id, inviter_email, invitee_email, invitee_id,
  status, invite_token, expires_at, metadata, created_at, updated_at, accepted_at
)
SELECT 
  id,
  'team',
  inviter_id,
  inviter_email,
  invitee_email,
  invitee_id,
  status,
  invite_token,
  expires_at,
  jsonb_build_object(
    'team_name', team_name,
    'role', role,
    'message', message
  ),
  created_at,
  updated_at,
  accepted_at
FROM team_invites
WHERE EXISTS (SELECT 1 FROM team_invites LIMIT 1)
ON CONFLICT (id) DO NOTHING;

-- Migrate newsletter_subscriptions to marketing_subscriptions
INSERT INTO marketing_subscriptions (
  email, subscription_types, source, ip_address, user_agent, status,
  unsubscribed_at, created_at, updated_at
)
SELECT 
  email,
  ARRAY['newsletter'],
  source,
  ip_address,
  user_agent,
  status,
  unsubscribed_at,
  created_at,
  updated_at
FROM newsletter_subscriptions
WHERE EXISTS (SELECT 1 FROM newsletter_subscriptions LIMIT 1)
ON CONFLICT (email) DO UPDATE SET
  subscription_types = array_append(
    array_remove(marketing_subscriptions.subscription_types, 'newsletter'),
    'newsletter'
  ),
  updated_at = NOW();

-- Migrate waiting_list to marketing_subscriptions
INSERT INTO marketing_subscriptions (
  email, name, subscription_types, source, ip_address, user_agent, status,
  metadata, created_at, updated_at
)
SELECT 
  email,
  name,
  ARRAY['waitlist'],
  source,
  ip_address,
  user_agent,
  CASE 
    WHEN status = 'pending' THEN 'active'
    WHEN status = 'invited' THEN 'invited'
    WHEN status = 'registered' THEN 'registered'
    ELSE 'active'
  END,
  jsonb_build_object(
    'waitlist_position', position,
    'notes', notes,
    'invited_at', invited_at,
    'registered_at', registered_at
  ),
  created_at,
  updated_at
FROM waiting_list
WHERE EXISTS (SELECT 1 FROM waiting_list LIMIT 1)
ON CONFLICT (email) DO UPDATE SET
  subscription_types = array_append(
    array_remove(marketing_subscriptions.subscription_types, 'waitlist'),
    'waitlist'
  ),
  name = COALESCE(marketing_subscriptions.name, EXCLUDED.name),
  metadata = marketing_subscriptions.metadata || EXCLUDED.metadata,
  updated_at = NOW();

-- Migrate slack_workspaces to integrations
INSERT INTO integrations (
  integration_type, workspace_id, workspace_data, access_token, bot_user_id, scope,
  status, installed_by, installed_at, created_at, updated_at
)
SELECT 
  'slack',
  team_id,
  jsonb_build_object(
    'team_name', team_name,
    'app_id', app_id,
    'enterprise_id', enterprise_id,
    'enterprise_name', enterprise_name,
    'is_enterprise_install', is_enterprise_install
  ),
  bot_token,
  bot_user_id,
  scope,
  CASE WHEN is_active THEN 'active' ELSE 'inactive' END,
  installed_by_user_id,
  installed_at,
  created_at,
  updated_at
FROM slack_workspaces
WHERE EXISTS (SELECT 1 FROM slack_workspaces LIMIT 1)
ON CONFLICT (integration_type, workspace_id) DO NOTHING;

-- Migrate slack_users into integrations user_mappings
-- This updates the user_mappings JSONB array for each workspace
DO $$
DECLARE
  slack_user_rec RECORD;
BEGIN
  FOR slack_user_rec IN 
    SELECT su.*, sw.team_id as workspace_id
    FROM slack_users su
    LEFT JOIN slack_workspaces sw ON su.slack_team_id = sw.team_id
    WHERE EXISTS (SELECT 1 FROM slack_users LIMIT 1)
  LOOP
    UPDATE integrations
    SET user_mappings = user_mappings || jsonb_build_array(
      jsonb_build_object(
        'user_id', slack_user_rec.user_id,
        'external_id', slack_user_rec.slack_user_id,
        'username', slack_user_rec.slack_username,
        'first_name', slack_user_rec.first_name,
        'is_linked', slack_user_rec.is_linked,
        'pending_email', slack_user_rec.pending_email,
        'last_activity_at', slack_user_rec.last_activity_at
      )
    )
    WHERE integration_type = 'slack' 
      AND workspace_id = slack_user_rec.workspace_id;
  END LOOP;
END
$$;

-- =====================================================
-- STEP 7: Create views for backward compatibility
-- =====================================================

-- View for referrals (backward compatible)
CREATE OR REPLACE VIEW referrals_view AS
SELECT 
  id,
  inviter_id as referrer_id,
  inviter_email as referrer_email,
  metadata->>'referral_code' as referral_code,
  NULLIF(invitee_email, '') as referred_email,
  invitee_id as referred_id,
  status,
  reward_type,
  reward_amount,
  reward_claimed_at,
  expires_at,
  converted_at,
  created_at,
  updated_at
FROM invitations
WHERE invite_type = 'referral';

-- View for team_invites (backward compatible)
CREATE OR REPLACE VIEW team_invites_view AS
SELECT 
  id,
  inviter_id,
  inviter_email,
  invitee_email,
  invitee_id,
  metadata->>'team_name' as team_name,
  metadata->>'role' as role,
  status,
  invite_token,
  metadata->>'message' as message,
  expires_at,
  accepted_at,
  created_at,
  updated_at
FROM invitations
WHERE invite_type = 'team';

-- View for newsletter_subscriptions (backward compatible)
CREATE OR REPLACE VIEW newsletter_subscriptions_view AS
SELECT 
  id,
  email,
  status,
  source,
  created_at as subscribed_at,
  unsubscribed_at,
  ip_address,
  user_agent,
  created_at,
  updated_at
FROM marketing_subscriptions
WHERE 'newsletter' = ANY(subscription_types);

-- View for waiting_list (backward compatible)
CREATE OR REPLACE VIEW waiting_list_view AS
SELECT 
  id,
  email,
  name,
  status,
  source,
  metadata->>'notes' as notes,
  (metadata->>'waitlist_position')::integer as position,
  (metadata->>'invited_at')::timestamptz as invited_at,
  (metadata->>'registered_at')::timestamptz as registered_at,
  ip_address,
  user_agent,
  created_at,
  updated_at
FROM marketing_subscriptions
WHERE 'waitlist' = ANY(subscription_types);

-- =====================================================
-- STEP 8: Drop old tables (CAREFUL - only after verifying migration)
-- Note: Uncomment these after verifying data migration
-- =====================================================

-- DROP TABLE IF EXISTS referral_stats CASCADE;
-- DROP TABLE IF EXISTS referrals CASCADE;
-- DROP TABLE IF EXISTS team_invites CASCADE;
-- DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;
-- DROP TABLE IF EXISTS waiting_list CASCADE;
-- DROP TABLE IF EXISTS slack_users CASCADE;
-- DROP TABLE IF EXISTS slack_workspaces CASCADE;

-- Drop old functions
-- DROP FUNCTION IF EXISTS generate_referral_code() CASCADE;
-- DROP FUNCTION IF EXISTS set_referral_code() CASCADE;
-- DROP FUNCTION IF EXISTS update_referral_stats() CASCADE;
-- DROP FUNCTION IF EXISTS generate_invite_token() CASCADE;
-- DROP FUNCTION IF EXISTS set_invite_token() CASCADE;
-- DROP FUNCTION IF EXISTS assign_waiting_list_position() CASCADE;
-- DROP FUNCTION IF EXISTS update_slack_workspaces_updated_at() CASCADE;
-- DROP FUNCTION IF EXISTS update_slack_users_updated_at() CASCADE;

-- =====================================================
-- SUMMARY:
-- Before: 9 tables (referrals, referral_stats, team_invites, teams, 
--         team_members, newsletter_subscriptions, waiting_list, 
--         slack_workspaces, slack_users)
-- After: 5 tables (invitations, teams, team_members, 
--        marketing_subscriptions, integrations)
-- Reduction: 44% fewer tables
-- =====================================================
