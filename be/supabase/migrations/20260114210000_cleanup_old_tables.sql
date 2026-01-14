-- =====================================================
-- CLEANUP MIGRATION: Drop old tables replaced by optimized schema
-- This completes the migration started in 20260114200000_optimize_schema.sql
-- =====================================================

-- Drop old tables (order matters due to foreign key constraints)
DROP TABLE IF EXISTS referral_stats CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS team_invites CASCADE;
DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;
DROP TABLE IF EXISTS waiting_list CASCADE;
DROP TABLE IF EXISTS slack_users CASCADE;
DROP TABLE IF EXISTS slack_workspaces CASCADE;
DROP TABLE IF EXISTS slack_webhook_logs CASCADE;

-- Drop old functions that are no longer needed
DROP FUNCTION IF EXISTS generate_referral_code() CASCADE;
DROP FUNCTION IF EXISTS set_referral_code() CASCADE;
DROP FUNCTION IF EXISTS update_referral_stats() CASCADE;
DROP FUNCTION IF EXISTS generate_invite_token() CASCADE;
DROP FUNCTION IF EXISTS set_invite_token() CASCADE;
DROP FUNCTION IF EXISTS assign_waiting_list_position() CASCADE;
DROP FUNCTION IF EXISTS update_slack_workspaces_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_slack_users_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_newsletter_subscriptions_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_waiting_list_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_team_invites_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_referrals_updated_at() CASCADE;

-- =====================================================
-- SUMMARY:
-- Dropped 8 old tables that were consolidated into:
-- - invitations (replaces: referrals, team_invites)
-- - marketing_subscriptions (replaces: newsletter_subscriptions, waiting_list)
-- - integrations (replaces: slack_workspaces, slack_users)
-- =====================================================
