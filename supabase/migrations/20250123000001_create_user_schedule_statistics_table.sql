-- Migration: Create user_schedule_statistics table for statistics caching
-- Created: 2025-01-23
-- Description: Stores aggregated schedule statistics for fast retrieval and caching
-- Note: user_id references user_calendar_tokens.user_id but no FK constraint exists
--       because user_calendar_tokens doesn't have a unique constraint on user_id.
--       Referential integrity is handled in application layer.

CREATE TABLE IF NOT EXISTS public.user_schedule_statistics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  statistics JSONB NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Unique constraint on (user_id, period_type, period_start, period_end)
-- This ensures one statistics record per user per period type per date range
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_schedule_statistics_unique 
  ON public.user_schedule_statistics(user_id, period_type, period_start, period_end);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_schedule_statistics_user_id 
  ON public.user_schedule_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_schedule_statistics_period_type 
  ON public.user_schedule_statistics(period_type);
CREATE INDEX IF NOT EXISTS idx_user_schedule_statistics_period_start 
  ON public.user_schedule_statistics(period_start);
CREATE INDEX IF NOT EXISTS idx_user_schedule_statistics_calculated_at 
  ON public.user_schedule_statistics(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_schedule_statistics_statistics 
  ON public.user_schedule_statistics USING GIN(statistics);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_schedule_statistics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row updates
CREATE TRIGGER update_user_schedule_statistics_updated_at
  BEFORE UPDATE ON public.user_schedule_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_schedule_statistics_updated_at();

-- Add comments
COMMENT ON TABLE public.user_schedule_statistics IS 'Stores cached aggregated schedule statistics for fast retrieval';
COMMENT ON COLUMN public.user_schedule_statistics.period_type IS 'Type of period: daily, weekly, monthly';
COMMENT ON COLUMN public.user_schedule_statistics.period_start IS 'Start date of the statistics period';
COMMENT ON COLUMN public.user_schedule_statistics.period_end IS 'End date of the statistics period';
COMMENT ON COLUMN public.user_schedule_statistics.statistics IS 'JSONB object containing aggregated statistics (totalEvents, totalHours, breakdowns, etc.)';
COMMENT ON COLUMN public.user_schedule_statistics.calculated_at IS 'Timestamp when statistics were calculated (used for cache expiration)';

