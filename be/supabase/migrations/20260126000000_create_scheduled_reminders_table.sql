-- Create scheduled_reminders table
CREATE TABLE scheduled_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  delivery_channel TEXT NOT NULL, -- 'telegram', 'whatsapp', 'slack', 'email', 'push', 'origin' (same modality as created)
  origin_modality TEXT NOT NULL, -- 'web', 'telegram', 'whatsapp', 'slack'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  related_event_id TEXT, -- Optional: link to calendar event
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_reminders_user_id ON scheduled_reminders(user_id);
CREATE INDEX idx_reminders_scheduled_at ON scheduled_reminders(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_reminders_status ON scheduled_reminders(status);

-- RLS Policies
ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reminders" ON scheduled_reminders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders" ON scheduled_reminders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders" ON scheduled_reminders FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role full access" ON scheduled_reminders FOR ALL TO service_role USING (true) WITH CHECK (true);
