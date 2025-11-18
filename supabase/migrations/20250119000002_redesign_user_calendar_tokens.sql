-- Redesign user_calendar_tokens table to properly reference users table
-- This migration updates the table structure to use user_id as a foreign key

-- First, ensure all existing user_ids in user_calendar_tokens exist in the users table
-- Insert missing users based on existing user_calendar_tokens records
INSERT INTO public.users (user_id, email, created_at)
SELECT DISTINCT
    uct.user_id::UUID,
    COALESCE(uct.email, 'unknown_' || uct.user_id || '@placeholder.com'),
    uct.created_at
FROM public.user_calendar_tokens uct
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.user_id = uct.user_id::UUID
)
ON CONFLICT (user_id) DO NOTHING;

-- Drop existing constraint if it exists (safety check)
ALTER TABLE public.user_calendar_tokens
DROP CONSTRAINT IF EXISTS user_calendar_tokens_user_id_fkey;

-- Convert user_id column to UUID type if it's not already
-- First, create a temporary column
ALTER TABLE public.user_calendar_tokens
ADD COLUMN IF NOT EXISTS user_id_uuid UUID;

-- Copy data from user_id to user_id_uuid
UPDATE public.user_calendar_tokens
SET user_id_uuid = user_id::UUID
WHERE user_id_uuid IS NULL;

-- Drop the old user_id column and rename the new one
ALTER TABLE public.user_calendar_tokens
DROP COLUMN IF EXISTS user_id CASCADE;

ALTER TABLE public.user_calendar_tokens
RENAME COLUMN user_id_uuid TO user_id;

-- Make user_id NOT NULL
ALTER TABLE public.user_calendar_tokens
ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint to users table
ALTER TABLE public.user_calendar_tokens
ADD CONSTRAINT user_calendar_tokens_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(user_id)
ON DELETE CASCADE;

-- Create index on user_id for faster joins
CREATE INDEX IF NOT EXISTS idx_user_calendar_tokens_user_id
ON public.user_calendar_tokens(user_id);

-- Add comment to table
COMMENT ON TABLE public.user_calendar_tokens IS 'Stores Google OAuth credentials for users. References users table via user_id foreign key.';

-- Add comment to user_id column
COMMENT ON COLUMN public.user_calendar_tokens.user_id IS 'Foreign key reference to users.user_id';
