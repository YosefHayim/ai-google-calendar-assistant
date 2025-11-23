-- Create RPC functions for vector similarity search
-- These functions use pgvector's cosine distance operator for efficient similarity search

-- Function to search conversation embeddings
CREATE OR REPLACE FUNCTION match_conversation_embeddings(
  query_embedding vector(1536),
  match_user_id UUID,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    conversation_embeddings.id,
    conversation_embeddings.content,
    1 - (conversation_embeddings.embedding <=> query_embedding) AS similarity,
    conversation_embeddings.metadata
  FROM conversation_embeddings
  WHERE conversation_embeddings.user_id = match_user_id
    AND 1 - (conversation_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY conversation_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to search event embeddings
CREATE OR REPLACE FUNCTION match_event_embeddings(
  query_embedding vector(1536),
  match_user_id UUID,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    event_embeddings.id,
    event_embeddings.content,
    1 - (event_embeddings.embedding <=> query_embedding) AS similarity,
    event_embeddings.metadata
  FROM event_embeddings
  WHERE event_embeddings.user_id = match_user_id
    AND 1 - (event_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY event_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to search user preference embeddings
CREATE OR REPLACE FUNCTION match_user_preference_embeddings(
  query_embedding vector(1536),
  match_user_id UUID,
  match_preference_type text DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  content text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    user_preference_embeddings.id,
    user_preference_embeddings.content,
    1 - (user_preference_embeddings.embedding <=> query_embedding) AS similarity,
    user_preference_embeddings.metadata
  FROM user_preference_embeddings
  WHERE user_preference_embeddings.user_id = match_user_id
    AND (match_preference_type IS NULL OR user_preference_embeddings.preference_type = match_preference_type)
    AND 1 - (user_preference_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY user_preference_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comments
COMMENT ON FUNCTION match_conversation_embeddings IS 'Searches for similar conversation embeddings using cosine similarity';
COMMENT ON FUNCTION match_event_embeddings IS 'Searches for similar event embeddings using cosine similarity';
COMMENT ON FUNCTION match_user_preference_embeddings IS 'Searches for similar user preference embeddings using cosine similarity';

