-- Migration: Drop local payment tables and move usage tracking to users
-- Date: 2026-01-17
-- Description: Remove plans and subscriptions tables since we now rely entirely on Lemon Squeezy API.
--              Usage tracking (ai_interactions_used, credits_remaining) moved to users table.

-- ============================================================================
-- Step 1: Add usage tracking columns to users table
-- ============================================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ai_interactions_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_remaining INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_reset_at TIMESTAMPTZ DEFAULT NOW();

COMMENT ON COLUMN users.ai_interactions_used IS 'Monthly AI interaction counter, resets each billing cycle';
COMMENT ON COLUMN users.credits_remaining IS 'Extra purchased credits (not part of subscription)';
COMMENT ON COLUMN users.usage_reset_at IS 'Timestamp when usage counters were last reset';

-- ============================================================================
-- Step 2: Migrate existing usage data from subscriptions to users
-- ============================================================================

UPDATE users u
SET 
  ai_interactions_used = COALESCE(s.ai_interactions_used, 0),
  credits_remaining = COALESCE(s.credits_remaining, 0),
  usage_reset_at = COALESCE(s.current_period_start, NOW())
FROM subscriptions s
WHERE s.user_id = u.id
AND s.status IN ('active', 'trialing');

-- ============================================================================
-- Step 3: Drop subscriptions table (drops FK to plans automatically)
-- ============================================================================

DROP TABLE IF EXISTS subscriptions CASCADE;

-- ============================================================================
-- Step 4: Drop plans table
-- ============================================================================

DROP TABLE IF EXISTS plans CASCADE;

-- ============================================================================
-- Step 5: Drop related enums if no longer used elsewhere
-- ============================================================================

-- Check if enums are used elsewhere before dropping
-- subscription_status enum - only used by subscriptions table
DO $$
BEGIN
  DROP TYPE IF EXISTS subscription_status CASCADE;
EXCEPTION
  WHEN dependent_objects_still_exist THEN
    RAISE NOTICE 'subscription_status enum still in use, skipping drop';
END $$;

-- plan_interval enum - only used by subscriptions table  
DO $$
BEGIN
  DROP TYPE IF EXISTS plan_interval CASCADE;
EXCEPTION
  WHEN dependent_objects_still_exist THEN
    RAISE NOTICE 'plan_interval enum still in use, skipping drop';
END $$;

-- payment_status enum - check if used elsewhere
DO $$
BEGIN
  DROP TYPE IF EXISTS payment_status CASCADE;
EXCEPTION
  WHEN dependent_objects_still_exist THEN
    RAISE NOTICE 'payment_status enum still in use, skipping drop';
END $$;

-- ============================================================================
-- Step 6: Create index for usage queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_usage_reset_at ON users(usage_reset_at);

-- ============================================================================
-- Notes:
-- - lemonsqueezy_webhook_events table is KEPT for audit trail / idempotency
-- - All plan data now comes from Lemon Squeezy API via getPlansFromLemonSqueezy()
-- - Subscription status checked via LS API by user email lookup
-- - Usage tracking stored locally on users table for fast access
-- ============================================================================
