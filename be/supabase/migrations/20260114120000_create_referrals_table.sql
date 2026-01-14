-- Referrals/Affiliate program table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_email TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  referred_email TEXT,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'converted', 'rewarded', 'expired')),
  reward_type TEXT DEFAULT 'free_month' CHECK (reward_type IN ('free_month', 'discount', 'credits', 'custom')),
  reward_amount INTEGER DEFAULT 1,
  reward_claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral stats table for tracking user's referral performance
CREATE TABLE IF NOT EXISTS referral_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_referrals INTEGER DEFAULT 0,
  successful_referrals INTEGER DEFAULT 0,
  pending_referrals INTEGER DEFAULT 0,
  total_rewards_earned INTEGER DEFAULT 0,
  total_free_months_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_email ON referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);

-- Indexes for referral_stats
CREATE INDEX IF NOT EXISTS idx_referral_stats_user_id ON referral_stats(user_id);

-- Row Level Security for referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referrals (as referrer)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own referrals') THEN
    CREATE POLICY "Users can view their own referrals"
      ON referrals FOR SELECT
      TO authenticated
      USING (auth.uid() = referrer_id);
  END IF;
END
$$;

-- Users can create referrals
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create referrals') THEN
    CREATE POLICY "Users can create referrals"
      ON referrals FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = referrer_id);
  END IF;
END
$$;

-- Users can update their own referrals
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own referrals') THEN
    CREATE POLICY "Users can update their own referrals"
      ON referrals FOR UPDATE
      TO authenticated
      USING (auth.uid() = referrer_id);
  END IF;
END
$$;

-- Row Level Security for referral_stats
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

-- Users can view their own stats
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own referral stats') THEN
    CREATE POLICY "Users can view their own referral stats"
      ON referral_stats FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Users can insert their own stats
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own referral stats') THEN
    CREATE POLICY "Users can insert their own referral stats"
      ON referral_stats FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Users can update their own stats
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own referral stats') THEN
    CREATE POLICY "Users can update their own referral stats"
      ON referral_stats FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code on insert
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_referral_code ON referrals;
CREATE TRIGGER trigger_set_referral_code
  BEFORE INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- Trigger to update referral_stats when a referral status changes
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert referral stats for the referrer
  INSERT INTO referral_stats (user_id, total_referrals, pending_referrals, successful_referrals)
  VALUES (NEW.referrer_id, 1, 
    CASE WHEN NEW.status = 'pending' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status IN ('converted', 'rewarded') THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_referrals = referral_stats.total_referrals + 
      CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
    pending_referrals = (
      SELECT COUNT(*) FROM referrals 
      WHERE referrer_id = NEW.referrer_id AND status = 'pending'
    ),
    successful_referrals = (
      SELECT COUNT(*) FROM referrals 
      WHERE referrer_id = NEW.referrer_id AND status IN ('converted', 'rewarded')
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_referral_stats ON referrals;
CREATE TRIGGER trigger_update_referral_stats
  AFTER INSERT OR UPDATE ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referral_stats();
