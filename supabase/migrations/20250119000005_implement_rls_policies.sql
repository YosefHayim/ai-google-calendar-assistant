-- Implement Row-Level Security (RLS) policies for all tables
-- This ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_telegram_links ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own record
CREATE POLICY "Users can view own record"
ON public.users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can update their own record
CREATE POLICY "Users can update own record"
ON public.users
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can insert their own record (for new user registration)
CREATE POLICY "Users can insert own record"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- USER_CALENDAR_TOKENS TABLE POLICIES
-- ============================================================================

-- Users can view their own calendar tokens
CREATE POLICY "Users can view own calendar tokens"
ON public.user_calendar_tokens
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own calendar tokens
CREATE POLICY "Users can insert own calendar tokens"
ON public.user_calendar_tokens
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own calendar tokens
CREATE POLICY "Users can update own calendar tokens"
ON public.user_calendar_tokens
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own calendar tokens
CREATE POLICY "Users can delete own calendar tokens"
ON public.user_calendar_tokens
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- CALENDAR_CATEGORIES TABLE POLICIES
-- ============================================================================

-- Users can view their own calendar categories
CREATE POLICY "Users can view own calendar categories"
ON public.calendar_categories
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own calendar categories
CREATE POLICY "Users can insert own calendar categories"
ON public.calendar_categories
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own calendar categories
CREATE POLICY "Users can update own calendar categories"
ON public.calendar_categories
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own calendar categories
CREATE POLICY "Users can delete own calendar categories"
ON public.calendar_categories
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- USER_TELEGRAM_LINKS TABLE POLICIES
-- ============================================================================

-- Users can view their own Telegram links
CREATE POLICY "Users can view own telegram links"
ON public.user_telegram_links
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own Telegram links
CREATE POLICY "Users can insert own telegram links"
ON public.user_telegram_links
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own Telegram links
CREATE POLICY "Users can update own telegram links"
ON public.user_telegram_links
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own Telegram links
CREATE POLICY "Users can delete own telegram links"
ON public.user_telegram_links
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- SERVICE ROLE POLICIES (for backend operations)
-- ============================================================================

-- Service role can bypass RLS for administrative operations
-- These policies allow the service role (backend) to perform operations on behalf of users

-- Grant necessary permissions to service role
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.user_calendar_tokens TO service_role;
GRANT ALL ON public.calendar_categories TO service_role;
GRANT ALL ON public.user_telegram_links TO service_role;

-- Add comments
COMMENT ON POLICY "Users can view own record" ON public.users IS 'Allows authenticated users to view their own user record';
COMMENT ON POLICY "Users can view own calendar tokens" ON public.user_calendar_tokens IS 'Allows authenticated users to view their own Google calendar tokens';
COMMENT ON POLICY "Users can view own calendar categories" ON public.calendar_categories IS 'Allows authenticated users to view their own calendar categories';
COMMENT ON POLICY "Users can view own telegram links" ON public.user_telegram_links IS 'Allows authenticated users to view their own Telegram account links';
