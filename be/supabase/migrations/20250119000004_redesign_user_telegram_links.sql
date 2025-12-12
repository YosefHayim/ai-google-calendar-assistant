-- Redesign user_telegram_links table to properly reference users table
-- This migration adds user_id as a foreign key to link Telegram accounts to users

-- Add user_id column as UUID
ALTER TABLE public.user_telegram_links
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Populate user_id from email where possible
UPDATE public.user_telegram_links utl
SET user_id = u.user_id
FROM public.users u
WHERE utl.email = u.email
AND utl.user_id IS NULL;

-- For Telegram links without matching email, we'll keep user_id as NULL for now
-- In production, you may want to handle this differently or require user_id

-- Add foreign key constraint to users table (allowing NULL for now)
ALTER TABLE public.user_telegram_links
ADD CONSTRAINT user_telegram_links_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(user_id)
ON DELETE CASCADE;

-- Create index on user_id for faster joins
CREATE INDEX IF NOT EXISTS idx_user_telegram_links_user_id
ON public.user_telegram_links(user_id);

-- Create index on email for lookups
CREATE INDEX IF NOT EXISTS idx_user_telegram_links_email
ON public.user_telegram_links(email);

-- Add comments
COMMENT ON TABLE public.user_telegram_links IS 'Links Telegram accounts to users. References users table via user_id foreign key.';
COMMENT ON COLUMN public.user_telegram_links.user_id IS 'Foreign key reference to users.user_id (nullable for backward compatibility)';
