-- Team invites table
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inviter_email TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  invite_token TEXT NOT NULL UNIQUE,
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table for organizing users
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT,
  max_members INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members junction table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(team_id, user_id)
);

-- Indexes for team_invites
CREATE INDEX IF NOT EXISTS idx_team_invites_inviter_id ON team_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_invitee_email ON team_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_team_invites_invite_token ON team_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_team_invites_status ON team_invites(status);
CREATE INDEX IF NOT EXISTS idx_team_invites_created_at ON team_invites(created_at);

-- Indexes for teams
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);

-- Indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Row Level Security for team_invites
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Users can view invites they sent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view invites they sent') THEN
    CREATE POLICY "Users can view invites they sent"
      ON team_invites FOR SELECT
      TO authenticated
      USING (auth.uid() = inviter_id);
  END IF;
END
$$;

-- Users can view invites sent to them
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view invites sent to them') THEN
    CREATE POLICY "Users can view invites sent to them"
      ON team_invites FOR SELECT
      TO authenticated
      USING (auth.jwt() ->> 'email' = invitee_email);
  END IF;
END
$$;

-- Users can create invites
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create team invites') THEN
    CREATE POLICY "Users can create team invites"
      ON team_invites FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = inviter_id);
  END IF;
END
$$;

-- Users can update invites they sent or received
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update team invites') THEN
    CREATE POLICY "Users can update team invites"
      ON team_invites FOR UPDATE
      TO authenticated
      USING (auth.uid() = inviter_id OR auth.jwt() ->> 'email' = invitee_email);
  END IF;
END
$$;

-- Users can delete invites they sent
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete team invites they sent') THEN
    CREATE POLICY "Users can delete team invites they sent"
      ON team_invites FOR DELETE
      TO authenticated
      USING (auth.uid() = inviter_id);
  END IF;
END
$$;

-- Row Level Security for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Team members can view their teams
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view their teams') THEN
    CREATE POLICY "Team members can view their teams"
      ON teams FOR SELECT
      TO authenticated
      USING (
        auth.uid() = owner_id OR
        EXISTS (
          SELECT 1 FROM team_members 
          WHERE team_members.team_id = teams.id 
          AND team_members.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

-- Only owners can create teams
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create teams') THEN
    CREATE POLICY "Users can create teams"
      ON teams FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END
$$;

-- Only owners can update teams
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team owners can update teams') THEN
    CREATE POLICY "Team owners can update teams"
      ON teams FOR UPDATE
      TO authenticated
      USING (auth.uid() = owner_id);
  END IF;
END
$$;

-- Only owners can delete teams
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team owners can delete teams') THEN
    CREATE POLICY "Team owners can delete teams"
      ON teams FOR DELETE
      TO authenticated
      USING (auth.uid() = owner_id);
  END IF;
END
$$;

-- Row Level Security for team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Team members can view other members in their teams
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view team members') THEN
    CREATE POLICY "Team members can view team members"
      ON team_members FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM team_members tm 
          WHERE tm.team_id = team_members.team_id 
          AND tm.user_id = auth.uid()
        )
      );
  END IF;
END
$$;

-- Team admins/owners can add members
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team admins can add members') THEN
    CREATE POLICY "Team admins can add members"
      ON team_members FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM teams 
          WHERE teams.id = team_members.team_id 
          AND teams.owner_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM team_members tm 
          WHERE tm.team_id = team_members.team_id 
          AND tm.user_id = auth.uid()
          AND tm.role IN ('owner', 'admin')
        )
      );
  END IF;
END
$$;

-- Team admins/owners can remove members
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Team admins can remove members') THEN
    CREATE POLICY "Team admins can remove members"
      ON team_members FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM teams 
          WHERE teams.id = team_members.team_id 
          AND teams.owner_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM team_members tm 
          WHERE tm.team_id = team_members.team_id 
          AND tm.user_id = auth.uid()
          AND tm.role IN ('owner', 'admin')
        ) OR
        -- Users can remove themselves
        user_id = auth.uid()
      );
  END IF;
END
$$;

-- Function to generate unique invite token
CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..32 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invite token on insert
CREATE OR REPLACE FUNCTION set_invite_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_token IS NULL OR NEW.invite_token = '' THEN
    NEW.invite_token := generate_invite_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_invite_token ON team_invites;
CREATE TRIGGER trigger_set_invite_token
  BEFORE INSERT ON team_invites
  FOR EACH ROW
  EXECUTE FUNCTION set_invite_token();
