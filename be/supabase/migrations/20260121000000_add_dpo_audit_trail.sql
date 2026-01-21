-- Migration: Add DPO (Dynamic Prompt Optimization) Audit Trail
-- Creates agents_registry and optimization_history tables for tracking
-- every prompt optimization decision made by the AI system.

-- Create enum for optimization outcomes
CREATE TYPE optimization_outcome AS ENUM ('PASS', 'OPTIMIZED', 'REJECTED');

-- Create enum for user intent categories
CREATE TYPE user_intent_category AS ENUM (
  'scheduling',
  'deletion',
  'update',
  'search',
  'bulk_operation',
  'constraint_based',
  'other'
);

-- Create agents_registry table
CREATE TABLE agents_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT UNIQUE NOT NULL,
  agent_name TEXT NOT NULL,
  description TEXT,
  base_prompt TEXT NOT NULL,
  model_tier TEXT NOT NULL CHECK (model_tier IN ('fast', 'medium', 'current')),
  requires_optimization BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create optimization_history table
CREATE TABLE optimization_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL REFERENCES agents_registry(agent_id) ON DELETE CASCADE,
  user_query TEXT NOT NULL,
  original_prompt TEXT NOT NULL,
  optimized_prompt TEXT,
  optimization_reason TEXT,
  judge_reasoning TEXT,
  outcome optimization_outcome NOT NULL,
  user_intent_category user_intent_category NOT NULL DEFAULT 'other',
  is_shadow_run BOOLEAN NOT NULL DEFAULT false,
  optimizer_time_ms INTEGER,
  judge_time_ms INTEGER,
  total_time_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_optimization_history_user_id ON optimization_history(user_id);
CREATE INDEX idx_optimization_history_agent_id ON optimization_history(agent_id);
CREATE INDEX idx_optimization_history_outcome ON optimization_history(outcome);
CREATE INDEX idx_optimization_history_created_at ON optimization_history(created_at DESC);
CREATE INDEX idx_optimization_history_user_intent ON optimization_history(user_intent_category);
CREATE INDEX idx_agents_registry_requires_optimization ON agents_registry(requires_optimization) WHERE requires_optimization = true;

-- Trigger to auto-update updated_at on agents_registry
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_registry_updated_at
  BEFORE UPDATE ON agents_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE agents_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_history ENABLE ROW LEVEL SECURITY;

-- agents_registry: Read-only for authenticated users, admin-only writes
CREATE POLICY "Anyone can read agents_registry"
  ON agents_registry FOR SELECT
  TO authenticated
  USING (true);

-- optimization_history: Users can only see their own history
CREATE POLICY "Users can read own optimization_history"
  ON optimization_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can insert (backend writes)
CREATE POLICY "Service role can insert optimization_history"
  ON optimization_history FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can manage agents_registry"
  ON agents_registry FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed initial agents (orchestrator + handoff agents that need optimization)
INSERT INTO agents_registry (agent_id, agent_name, description, base_prompt, model_tier, requires_optimization) VALUES
  ('calendar_orchestrator_agent', 'Calendar Orchestrator', 'Main orchestrator that routes user requests to specialized agents', 'You are the Calendar Orchestrator - the main router that parses user intent and delegates to appropriate handlers or handles retrieval directly.', 'current', true),
  ('create_event_handoff_agent', 'Create Event Handoff', 'Handles event creation with complex scheduling requirements', 'You are an intelligent calendar assistant that schedules events accurately while respecting the users existing schedule.', 'medium', true),
  ('update_event_handoff_agent', 'Update Event Handoff', 'Handles event modifications and rescheduling', 'You are a calendar event update handler that modifies existing events based on user requests.', 'medium', true),
  ('delete_event_handoff_agent', 'Delete Event Handoff', 'Handles event deletion requests', 'You are a calendar event deletion handler that removes events based on user requests.', 'medium', false),
  ('parse_event_text_agent', 'Parse Event Text', 'Parses natural language into structured event data', 'You are a natural language event parser that converts free-text into structured calendar event JSON.', 'current', false),
  ('update_event_agent', 'Update Event', 'Atomic event updater', 'You are a calendar event updater.', 'fast', false),
  ('delete_event_agent', 'Delete Event', 'Atomic event deleter', 'You are a calendar event deleter.', 'fast', false);

COMMENT ON TABLE agents_registry IS 'Registry of all AI agents with their configurations and optimization settings';
COMMENT ON TABLE optimization_history IS 'Audit trail of all prompt optimization decisions made by the DPO system';
COMMENT ON COLUMN optimization_history.is_shadow_run IS 'True if this was a background run for data collection (user opted out of optimization)';
