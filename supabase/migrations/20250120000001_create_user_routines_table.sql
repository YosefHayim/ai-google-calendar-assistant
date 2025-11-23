-- Migration: Create user_routines table for routine learning system
-- Created: 2025-01-20
-- Description: Stores learned user routines, patterns, and time optimizations
-- Note: user_id references user_calendar_tokens.user_id but no FK constraint exists
--       because user_calendar_tokens doesn't have a unique constraint on user_id.
--       Referential integrity is handled in application layer.

CREATE TABLE IF NOT EXISTS public.user_routines (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  routine_type TEXT NOT NULL CHECK (routine_type IN ('daily', 'weekly', 'monthly', 'event_pattern', 'time_slot')),
  pattern_data JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  frequency INTEGER,
  last_observed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_routines_user_id ON public.user_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_user_routines_type ON public.user_routines(routine_type);
CREATE INDEX IF NOT EXISTS idx_user_routines_updated ON public.user_routines(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_routines_confidence ON public.user_routines(confidence_score DESC) WHERE confidence_score >= 0.7;
CREATE INDEX IF NOT EXISTS idx_user_routines_pattern_data ON public.user_routines USING GIN(pattern_data);

-- Unique index for user_id, routine_type, and pattern key combination
-- This ensures one routine per user per type per pattern key
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_routines_unique_pattern 
  ON public.user_routines(user_id, routine_type, (pattern_data->>'key'));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row updates
CREATE TRIGGER update_user_routines_updated_at
  BEFORE UPDATE ON public.user_routines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE public.user_routines IS 'Stores learned user routines and patterns from calendar events';
COMMENT ON COLUMN public.user_routines.routine_type IS 'Type of routine: daily, weekly, monthly, event_pattern, time_slot';
COMMENT ON COLUMN public.user_routines.pattern_data IS 'JSONB object containing pattern details (key, event_summary, typical_start_time, etc.)';
COMMENT ON COLUMN public.user_routines.confidence_score IS 'Confidence level 0.0-1.0 indicating pattern reliability';
COMMENT ON COLUMN public.user_routines.frequency IS 'How often this pattern occurs (e.g., times per week)';
COMMENT ON COLUMN public.user_routines.last_observed_at IS 'Last time this pattern was observed in calendar events';

