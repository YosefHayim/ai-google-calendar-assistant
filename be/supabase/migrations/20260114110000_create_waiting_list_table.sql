-- Waiting list table
CREATE TABLE IF NOT EXISTS waiting_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'registered')),
  source TEXT DEFAULT 'landing' CHECK (source IN ('landing', 'blog', 'other')),
  notes TEXT,
  position INTEGER,
  invited_at TIMESTAMP WITH TIME ZONE,
  registered_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_waiting_list_email ON waiting_list(email);
CREATE INDEX IF NOT EXISTS idx_waiting_list_status ON waiting_list(status);
CREATE INDEX IF NOT EXISTS idx_waiting_list_created_at ON waiting_list(created_at);
CREATE INDEX IF NOT EXISTS idx_waiting_list_position ON waiting_list(position);

-- Auto-assign position on insert
CREATE OR REPLACE FUNCTION assign_waiting_list_position()
RETURNS TRIGGER AS $$
BEGIN
  NEW.position := (SELECT COALESCE(MAX(position), 0) + 1 FROM waiting_list);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assign_position_before_insert ON waiting_list;
CREATE TRIGGER assign_position_before_insert
  BEFORE INSERT ON waiting_list
  FOR EACH ROW
  EXECUTE FUNCTION assign_waiting_list_position();

-- Row Level Security
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;

-- Allow anyone to join waiting list (insert)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can join waiting list') THEN
    CREATE POLICY "Anyone can join waiting list"
      ON waiting_list FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END
$$;

-- Only allow users to view their own waiting list entry
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own entry' AND tablename = 'waiting_list') THEN
    CREATE POLICY "Users can view their own entry"
      ON waiting_list FOR SELECT
      TO public
      USING (auth.jwt() ->> 'email' = email);
  END IF;
END
$$;
