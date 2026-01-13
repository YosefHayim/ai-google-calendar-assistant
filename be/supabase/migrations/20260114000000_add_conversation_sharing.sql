-- Migration: Add conversation sharing columns
-- Description: Enable secure conversation sharing via unique tokens with expiration

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS share_token TEXT,
ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_conversations_share_token ON conversations (share_token) WHERE share_token IS NOT NULL;

COMMENT ON COLUMN conversations.share_token IS 'Unique token for sharing conversation publicly';
COMMENT ON COLUMN conversations.share_expires_at IS 'Expiration timestamp for the share link';
