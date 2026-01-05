-- ============================================================================
-- Migration 004: Subscriptions and Billing Schema
-- Description: Add tables for Stripe subscription management, plans, usage tracking
-- Features: 14-day free trial, 30-day money-back guarantee
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Subscription status enum
CREATE TYPE subscription_status AS ENUM (
    'trialing',           -- 14-day free trial
    'active',             -- Active paid subscription
    'past_due',           -- Payment failed, grace period
    'canceled',           -- User canceled, access until period end
    'unpaid',             -- Payment failed, no access
    'incomplete',         -- Initial payment pending
    'incomplete_expired', -- Initial payment failed
    'paused'              -- Subscription paused
);

-- Plan interval enum
CREATE TYPE plan_interval AS ENUM (
    'monthly',
    'yearly',
    'one_time'  -- For credit packs (per-use)
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
    'pending',
    'succeeded',
    'failed',
    'refunded',
    'partially_refunded',
    'disputed'
);

-- ============================================================================
-- PLANS TABLE
-- ============================================================================

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Plan identification
    name VARCHAR(100) NOT NULL,                    -- 'Starter', 'Operational Pro', 'Total Sovereignty'
    slug VARCHAR(50) UNIQUE NOT NULL,              -- 'starter', 'pro', 'executive'
    description TEXT,
    
    -- Stripe integration
    stripe_product_id VARCHAR(255),                -- Stripe Product ID
    stripe_price_id_monthly VARCHAR(255),          -- Stripe Price ID for monthly
    stripe_price_id_yearly VARCHAR(255),           -- Stripe Price ID for yearly
    
    -- Pricing (stored in cents)
    price_monthly_cents INTEGER DEFAULT 0,         -- Monthly price in cents
    price_yearly_cents INTEGER DEFAULT 0,          -- Yearly price in cents
    price_per_use_cents INTEGER DEFAULT 0,         -- Per-use pack price in cents
    
    -- Limits and features
    ai_interactions_monthly INTEGER,               -- NULL = unlimited
    action_pack_size INTEGER,                      -- Credits for per-use mode
    features JSONB DEFAULT '[]'::jsonb,            -- Array of feature strings
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    is_highlighted BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User reference
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Plan reference
    plan_id UUID NOT NULL REFERENCES plans(id),
    
    -- Stripe integration
    stripe_customer_id VARCHAR(255),               -- Stripe Customer ID
    stripe_subscription_id VARCHAR(255) UNIQUE,    -- Stripe Subscription ID
    stripe_price_id VARCHAR(255),                  -- Current Stripe Price ID
    
    -- Subscription status
    status subscription_status DEFAULT 'trialing',
    interval plan_interval DEFAULT 'monthly',
    
    -- Trial information (14-day free trial)
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    
    -- Billing period
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    
    -- Money-back guarantee (30 days from first payment)
    first_payment_at TIMESTAMPTZ,
    money_back_eligible_until TIMESTAMPTZ,         -- 30 days after first payment
    
    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Usage tracking (for current period)
    ai_interactions_used INTEGER DEFAULT 0,
    credits_remaining INTEGER DEFAULT 0,           -- For per-use plans
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_active_subscription UNIQUE (user_id, status) 
        DEFERRABLE INITIALLY DEFERRED
);

-- ============================================================================
-- CREDIT PACKS TABLE (for one-time purchases)
-- ============================================================================

CREATE TABLE credit_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User reference
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Stripe integration
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_checkout_session_id VARCHAR(255),
    
    -- Pack details
    credits_purchased INTEGER NOT NULL,
    credits_remaining INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    
    -- Status
    status payment_status DEFAULT 'pending',
    
    -- Validity
    purchased_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,                        -- Optional expiration
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PAYMENT HISTORY TABLE
-- ============================================================================

CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User reference
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Subscription or credit pack reference
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    credit_pack_id UUID REFERENCES credit_packs(id) ON DELETE SET NULL,
    
    -- Stripe integration
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    
    -- Payment details
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status payment_status DEFAULT 'pending',
    
    -- Description
    description TEXT,
    
    -- Refund information
    refunded_amount_cents INTEGER DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMPTZ,
    
    -- Invoice URL
    invoice_url TEXT,
    receipt_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USAGE RECORDS TABLE
-- ============================================================================

CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User reference
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Subscription reference
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Usage details
    action_type VARCHAR(100) NOT NULL,             -- 'ai_interaction', 'event_create', etc.
    quantity INTEGER DEFAULT 1,
    
    -- Period tracking
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STRIPE WEBHOOK EVENTS TABLE (for idempotency)
-- ============================================================================

CREATE TABLE stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Stripe event details
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    
    -- Processing status
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Raw payload
    payload JSONB NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Plans indexes
CREATE INDEX idx_plans_slug ON plans(slug);
CREATE INDEX idx_plans_active ON plans(is_active) WHERE is_active = true;

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_trial_end ON subscriptions(trial_end) WHERE status = 'trialing';
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

-- Credit packs indexes
CREATE INDEX idx_credit_packs_user_id ON credit_packs(user_id);
CREATE INDEX idx_credit_packs_status ON credit_packs(status);
CREATE INDEX idx_credit_packs_remaining ON credit_packs(user_id, credits_remaining) 
    WHERE credits_remaining > 0;

-- Payment history indexes
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX idx_payment_history_stripe_payment_intent ON payment_history(stripe_payment_intent_id);
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at DESC);

-- Usage records indexes
CREATE INDEX idx_usage_records_user_period ON usage_records(user_id, period_start, period_end);
CREATE INDEX idx_usage_records_subscription_id ON usage_records(subscription_id);
CREATE INDEX idx_usage_records_action_type ON usage_records(action_type);

-- Webhook events indexes
CREATE INDEX idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX idx_stripe_webhook_events_type ON stripe_webhook_events(event_type);
CREATE INDEX idx_stripe_webhook_events_unprocessed ON stripe_webhook_events(processed) 
    WHERE processed = false;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for plans
CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for subscriptions
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for credit_packs
CREATE TRIGGER update_credit_packs_updated_at
    BEFORE UPDATE ON credit_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for payment_history
CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON payment_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check if user has active subscription or credits
CREATE OR REPLACE FUNCTION check_user_access(p_user_id UUID)
RETURNS TABLE (
    has_access BOOLEAN,
    subscription_status subscription_status,
    plan_name VARCHAR(100),
    interactions_remaining INTEGER,
    credits_remaining INTEGER,
    trial_days_left INTEGER,
    money_back_eligible BOOLEAN
) AS $$
DECLARE
    v_subscription RECORD;
    v_credits INTEGER;
BEGIN
    -- Check for active subscription
    SELECT s.*, p.name as plan_name, p.ai_interactions_monthly
    INTO v_subscription
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.user_id = p_user_id
    AND s.status IN ('trialing', 'active')
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- Calculate remaining credits from credit packs
    SELECT COALESCE(SUM(cp.credits_remaining), 0)
    INTO v_credits
    FROM credit_packs cp
    WHERE cp.user_id = p_user_id
    AND cp.status = 'succeeded'
    AND cp.credits_remaining > 0
    AND (cp.expires_at IS NULL OR cp.expires_at > NOW());
    
    RETURN QUERY SELECT
        COALESCE(v_subscription.status IN ('trialing', 'active'), false) OR v_credits > 0,
        v_subscription.status,
        v_subscription.plan_name::VARCHAR(100),
        CASE 
            WHEN v_subscription.ai_interactions_monthly IS NULL THEN NULL  -- Unlimited
            ELSE v_subscription.ai_interactions_monthly - v_subscription.ai_interactions_used
        END,
        v_credits,
        CASE 
            WHEN v_subscription.trial_end IS NOT NULL 
            THEN GREATEST(0, EXTRACT(DAY FROM v_subscription.trial_end - NOW())::INTEGER)
            ELSE NULL
        END,
        COALESCE(v_subscription.money_back_eligible_until > NOW(), false);
END;
$$ LANGUAGE plpgsql;

-- Function to record usage
CREATE OR REPLACE FUNCTION record_usage(
    p_user_id UUID,
    p_action_type VARCHAR(100),
    p_quantity INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE
    v_subscription RECORD;
    v_period_start TIMESTAMPTZ;
    v_period_end TIMESTAMPTZ;
BEGIN
    -- Get active subscription
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE user_id = p_user_id
    AND status IN ('trialing', 'active')
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_subscription IS NULL THEN
        -- Try to deduct from credit packs
        UPDATE credit_packs
        SET credits_remaining = credits_remaining - p_quantity,
            updated_at = NOW()
        WHERE user_id = p_user_id
        AND status = 'succeeded'
        AND credits_remaining >= p_quantity
        AND (expires_at IS NULL OR expires_at > NOW())
        RETURNING * INTO v_subscription;
        
        IF v_subscription IS NULL THEN
            RETURN false;  -- No credits available
        END IF;
        
        v_period_start := DATE_TRUNC('month', NOW());
        v_period_end := DATE_TRUNC('month', NOW()) + INTERVAL '1 month';
    ELSE
        v_period_start := COALESCE(v_subscription.current_period_start, DATE_TRUNC('month', NOW()));
        v_period_end := COALESCE(v_subscription.current_period_end, DATE_TRUNC('month', NOW()) + INTERVAL '1 month');
        
        -- Update subscription usage
        UPDATE subscriptions
        SET ai_interactions_used = ai_interactions_used + p_quantity,
            updated_at = NOW()
        WHERE id = v_subscription.id;
    END IF;
    
    -- Record the usage
    INSERT INTO usage_records (user_id, subscription_id, action_type, quantity, period_start, period_end)
    VALUES (p_user_id, v_subscription.id, p_action_type, p_quantity, v_period_start, v_period_end);
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_subscription_usage(p_subscription_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE subscriptions
    SET ai_interactions_used = 0,
        updated_at = NOW()
    WHERE id = p_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check trial expiration
CREATE OR REPLACE FUNCTION check_trial_expirations()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE subscriptions
    SET status = 'incomplete',
        updated_at = NOW()
    WHERE status = 'trialing'
    AND trial_end < NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DEFAULT PLANS
-- ============================================================================

INSERT INTO plans (
    name, 
    slug, 
    description,
    price_monthly_cents, 
    price_yearly_cents, 
    price_per_use_cents,
    ai_interactions_monthly, 
    action_pack_size,
    features,
    is_active,
    is_popular,
    is_highlighted,
    display_order
) VALUES 
(
    'Starter',
    'starter',
    'For individuals performing an exploratory audit of their weekly focus.',
    0,        -- Free monthly
    0,        -- Free yearly
    300,      -- $3 per-use pack
    10,       -- 10 AI interactions/month
    25,       -- 25 action pack
    '["Audit: 10 AI Interactions/mo", "Per Use: 25 Action Pack", "Time Audit Protocol", "Google Calendar Sync", "WhatsApp & Telegram Relay", "24/7 Operations Support", "Basic Visibility Dashboard"]'::jsonb,
    true,
    false,
    false,
    1
),
(
    'Operational Pro',
    'pro',
    'For established owners demanding consistent rigor and systematic time command.',
    300,      -- $3/month
    200,      -- $2/month (billed yearly = $24/year)
    700,      -- $7 per-use pack
    500,      -- 500 AI interactions/month
    100,      -- 100 action pack
    '["Audit: 500 AI Interactions/mo", "Per Use: 100 Action Pack", "Time Audit Protocol", "Google Calendar Sync", "WhatsApp & Telegram Relay", "24/7 Operations Support", "Detailed Focus Analytics", "Priority Neural Engine"]'::jsonb,
    true,
    true,     -- Popular
    false,
    2
),
(
    'Total Sovereignty',
    'executive',
    'The peak of command. Unlimited visibility and command for high-volume operations.',
    700,      -- $7/month
    500,      -- $5/month (billed yearly = $60/year)
    1000,     -- $10 per-use pack
    NULL,     -- Unlimited AI interactions
    1000,     -- 1000+ action pack
    '["Audit: Unlimited Interactions", "Per Use: 1000+ Actions (Custom)", "Time Audit Protocol", "Google Calendar Sync", "WhatsApp & Telegram Relay", "24/7 Operations Support", "Advanced Strategic Arbitrage", "Deep Focus Shields"]'::jsonb,
    true,
    false,
    true,     -- Highlighted
    3
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Users can only see their own
CREATE POLICY subscriptions_user_policy ON subscriptions
    FOR ALL USING (user_id = auth.uid());

-- Credit packs: Users can only see their own
CREATE POLICY credit_packs_user_policy ON credit_packs
    FOR ALL USING (user_id = auth.uid());

-- Payment history: Users can only see their own
CREATE POLICY payment_history_user_policy ON payment_history
    FOR ALL USING (user_id = auth.uid());

-- Usage records: Users can only see their own
CREATE POLICY usage_records_user_policy ON usage_records
    FOR ALL USING (user_id = auth.uid());

-- Plans: Everyone can read active plans
CREATE POLICY plans_read_policy ON plans
    FOR SELECT USING (is_active = true);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for active subscriptions with plan details
CREATE OR REPLACE VIEW v_active_subscriptions AS
SELECT 
    s.id as subscription_id,
    s.user_id,
    u.email,
    u.display_name,
    p.name as plan_name,
    p.slug as plan_slug,
    s.status,
    s.interval,
    s.stripe_customer_id,
    s.stripe_subscription_id,
    s.trial_start,
    s.trial_end,
    s.current_period_start,
    s.current_period_end,
    s.first_payment_at,
    s.money_back_eligible_until,
    s.ai_interactions_used,
    p.ai_interactions_monthly as ai_interactions_limit,
    CASE 
        WHEN p.ai_interactions_monthly IS NULL THEN NULL
        ELSE p.ai_interactions_monthly - s.ai_interactions_used
    END as ai_interactions_remaining,
    s.cancel_at_period_end,
    s.canceled_at,
    s.created_at as subscription_created_at
FROM subscriptions s
JOIN users u ON s.user_id = u.id
JOIN plans p ON s.plan_id = p.id
WHERE s.status IN ('trialing', 'active', 'past_due');

-- View for user billing summary
CREATE OR REPLACE VIEW v_user_billing_summary AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(DISTINCT s.id) as total_subscriptions,
    MAX(CASE WHEN s.status IN ('trialing', 'active') THEN p.name END) as current_plan,
    MAX(CASE WHEN s.status IN ('trialing', 'active') THEN s.status END) as current_status,
    SUM(CASE WHEN ph.status = 'succeeded' THEN ph.amount_cents ELSE 0 END) as total_paid_cents,
    COUNT(DISTINCT cp.id) as credit_packs_purchased,
    COALESCE(SUM(cp.credits_remaining), 0) as total_credits_remaining
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN plans p ON s.plan_id = p.id
LEFT JOIN payment_history ph ON u.id = ph.user_id
LEFT JOIN credit_packs cp ON u.id = cp.user_id AND cp.status = 'succeeded' AND cp.credits_remaining > 0
GROUP BY u.id, u.email;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE plans IS 'Subscription plans with pricing and feature limits';
COMMENT ON TABLE subscriptions IS 'User subscriptions with Stripe integration, 14-day trial, 30-day money-back';
COMMENT ON TABLE credit_packs IS 'One-time credit pack purchases for per-use pricing';
COMMENT ON TABLE payment_history IS 'Complete payment history for users';
COMMENT ON TABLE usage_records IS 'Detailed usage tracking for AI interactions and actions';
COMMENT ON TABLE stripe_webhook_events IS 'Stripe webhook event log for idempotency';

COMMENT ON COLUMN subscriptions.trial_end IS '14-day free trial end date';
COMMENT ON COLUMN subscriptions.money_back_eligible_until IS '30 days from first payment - eligible for full refund';
COMMENT ON COLUMN subscriptions.ai_interactions_used IS 'Current period AI interactions count';

COMMENT ON FUNCTION check_user_access IS 'Check if user has active subscription or credits';
COMMENT ON FUNCTION record_usage IS 'Record usage and deduct from subscription or credits';
COMMENT ON FUNCTION check_trial_expirations IS 'Expire subscriptions past trial end date';
