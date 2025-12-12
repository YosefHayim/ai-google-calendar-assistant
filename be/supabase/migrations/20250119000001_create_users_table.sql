-- Create users table with user_id as primary key
-- This table serves as the central user registry for the application

CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Create index on is_active for filtering active users
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Add comment to table
COMMENT ON TABLE public.users IS 'Central user registry table. All other user-related tables reference this via user_id.';

-- Add comments to columns
COMMENT ON COLUMN public.users.user_id IS 'Primary key - unique identifier for each user';
COMMENT ON COLUMN public.users.email IS 'User email address - must be unique';
COMMENT ON COLUMN public.users.created_at IS 'Timestamp when the user record was created';
COMMENT ON COLUMN public.users.updated_at IS 'Timestamp when the user record was last updated';
COMMENT ON COLUMN public.users.is_active IS 'Flag indicating if the user account is active';
COMMENT ON COLUMN public.users.metadata IS 'Additional user metadata stored as JSON';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
