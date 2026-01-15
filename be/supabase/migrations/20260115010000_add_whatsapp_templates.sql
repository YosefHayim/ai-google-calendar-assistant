-- Migration: Add WhatsApp Message Templates Table
-- Date: 2026-01-15
-- Description: Add whatsapp_message_templates table for tracking approved templates

-- =====================================================
-- STEP 1: Create whatsapp_message_templates table
-- =====================================================
CREATE TABLE IF NOT EXISTS whatsapp_message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT NOT NULL UNIQUE,
    template_category TEXT NOT NULL DEFAULT 'UTILITY',
    language_code TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'PENDING',
    header_format TEXT,
    body_text TEXT NOT NULL,
    footer_text TEXT,
    button_count INTEGER DEFAULT 0,
    parameter_count INTEGER DEFAULT 0,
    meta_template_id TEXT,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED')),
    CONSTRAINT valid_category CHECK (template_category IN ('UTILITY', 'MARKETING', 'AUTHENTICATION'))
);

-- =====================================================
-- STEP 2: Create indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_name ON whatsapp_message_templates(template_name);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_status ON whatsapp_message_templates(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_category ON whatsapp_message_templates(template_category);

-- =====================================================
-- STEP 3: Enable RLS
-- =====================================================
ALTER TABLE whatsapp_message_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: Create RLS policies (admin only)
-- =====================================================
CREATE POLICY "Service role has full access to whatsapp_message_templates"
    ON whatsapp_message_templates FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- STEP 5: Add update trigger for updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_whatsapp_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_whatsapp_templates_updated_at ON whatsapp_message_templates;
CREATE TRIGGER trigger_whatsapp_templates_updated_at
    BEFORE UPDATE ON whatsapp_message_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_templates_updated_at();

-- =====================================================
-- STEP 6: Insert default templates
-- =====================================================
INSERT INTO whatsapp_message_templates (template_name, template_category, body_text, parameter_count, status)
VALUES 
    ('reengagement_message', 'UTILITY', 'Hi! I have an update for you: {{1}}', 1, 'PENDING'),
    ('calendar_reminder', 'UTILITY', 'Reminder: {{1}} is coming up at {{2}}', 2, 'PENDING'),
    ('daily_briefing', 'UTILITY', 'Good morning! Here is your schedule for today: {{1}}', 1, 'PENDING')
ON CONFLICT (template_name) DO NOTHING;
