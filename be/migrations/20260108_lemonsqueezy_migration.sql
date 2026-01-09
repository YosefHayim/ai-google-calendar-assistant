-- Migration: Add LemonSqueezy support alongside existing Stripe columns
-- Date: 2026-01-08
-- Description: Adds LemonSqueezy-specific columns to support LemonSqueezy payment integration
--              while preserving existing Stripe columns for backward compatibility

-- ============================================================================
-- 1. ADD LEMONSQUEEZY COLUMNS TO PLANS TABLE
-- ============================================================================
-- Add LemonSqueezy product and variant IDs to plans
ALTER TABLE plans
ADD COLUMN IF NOT EXISTS lemonsqueezy_product_id TEXT,
ADD COLUMN IF NOT EXISTS lemonsqueezy_variant_id_monthly TEXT,
ADD COLUMN IF NOT EXISTS lemonsqueezy_variant_id_yearly TEXT;

-- Add comments for documentation
COMMENT ON COLUMN plans.lemonsqueezy_product_id IS 'LemonSqueezy product ID for this plan';
COMMENT ON COLUMN plans.lemonsqueezy_variant_id_monthly IS 'LemonSqueezy variant ID for monthly billing';
COMMENT ON COLUMN plans.lemonsqueezy_variant_id_yearly IS 'LemonSqueezy variant ID for yearly billing';

-- ============================================================================
-- 2. ADD LEMONSQUEEZY COLUMNS TO SUBSCRIPTIONS TABLE
-- ============================================================================
-- Add LemonSqueezy-specific columns to subscriptions
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS lemonsqueezy_customer_id TEXT,
ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS lemonsqueezy_variant_id TEXT;

-- Add indexes for LemonSqueezy lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_lemonsqueezy_customer_id 
ON subscriptions(lemonsqueezy_customer_id) WHERE lemonsqueezy_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_lemonsqueezy_subscription_id 
ON subscriptions(lemonsqueezy_subscription_id) WHERE lemonsqueezy_subscription_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN subscriptions.lemonsqueezy_customer_id IS 'LemonSqueezy customer ID';
COMMENT ON COLUMN subscriptions.lemonsqueezy_subscription_id IS 'LemonSqueezy subscription ID';
COMMENT ON COLUMN subscriptions.lemonsqueezy_variant_id IS 'LemonSqueezy variant ID for the current subscription';

-- ============================================================================
-- 3. ADD LEMONSQUEEZY COLUMNS TO CREDIT_PACKS TABLE
-- ============================================================================
-- Add LemonSqueezy order ID for credit packs
ALTER TABLE credit_packs
ADD COLUMN IF NOT EXISTS lemonsqueezy_order_id TEXT;

-- Add index for LemonSqueezy order lookups
CREATE INDEX IF NOT EXISTS idx_credit_packs_lemonsqueezy_order_id 
ON credit_packs(lemonsqueezy_order_id) WHERE lemonsqueezy_order_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN credit_packs.lemonsqueezy_order_id IS 'LemonSqueezy order ID for credit pack purchase';

-- ============================================================================
-- 4. ADD LEMONSQUEEZY COLUMNS TO PAYMENT_HISTORY TABLE
-- ============================================================================
-- Add LemonSqueezy-specific columns to payment history
ALTER TABLE payment_history
ADD COLUMN IF NOT EXISTS lemonsqueezy_order_id TEXT,
ADD COLUMN IF NOT EXISTS lemonsqueezy_subscription_id TEXT;

-- Add indexes for LemonSqueezy lookups
CREATE INDEX IF NOT EXISTS idx_payment_history_lemonsqueezy_order_id 
ON payment_history(lemonsqueezy_order_id) WHERE lemonsqueezy_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_history_lemonsqueezy_subscription_id 
ON payment_history(lemonsqueezy_subscription_id) WHERE lemonsqueezy_subscription_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN payment_history.lemonsqueezy_order_id IS 'LemonSqueezy order ID for this payment';
COMMENT ON COLUMN payment_history.lemonsqueezy_subscription_id IS 'LemonSqueezy subscription ID for recurring payments';

-- ============================================================================
-- 5. CREATE LEMONSQUEEZY WEBHOOK EVENTS TABLE
-- ============================================================================
-- Create table for tracking LemonSqueezy webhook events (idempotency)
CREATE TABLE IF NOT EXISTS lemonsqueezy_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for webhook event lookups
CREATE INDEX IF NOT EXISTS idx_lemonsqueezy_webhook_events_event_id 
ON lemonsqueezy_webhook_events(event_id);

CREATE INDEX IF NOT EXISTS idx_lemonsqueezy_webhook_events_processed 
ON lemonsqueezy_webhook_events(processed) WHERE processed = FALSE;

CREATE INDEX IF NOT EXISTS idx_lemonsqueezy_webhook_events_event_type 
ON lemonsqueezy_webhook_events(event_type);

-- Add comment for documentation
COMMENT ON TABLE lemonsqueezy_webhook_events IS 'Stores LemonSqueezy webhook events for idempotency and debugging';

-- ============================================================================
-- 6. UPDATE VIEWS TO INCLUDE LEMONSQUEEZY FIELDS
-- ============================================================================
-- Note: If you have views like v_active_subscriptions that reference stripe columns,
-- you may need to update them to include lemonsqueezy columns as well.
-- This depends on your specific view definitions.

-- Example: Update v_active_subscriptions if it exists
-- DROP VIEW IF EXISTS v_active_subscriptions;
-- CREATE VIEW v_active_subscriptions AS
-- SELECT 
--     s.id as subscription_id,
--     s.user_id,
--     s.status,
--     s.stripe_customer_id,
--     s.stripe_subscription_id,
--     s.lemonsqueezy_customer_id,
--     s.lemonsqueezy_subscription_id,
--     -- ... other fields
-- FROM subscriptions s
-- WHERE s.status IN ('active', 'on_trial', 'past_due');

-- ============================================================================
-- 7. OPTIONAL: ADD PAYMENT_PROVIDER COLUMN FOR MULTI-PROVIDER SUPPORT
-- ============================================================================
-- This allows tracking which payment provider was used for each subscription
-- Uncomment if you want to support both Stripe and LemonSqueezy simultaneously

-- CREATE TYPE payment_provider AS ENUM ('stripe', 'lemonsqueezy');
-- 
-- ALTER TABLE subscriptions
-- ADD COLUMN IF NOT EXISTS payment_provider payment_provider DEFAULT 'lemonsqueezy';
-- 
-- ALTER TABLE payment_history
-- ADD COLUMN IF NOT EXISTS payment_provider payment_provider DEFAULT 'lemonsqueezy';
-- 
-- ALTER TABLE credit_packs
-- ADD COLUMN IF NOT EXISTS payment_provider payment_provider DEFAULT 'lemonsqueezy';

-- ============================================================================
-- VERIFICATION QUERIES (Run after migration to verify)
-- ============================================================================
-- Uncomment and run these queries to verify the migration was successful:

-- Check plans table columns:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'plans' AND column_name LIKE 'lemonsqueezy%';

-- Check subscriptions table columns:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'subscriptions' AND column_name LIKE 'lemonsqueezy%';

-- Check credit_packs table columns:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'credit_packs' AND column_name LIKE 'lemonsqueezy%';

-- Check payment_history table columns:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'payment_history' AND column_name LIKE 'lemonsqueezy%';

-- Check lemonsqueezy_webhook_events table exists:
-- SELECT * FROM information_schema.tables 
-- WHERE table_name = 'lemonsqueezy_webhook_events';
