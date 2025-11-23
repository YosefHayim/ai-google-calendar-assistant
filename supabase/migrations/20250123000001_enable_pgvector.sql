-- Enable pgvector extension for vector similarity search
-- This migration enables the pgvector extension which allows storing and querying vector embeddings

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for storing conversation embeddings
CREATE TABLE IF NOT EXISTS public.conversation_embeddings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    chat_id BIGINT, -- Telegram chat ID
    message_id BIGINT, -- Telegram message ID
    content TEXT NOT NULL, -- The text content that was embedded
    embedding vector(1536), -- OpenAI embedding dimension (1536 for text-embedding-3-small)
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata (timestamp, agent used, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT conversation_embeddings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE
);

-- Create index for vector similarity search using cosine distance
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_vector 
ON public.conversation_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on user_id for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_user_id 
ON public.conversation_embeddings(user_id);

-- Create index on chat_id for Telegram-specific queries
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_chat_id 
ON public.conversation_embeddings(chat_id);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_created_at 
ON public.conversation_embeddings(created_at DESC);

-- Create table for storing calendar event embeddings
CREATE TABLE IF NOT EXISTS public.event_embeddings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    event_id TEXT, -- Google Calendar event ID
    calendar_id TEXT, -- Google Calendar calendar ID
    content TEXT NOT NULL, -- Event summary, description, location combined
    embedding vector(1536), -- OpenAI embedding dimension
    metadata JSONB DEFAULT '{}'::jsonb, -- Event metadata (start time, end time, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT event_embeddings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_event_embeddings_vector 
ON public.event_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_event_embeddings_user_id 
ON public.event_embeddings(user_id);

-- Create unique index on user_id + event_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_embeddings_user_event 
ON public.event_embeddings(user_id, event_id) 
WHERE event_id IS NOT NULL;

-- Create table for storing user preference embeddings
CREATE TABLE IF NOT EXISTS public.user_preference_embeddings (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    preference_type TEXT NOT NULL, -- e.g., 'calendar_preference', 'timezone_preference', 'language_preference'
    content TEXT NOT NULL, -- The preference description
    embedding vector(1536), -- OpenAI embedding dimension
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional preference metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT user_preference_embeddings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_user_preference_embeddings_vector 
ON public.user_preference_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_user_preference_embeddings_user_id 
ON public.user_preference_embeddings(user_id);

-- Create index on preference_type for filtering
CREATE INDEX IF NOT EXISTS idx_user_preference_embeddings_type 
ON public.user_preference_embeddings(user_id, preference_type);

-- Enable RLS on all vector tables
ALTER TABLE public.conversation_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preference_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_embeddings
CREATE POLICY "Users can view own conversation embeddings"
ON public.conversation_embeddings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own conversation embeddings"
ON public.conversation_embeddings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversation embeddings"
ON public.conversation_embeddings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own conversation embeddings"
ON public.conversation_embeddings
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for event_embeddings
CREATE POLICY "Users can view own event embeddings"
ON public.event_embeddings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own event embeddings"
ON public.event_embeddings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own event embeddings"
ON public.event_embeddings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own event embeddings"
ON public.event_embeddings
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for user_preference_embeddings
CREATE POLICY "Users can view own preference embeddings"
ON public.user_preference_embeddings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preference embeddings"
ON public.user_preference_embeddings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preference embeddings"
ON public.user_preference_embeddings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own preference embeddings"
ON public.user_preference_embeddings
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Grant service role permissions
GRANT ALL ON public.conversation_embeddings TO service_role;
GRANT ALL ON public.event_embeddings TO service_role;
GRANT ALL ON public.user_preference_embeddings TO service_role;

-- Add comments
COMMENT ON TABLE public.conversation_embeddings IS 'Stores vector embeddings for user conversations to enable semantic search';
COMMENT ON TABLE public.event_embeddings IS 'Stores vector embeddings for calendar events to enable semantic search';
COMMENT ON TABLE public.user_preference_embeddings IS 'Stores vector embeddings for user preferences to enable context-aware responses';

