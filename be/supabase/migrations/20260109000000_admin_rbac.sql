-- Admin RBAC Migration
-- Adds role-based access control for admin dashboard functionality

-- ============================================
-- 1. ADD ROLE ENUM TYPE
-- ============================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator', 'support');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. ADD ROLE COLUMN TO USERS TABLE
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user' NOT NULL;

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comment for documentation
COMMENT ON COLUMN users.role IS 'User role for RBAC: user (default), admin, moderator, support';

-- ============================================
-- 3. ENHANCE AUDIT_LOGS FOR ADMIN TRACKING
-- ============================================
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS admin_user_id UUID REFERENCES users(id);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS admin_action_type TEXT;

-- Create partial index for admin actions (only where admin_user_id is set)
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id
ON audit_logs(admin_user_id)
WHERE admin_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_action
ON audit_logs(admin_action_type)
WHERE admin_action_type IS NOT NULL;

COMMENT ON COLUMN audit_logs.admin_user_id IS 'ID of admin who performed the action';
COMMENT ON COLUMN audit_logs.admin_action_type IS 'Type of admin action: user_status_change, subscription_update, credits_grant, password_reset, role_change';

-- ============================================
-- 4. RLS POLICIES FOR ADMIN ACCESS
-- ============================================

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS admin_read_all_users ON users;
DROP POLICY IF EXISTS admin_update_users ON users;
DROP POLICY IF EXISTS admin_read_all_subscriptions ON subscriptions;
DROP POLICY IF EXISTS admin_update_subscriptions ON subscriptions;
DROP POLICY IF EXISTS admin_read_all_payment_history ON payment_history;
DROP POLICY IF EXISTS admin_read_all_audit_logs ON audit_logs;
DROP POLICY IF EXISTS admin_insert_audit_logs ON audit_logs;

-- Policy: Admins can read all users
CREATE POLICY admin_read_all_users ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- Policy: Admins can update user status and role (except their own role to prevent self-elevation/demotion)
CREATE POLICY admin_update_users ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
)
WITH CHECK (
  -- Admin can update any user except their own role
  (id != auth.uid()) OR
  -- If updating self, role must remain unchanged (prevent self-modification of role)
  (id = auth.uid() AND role = (SELECT role FROM users WHERE id = auth.uid()))
);

-- Policy: Admins can read all subscriptions
CREATE POLICY admin_read_all_subscriptions ON subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- Policy: Admins can update subscriptions
CREATE POLICY admin_update_subscriptions ON subscriptions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- Policy: Admins can read all payment history
CREATE POLICY admin_read_all_payment_history ON payment_history
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- Policy: Admins can read all audit logs
CREATE POLICY admin_read_all_audit_logs ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- Policy: Admins can insert audit logs
CREATE POLICY admin_insert_audit_logs ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- ============================================
-- 5. ADMIN DASHBOARD VIEWS
-- ============================================

-- Drop views if they exist (to allow re-running migration)
DROP VIEW IF EXISTS v_admin_dashboard_stats;
DROP VIEW IF EXISTS v_subscription_distribution;
DROP VIEW IF EXISTS v_admin_user_list;

-- View: Admin Dashboard KPI Stats
CREATE VIEW v_admin_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM users WHERE deactivated_at IS NULL) as total_users,
  (SELECT COUNT(*) FROM users WHERE status = 'active' AND deactivated_at IS NULL) as active_users,
  (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours' AND deactivated_at IS NULL) as new_users_today,
  (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days' AND deactivated_at IS NULL) as new_users_week,
  (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days' AND deactivated_at IS NULL) as new_users_month,
  (SELECT COUNT(*) FROM subscriptions WHERE status IN ('active', 'trialing')) as active_subscriptions,
  (SELECT COALESCE(SUM(amount_cents), 0) FROM payment_history WHERE status = 'succeeded') as total_revenue_cents,
  (SELECT COALESCE(SUM(amount_cents), 0) FROM payment_history WHERE status = 'succeeded' AND created_at > NOW() - INTERVAL '30 days') as mrr_cents;

-- View: Subscription Distribution by Plan
CREATE VIEW v_subscription_distribution AS
SELECT
  p.slug as plan_slug,
  p.name as plan_name,
  COUNT(s.id) as subscriber_count,
  ROUND(
    COUNT(s.id)::numeric /
    NULLIF((SELECT COUNT(*) FROM subscriptions WHERE status IN ('active', 'trialing')), 0) * 100,
    2
  ) as percentage
FROM plans p
LEFT JOIN subscriptions s ON s.plan_id = p.id AND s.status IN ('active', 'trialing')
WHERE p.is_active = true
GROUP BY p.slug, p.name, p.display_order
ORDER BY p.display_order ASC;

-- View: Admin User List with Subscription Info
CREATE VIEW v_admin_user_list AS
SELECT
  u.id,
  u.email,
  u.first_name,
  u.last_name,
  u.display_name,
  u.avatar_url,
  u.status,
  u.role,
  u.timezone,
  u.locale,
  u.email_verified,
  u.created_at,
  u.updated_at,
  s.id as subscription_id,
  s.status as subscription_status,
  s.interval as subscription_interval,
  s.current_period_end,
  s.ai_interactions_used,
  s.credits_remaining,
  p.name as plan_name,
  p.slug as plan_slug,
  EXISTS(SELECT 1 FROM oauth_tokens ot WHERE ot.user_id = u.id AND ot.is_valid = true) as has_oauth_connected
FROM users u
LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status IN ('active', 'trialing', 'past_due', 'paused')
LEFT JOIN plans p ON p.id = s.plan_id
WHERE u.deactivated_at IS NULL
ORDER BY u.created_at DESC;

-- ============================================
-- 6. GRANT PERMISSIONS ON VIEWS
-- ============================================
GRANT SELECT ON v_admin_dashboard_stats TO authenticated;
GRANT SELECT ON v_subscription_distribution TO authenticated;
GRANT SELECT ON v_admin_user_list TO authenticated;

-- ============================================
-- 7. CREATE INITIAL ADMIN USER (OPTIONAL)
-- ============================================
-- Uncomment and modify to set an initial admin user by email
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
