-- Create conversation memory tables for storing and summarizing conversation history
-- This migration creates tables to store conversation messages and summaries

-- Create table for storing conversation messages
CREATE TABLE IF NOT EXISTS public.conversation_messages (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    chat_id BIGINT NOT NULL, -- Telegram chat ID
    message_id BIGINT NOT NULL, -- Telegram message ID
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata (agent used, tools called, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT conversation_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE
);

-- Create index on user_id and chat_id for fast retrieval
CREATE INDEX IF NOT EXISTS idx_conversation_messages_user_chat 
ON public.conversation_messages(user_id, chat_id, created_at DESC);

-- Create index on chat_id for Telegram-specific queries
CREATE INDEX IF NOT EXISTS idx_conversation_messages_chat_id 
ON public.conversation_messages(chat_id, created_at DESC);

-- Create unique index on chat_id + message_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_messages_chat_message 
ON public.conversation_messages(chat_id, message_id);

-- Create table for storing conversation summaries
CREATE TABLE IF NOT EXISTS public.conversation_summaries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    chat_id BIGINT NOT NULL, -- Telegram chat ID
    summary_text TEXT NOT NULL, -- The summarized conversation content
    message_count INTEGER NOT NULL, -- Number of messages summarized
    first_message_id BIGINT NOT NULL, -- First message ID in this summary
    last_message_id BIGINT NOT NULL, -- Last message ID in this summary
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata (key topics, user intent, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT conversation_summaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE
);

-- Create index on user_id and chat_id for fast retrieval
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_user_chat 
ON public.conversation_summaries(user_id, chat_id, created_at DESC);

-- Create index on chat_id for Telegram-specific queries
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_chat_id 
ON public.conversation_summaries(chat_id, created_at DESC);

-- Create table for tracking conversation state
CREATE TABLE IF NOT EXISTS public.conversation_state (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    chat_id BIGINT NOT NULL UNIQUE, -- Telegram chat ID (unique per chat)
    message_count INTEGER NOT NULL DEFAULT 0, -- Total message count in this conversation
    last_summarized_at TIMESTAMPTZ, -- When the last summary was created
    last_message_id BIGINT, -- Last processed message ID
    context_window JSONB DEFAULT '{}'::jsonb, -- Current context window state
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional state metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT conversation_state_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE
);

-- Create index on user_id and chat_id
CREATE INDEX IF NOT EXISTS idx_conversation_state_user_chat 
ON public.conversation_state(user_id, chat_id);

-- Create unique index on chat_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_state_chat_id 
ON public.conversation_state(chat_id);

-- Enable RLS on all conversation tables
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_messages
CREATE POLICY "Users can view own conversation messages"
ON public.conversation_messages
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own conversation messages"
ON public.conversation_messages
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversation messages"
ON public.conversation_messages
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversation messages"
ON public.conversation_messages
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for conversation_summaries
CREATE POLICY "Users can view own conversation summaries"
ON public.conversation_summaries
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own conversation summaries"
ON public.conversation_summaries
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversation summaries"
ON public.conversation_summaries
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversation summaries"
ON public.conversation_summaries
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for conversation_state
CREATE POLICY "Users can view own conversation state"
ON public.conversation_state
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own conversation state"
ON public.conversation_state
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversation state"
ON public.conversation_state
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversation state"
ON public.conversation_state
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Grant service role permissions
GRANT ALL ON public.conversation_messages TO service_role;
GRANT ALL ON public.conversation_summaries TO service_role;
GRANT ALL ON public.conversation_state TO service_role;

-- Add comments
COMMENT ON TABLE public.conversation_messages IS 'Stores individual conversation messages for context and summarization';
COMMENT ON TABLE public.conversation_summaries IS 'Stores summarized conversation content to reduce token usage while preserving context';
COMMENT ON TABLE public.conversation_state IS 'Tracks conversation state including message count and last summary timestamp';

