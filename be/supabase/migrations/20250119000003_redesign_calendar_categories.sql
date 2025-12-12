-- Redesign calendar_categories table to properly reference users table
-- This migration updates the table structure to use user_id as a foreign key instead of email

-- Drop the existing foreign key constraint to user_calendar_tokens.email
ALTER TABLE public.calendar_categories
DROP CONSTRAINT IF EXISTS calendar_categories_email_fkey;

-- Convert the nullable user_id to UUID type and make it NOT NULL
-- First, populate user_id from email where it's null
UPDATE public.calendar_categories cc
SET user_id = u.user_id::TEXT
FROM public.users u
WHERE cc.email = u.email
AND cc.user_id IS NULL;

-- Create a temporary UUID column
ALTER TABLE public.calendar_categories
ADD COLUMN IF NOT EXISTS user_id_uuid UUID;

-- Copy and convert user_id to UUID
UPDATE public.calendar_categories
SET user_id_uuid = user_id::UUID
WHERE user_id IS NOT NULL;

-- For any remaining NULL values, try to match by email
UPDATE public.calendar_categories cc
SET user_id_uuid = u.user_id
FROM public.users u
WHERE cc.email = u.email
AND cc.user_id_uuid IS NULL;

-- Drop the old user_id column
ALTER TABLE public.calendar_categories
DROP COLUMN IF EXISTS user_id CASCADE;

-- Rename the UUID column to user_id
ALTER TABLE public.calendar_categories
RENAME COLUMN user_id_uuid TO user_id;

-- Make user_id NOT NULL
ALTER TABLE public.calendar_categories
ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint to users table
ALTER TABLE public.calendar_categories
ADD CONSTRAINT calendar_categories_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(user_id)
ON DELETE CASCADE;

-- Create index on user_id for faster joins
CREATE INDEX IF NOT EXISTS idx_calendar_categories_user_id
ON public.calendar_categories(user_id);

-- Keep email column for now but it's no longer the primary reference
-- We can optionally remove it in a future migration if it's redundant

-- Add comments
COMMENT ON TABLE public.calendar_categories IS 'Stores calendar metadata for users. References users table via user_id foreign key.';
COMMENT ON COLUMN public.calendar_categories.user_id IS 'Foreign key reference to users.user_id';
