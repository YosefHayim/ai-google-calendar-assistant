-- =============================================================================
-- AI Google Calendar Assistant - Professional Database Schema Migration
-- Version: 1.0.0
-- Description: Comprehensive schema redesign with proper PKs, FKs, indexes,
--              constraints, and audit fields for scalability and data integrity
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- =============================================================================
-- ENUMS - Centralized status and type definitions
-- =============================================================================

-- User account status
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- OAuth provider types
DO $$ BEGIN
    CREATE TYPE oauth_provider AS ENUM ('google', 'github', 'telegram', 'whatsapp');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Conversation source types
DO $$ BEGIN
    CREATE TYPE conversation_source AS ENUM ('web', 'telegram', 'whatsapp', 'api');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Message role types
DO $$ BEGIN
    CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system', 'tool');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Gap resolution status
DO $$ BEGIN
    CREATE TYPE gap_resolution_status AS ENUM ('pending', 'filled', 'skipped', 'dismissed', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Calendar access roles
DO $$ BEGIN
    CREATE TYPE calendar_access_role AS ENUM ('owner', 'writer', 'reader', 'freeBusyReader');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- TABLE: users (Core user table - single source of truth)
-- =============================================================================
-- This replaces the fragmented user_calendar_tokens approach with a proper
-- normalized user table that separates concerns

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Profile information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(200),
    avatar_url TEXT,
    
    -- Preferences
    timezone VARCHAR(100) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en',
    
    -- Account status
    status user_status DEFAULT 'active',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ,
    deactivated_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT users_email_unique UNIQUE (email),
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- =============================================================================
-- TABLE: oauth_tokens (Centralized OAuth token storage)
-- =============================================================================
-- Stores OAuth tokens for various providers (Google, GitHub, etc.)
-- One user can have multiple OAuth connections

CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Provider information
    provider oauth_provider NOT NULL,
    provider_user_id VARCHAR(255), -- External provider's user ID
    
    -- Token data
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    id_token TEXT,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    scope TEXT,
    
    -- Token expiry
    expires_at TIMESTAMPTZ,
    refresh_token_expires_at TIMESTAMPTZ,
    
    -- Status
    is_valid BOOLEAN DEFAULT TRUE,
    last_refreshed_at TIMESTAMPTZ,
    refresh_error_count INTEGER DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT oauth_tokens_user_provider_unique UNIQUE (user_id, provider)
);

-- Indexes for oauth_tokens
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_provider ON oauth_tokens(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires_at ON oauth_tokens(expires_at) WHERE is_valid = TRUE;
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_valid ON oauth_tokens(user_id, provider) WHERE is_valid = TRUE;

-- =============================================================================
-- TABLE: user_calendars (User's connected calendars)
-- =============================================================================
-- Stores metadata about user's Google Calendar connections

CREATE TABLE IF NOT EXISTS user_calendars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Calendar identification
    calendar_id VARCHAR(500) NOT NULL, -- Google Calendar ID
    calendar_name VARCHAR(255),
    
    -- Calendar settings
    access_role calendar_access_role DEFAULT 'reader',
    timezone VARCHAR(100),
    background_color VARCHAR(20),
    foreground_color VARCHAR(20),
    
    -- Default reminders (JSON array)
    default_reminders JSONB DEFAULT '[]'::jsonb,
    
    -- User preferences for this calendar
    is_primary BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    notification_enabled BOOLEAN DEFAULT TRUE,
    
    -- Sync status
    last_synced_at TIMESTAMPTZ,
    sync_token TEXT, -- For incremental sync
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT user_calendars_user_calendar_unique UNIQUE (user_id, calendar_id)
);

-- Indexes for user_calendars
CREATE INDEX IF NOT EXISTS idx_user_calendars_user_id ON user_calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_user_calendars_calendar_id ON user_calendars(calendar_id);
CREATE INDEX IF NOT EXISTS idx_user_calendars_primary ON user_calendars(user_id) WHERE is_primary = TRUE;

-- =============================================================================
-- TABLE: telegram_users (Telegram-specific user data)
-- =============================================================================
-- Links Telegram accounts to main user accounts

CREATE TABLE IF NOT EXISTS telegram_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Can be null until linked
    
    -- Telegram identification
    telegram_user_id BIGINT NOT NULL,
    telegram_chat_id BIGINT,
    telegram_username VARCHAR(100),
    
    -- Profile from Telegram
    first_name VARCHAR(100),
    language_code VARCHAR(10),
    is_bot BOOLEAN DEFAULT FALSE,
    
    -- Linking status
    is_linked BOOLEAN DEFAULT FALSE, -- Whether linked to a users record
    pending_email VARCHAR(255), -- Email pending verification
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_activity_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT telegram_users_telegram_id_unique UNIQUE (telegram_user_id)
);

-- Indexes for telegram_users
CREATE INDEX IF NOT EXISTS idx_telegram_users_user_id ON telegram_users(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_id ON telegram_users(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_chat_id ON telegram_users(telegram_chat_id);

-- =============================================================================
-- TABLE: conversations (Unified conversation storage)
-- =============================================================================
-- Stores conversation metadata for all sources (web, telegram, whatsapp)

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Source identification
    source conversation_source NOT NULL,
    external_chat_id BIGINT, -- For Telegram/WhatsApp chat IDs
    
    -- Conversation metadata
    title VARCHAR(255),
    summary TEXT,
    
    -- Message tracking
    message_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_message_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ
);

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_source ON conversations(source);
CREATE INDEX IF NOT EXISTS idx_conversations_user_source ON conversations(user_id, source);
CREATE INDEX IF NOT EXISTS idx_conversations_active ON conversations(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_external_chat ON conversations(source, external_chat_id) WHERE external_chat_id IS NOT NULL;

-- =============================================================================
-- TABLE: conversation_messages (Individual messages)
-- =============================================================================
-- Stores individual messages within conversations

CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Message content
    role message_role NOT NULL,
    content TEXT NOT NULL,
    
    -- Tool/function call data (for assistant messages with tool calls)
    tool_calls JSONB,
    tool_call_id VARCHAR(100), -- For tool response messages
    
    -- Metadata
    metadata JSONB,
    
    -- Token usage tracking
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Ordering
    sequence_number INTEGER NOT NULL
);

-- Indexes for conversation_messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created ON conversation_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sequence ON conversation_messages(conversation_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_role ON conversation_messages(conversation_id, role);

-- =============================================================================
-- TABLE: conversation_embeddings_new (Vector embeddings for semantic search)
-- =============================================================================
-- Note: Named with _new suffix to avoid conflicts with existing conversation_embeddings table

CREATE TABLE IF NOT EXISTS conversation_embeddings_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES conversation_messages(id) ON DELETE CASCADE,
    
    -- Embedding data
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 dimension
    
    -- Metadata
    source conversation_source,
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for conversation_embeddings_new
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_new_user_id ON conversation_embeddings_new(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_new_conversation ON conversation_embeddings_new(conversation_id);

-- Note: IVFFlat vector index should be created AFTER data is populated
-- For now, use HNSW which works better on empty tables, or create index after migration
-- CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_new_vector ON conversation_embeddings_new 
--     USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Alternative: Use HNSW index which works on empty tables
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_new_vector ON conversation_embeddings_new 
    USING hnsw (embedding vector_cosine_ops);

-- =============================================================================
-- TABLE: conversation_summaries (Summarized conversation chunks)
-- =============================================================================

CREATE TABLE IF NOT EXISTS conversation_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    
    -- Summary content
    summary_text TEXT NOT NULL,
    
    -- Message range this summary covers
    first_message_sequence INTEGER NOT NULL,
    last_message_sequence INTEGER NOT NULL,
    message_count INTEGER NOT NULL,
    
    -- Metadata
    metadata JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for conversation_summaries
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_user_id ON conversation_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_conversation ON conversation_summaries(conversation_id);

-- =============================================================================
-- TABLE: agent_sessions (AI agent session persistence)
-- =============================================================================

CREATE TABLE IF NOT EXISTS agent_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session identification
    session_id VARCHAR(255) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    
    -- Session state (OpenAI Agents SDK items)
    items JSONB,
    
    -- Context and memory
    context JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT agent_sessions_session_unique UNIQUE (session_id)
);

-- Indexes for agent_sessions
CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_session_id ON agent_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_active ON agent_sessions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_agent_sessions_expires ON agent_sessions(expires_at) WHERE expires_at IS NOT NULL;

-- =============================================================================
-- TABLE: gap_candidates (Calendar gap detection)
-- =============================================================================

CREATE TABLE IF NOT EXISTS gap_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Gap time range
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_ms BIGINT NOT NULL,
    
    -- Surrounding events
    preceding_event_id VARCHAR(255) NOT NULL,
    preceding_event_summary VARCHAR(500),
    preceding_event_calendar_id VARCHAR(500),
    
    following_event_id VARCHAR(255) NOT NULL,
    following_event_summary VARCHAR(500),
    following_event_calendar_id VARCHAR(500),
    
    -- AI inference
    inferred_context JSONB,
    confidence_score DECIMAL(3, 2) DEFAULT 0.00,
    
    -- Resolution
    resolution_status gap_resolution_status DEFAULT 'pending',
    resolution_data JSONB,
    resolved_at TIMESTAMPTZ,
    resolved_event_id VARCHAR(255), -- If filled with an event
    
    -- Audit fields
    detected_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT gap_candidates_valid_time_range CHECK (end_time > start_time),
    CONSTRAINT gap_candidates_valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- Indexes for gap_candidates
CREATE INDEX IF NOT EXISTS idx_gap_candidates_user_id ON gap_candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_gap_candidates_status ON gap_candidates(user_id, resolution_status);
CREATE INDEX IF NOT EXISTS idx_gap_candidates_pending ON gap_candidates(user_id) WHERE resolution_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_gap_candidates_time_range ON gap_candidates(user_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_gap_candidates_detected ON gap_candidates(detected_at DESC);

-- =============================================================================
-- TABLE: gap_recovery_settings (User preferences for gap analysis)
-- =============================================================================

CREATE TABLE IF NOT EXISTS gap_recovery_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Settings (JSONB for flexibility)
    settings JSONB NOT NULL DEFAULT '{
        "autoGapAnalysis": true,
        "minGapThreshold": 30,
        "maxGapThreshold": 480,
        "ignoredDays": [],
        "lookbackDays": 7,
        "minConfidenceThreshold": 0.3,
        "includedCalendars": [],
        "excludedCalendars": []
    }'::jsonb,
    
    -- Quick access fields (denormalized for common queries)
    is_enabled BOOLEAN DEFAULT TRUE,
    min_gap_minutes INTEGER DEFAULT 30,
    max_gap_minutes INTEGER DEFAULT 480,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT gap_recovery_settings_user_unique UNIQUE (user_id)
);

-- Indexes for gap_recovery_settings
CREATE INDEX IF NOT EXISTS idx_gap_recovery_settings_user_id ON gap_recovery_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_gap_recovery_settings_enabled ON gap_recovery_settings(user_id) WHERE is_enabled = TRUE;

-- =============================================================================
-- TABLE: user_preferences (Extensible user preferences)
-- =============================================================================
-- Key-value store for user preferences that don't fit elsewhere

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Preference data
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB NOT NULL,
    
    -- Categorization
    category VARCHAR(50) DEFAULT 'general',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT user_preferences_user_key_unique UNIQUE (user_id, preference_key)
);

-- Indexes for user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);
CREATE INDEX IF NOT EXISTS idx_user_preferences_category ON user_preferences(user_id, category);

-- =============================================================================
-- TABLE: audit_logs (Security and change tracking)
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action information
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    
    -- Change data
    old_values JSONB,
    new_values JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'success',
    error_message TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Partition hint: Consider partitioning by created_at for large deployments
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_created_brin ON audit_logs USING BRIN (created_at);

-- =============================================================================
-- FUNCTIONS: Utility functions for common operations
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function for vector similarity search on conversation embeddings
CREATE OR REPLACE FUNCTION match_conversation_embeddings_v2(
    query_embedding vector(1536),
    match_user_id UUID,
    match_count INTEGER DEFAULT 5,
    match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ce.id,
        ce.content,
        ce.metadata,
        1 - (ce.embedding <=> query_embedding) AS similarity
    FROM conversation_embeddings ce
    WHERE ce.user_id = match_user_id
        AND 1 - (ce.embedding <=> query_embedding) > match_threshold
    ORDER BY ce.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to cleanup expired agent sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM agent_sessions
    WHERE expires_at < NOW()
    AND expires_at IS NOT NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old pending gaps
CREATE OR REPLACE FUNCTION cleanup_old_pending_gaps_v2(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE gap_candidates
    SET resolution_status = 'expired',
        updated_at = NOW()
    WHERE resolution_status = 'pending'
        AND detected_at < NOW() - (days_old || ' days')::INTERVAL;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active conversation for a source
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_user_id UUID,
    p_source conversation_source,
    p_external_chat_id BIGINT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
BEGIN
    -- Try to find existing active conversation
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE user_id = p_user_id
        AND source = p_source
        AND is_active = TRUE
        AND (p_external_chat_id IS NULL OR external_chat_id = p_external_chat_id)
        AND updated_at > NOW() - INTERVAL '24 hours'
    ORDER BY updated_at DESC
    LIMIT 1;
    
    -- Create new if not found
    IF v_conversation_id IS NULL THEN
        INSERT INTO conversations (user_id, source, external_chat_id)
        VALUES (p_user_id, p_source, p_external_chat_id)
        RETURNING id INTO v_conversation_id;
    END IF;
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS: Automatic timestamp updates
-- =============================================================================

-- Users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- OAuth tokens table
DROP TRIGGER IF EXISTS update_oauth_tokens_updated_at ON oauth_tokens;
CREATE TRIGGER update_oauth_tokens_updated_at
    BEFORE UPDATE ON oauth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User calendars table
DROP TRIGGER IF EXISTS update_user_calendars_updated_at ON user_calendars;
CREATE TRIGGER update_user_calendars_updated_at
    BEFORE UPDATE ON user_calendars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Telegram users table
DROP TRIGGER IF EXISTS update_telegram_users_updated_at ON telegram_users;
CREATE TRIGGER update_telegram_users_updated_at
    BEFORE UPDATE ON telegram_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Conversations table
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Agent sessions table
DROP TRIGGER IF EXISTS update_agent_sessions_updated_at ON agent_sessions;
CREATE TRIGGER update_agent_sessions_updated_at
    BEFORE UPDATE ON agent_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Gap candidates table
DROP TRIGGER IF EXISTS update_gap_candidates_updated_at ON gap_candidates;
CREATE TRIGGER update_gap_candidates_updated_at
    BEFORE UPDATE ON gap_candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Gap recovery settings table
DROP TRIGGER IF EXISTS update_gap_recovery_settings_updated_at ON gap_recovery_settings;
CREATE TRIGGER update_gap_recovery_settings_updated_at
    BEFORE UPDATE ON gap_recovery_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User preferences table
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Conversation embeddings table
DROP TRIGGER IF EXISTS update_conversation_embeddings_new_updated_at ON conversation_embeddings_new;
CREATE TRIGGER update_conversation_embeddings_new_updated_at
    BEFORE UPDATE ON conversation_embeddings_new
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =============================================================================

-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_recovery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created based on your authentication strategy
-- Below are example policies for service role access

-- Example: Allow service role full access
CREATE POLICY "Service role has full access to users"
    ON users FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to oauth_tokens"
    ON oauth_tokens FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to user_calendars"
    ON user_calendars FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to conversations"
    ON conversations FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to conversation_messages"
    ON conversation_messages FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================================================
-- VIEWS: Useful views for common queries
-- =============================================================================

-- View: Active users with their primary calendar
CREATE OR REPLACE VIEW v_active_users_with_calendar AS
SELECT 
    u.id AS user_id,
    u.email,
    u.display_name,
    u.timezone,
    uc.calendar_id AS primary_calendar_id,
    uc.calendar_name AS primary_calendar_name,
    ot.expires_at AS token_expires_at,
    ot.is_valid AS token_valid
FROM users u
LEFT JOIN user_calendars uc ON u.id = uc.user_id AND uc.is_primary = TRUE
LEFT JOIN oauth_tokens ot ON u.id = ot.user_id AND ot.provider = 'google'
WHERE u.status = 'active';

-- View: Conversation statistics per user
CREATE OR REPLACE VIEW v_user_conversation_stats AS
SELECT 
    u.id AS user_id,
    u.email,
    COUNT(DISTINCT c.id) AS total_conversations,
    COUNT(DISTINCT CASE WHEN c.source = 'web' THEN c.id END) AS web_conversations,
    COUNT(DISTINCT CASE WHEN c.source = 'telegram' THEN c.id END) AS telegram_conversations,
    SUM(c.message_count) AS total_messages,
    MAX(c.updated_at) AS last_conversation_at
FROM users u
LEFT JOIN conversations c ON u.id = c.user_id
GROUP BY u.id, u.email;

-- View: Pending gaps summary
CREATE OR REPLACE VIEW v_pending_gaps_summary AS
SELECT 
    user_id,
    COUNT(*) AS pending_count,
    SUM(duration_ms) / 60000 AS total_minutes_untracked,
    MIN(start_time) AS earliest_gap,
    MAX(end_time) AS latest_gap,
    AVG(confidence_score) AS avg_confidence
FROM gap_candidates
WHERE resolution_status = 'pending'
GROUP BY user_id;

-- =============================================================================
-- COMMENTS: Documentation for tables and columns
-- =============================================================================

COMMENT ON TABLE users IS 'Core user accounts - single source of truth for all user data';
COMMENT ON TABLE oauth_tokens IS 'OAuth tokens for external providers (Google, GitHub, etc.)';
COMMENT ON TABLE user_calendars IS 'User''s connected Google Calendar accounts and preferences';
COMMENT ON TABLE telegram_users IS 'Telegram user accounts linked to main user accounts';
COMMENT ON TABLE conversations IS 'Conversation sessions across all platforms (web, telegram, whatsapp)';
COMMENT ON TABLE conversation_messages IS 'Individual messages within conversations';
COMMENT ON TABLE conversation_embeddings IS 'Vector embeddings for semantic search of conversation content';
COMMENT ON TABLE conversation_summaries IS 'AI-generated summaries of conversation chunks';
COMMENT ON TABLE agent_sessions IS 'Persistent state for OpenAI Agents SDK sessions';
COMMENT ON TABLE gap_candidates IS 'Detected calendar gaps for the gap recovery feature';
COMMENT ON TABLE gap_recovery_settings IS 'User preferences for automatic gap detection and recovery';
COMMENT ON TABLE user_preferences IS 'Key-value store for extensible user preferences';
COMMENT ON TABLE audit_logs IS 'Security and change audit trail';

-- =============================================================================
-- GRANTS: Permission setup for different roles
-- =============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Service role gets full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Authenticated users get select on their own data (controlled by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- =============================================================================
-- Migration Complete
-- =============================================================================
