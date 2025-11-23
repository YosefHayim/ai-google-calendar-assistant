-- Add unique constraint on conversation_state(user_id, chat_id)
-- This ensures one conversation state per user per chat
-- Required for upsert operations to work correctly

-- First, check if constraint already exists and remove duplicates if any
DO $$
BEGIN
  -- Remove any duplicate records (keep the most recent one)
  DELETE FROM public.conversation_state
  WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, chat_id) id
    FROM public.conversation_state
    ORDER BY user_id, chat_id, created_at DESC
  );
END $$;

-- Drop existing unique index if it exists (we'll replace with constraint)
DROP INDEX IF EXISTS idx_conversation_state_user_chat;

-- Create unique constraint (required for Supabase onConflict to work)
-- This creates both a constraint and an index
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'conversation_state_user_chat_unique'
  ) THEN
    ALTER TABLE public.conversation_state
    ADD CONSTRAINT conversation_state_user_chat_unique 
    UNIQUE (user_id, chat_id);
  END IF;
END $$;

-- Add comment
COMMENT ON CONSTRAINT conversation_state_user_chat_unique ON public.conversation_state IS 
'Ensures one conversation state per user per chat, required for upsert operations';

