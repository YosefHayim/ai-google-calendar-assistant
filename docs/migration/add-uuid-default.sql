-- Option 1: Add default UUID generation (requires handling foreign key constraint)
-- This will auto-generate UUIDs when user_id is not provided

-- Step 1: Drop the foreign key constraint temporarily (if you want to allow UUIDs not in auth.users)
ALTER TABLE public.user_calendar_tokens 
DROP CONSTRAINT IF EXISTS user_calendar_tokens_user_id_fkey;

-- Step 2: Add default UUID generation using gen_random_uuid() (preferred in Supabase)
-- Note: gen_random_uuid() is available in PostgreSQL 13+ and doesn't require uuid-ossp
ALTER TABLE public.user_calendar_tokens
ALTER COLUMN user_id SET DEFAULT gen_random_uuid();

-- Alternative: If you prefer uuid-ossp extension (already enabled)
-- ALTER TABLE public.user_calendar_tokens
-- ALTER COLUMN user_id SET DEFAULT uuid_generate_v4();

-- Step 3 (Optional): Re-add foreign key constraint if you want to keep it
-- But note: This will fail if generated UUIDs don't exist in auth.users
-- ALTER TABLE public.user_calendar_tokens
-- ADD CONSTRAINT user_calendar_tokens_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) 
-- ON UPDATE CASCADE ON DELETE CASCADE;

-- Option 2: Keep foreign key but make it deferrable (allows inserts that reference non-existent users)
-- This is useful if you create users in auth.users first, then insert into user_calendar_tokens
-- ALTER TABLE public.user_calendar_tokens
-- DROP CONSTRAINT IF EXISTS user_calendar_tokens_user_id_fkey;
-- 
-- ALTER TABLE public.user_calendar_tokens
-- ADD CONSTRAINT user_calendar_tokens_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) 
-- ON UPDATE CASCADE ON DELETE CASCADE
-- DEFERRABLE INITIALLY DEFERRED;

-- Verify the change
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_calendar_tokens'
  AND column_name = 'user_id';

