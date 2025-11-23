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

-- Create unique index if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_state_user_chat 
ON public.conversation_state(user_id, chat_id);

-- Add comment
COMMENT ON INDEX idx_conversation_state_user_chat IS 
'Ensures one conversation state per user per chat, required for upsert operations';

