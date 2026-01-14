-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source TEXT DEFAULT 'blog' CHECK (source IN ('blog', 'homepage', 'footer', 'other')),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscriptions(subscribed_at);

-- Row Level Security
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can subscribe to newsletter') THEN
    CREATE POLICY "Anyone can subscribe to newsletter"
      ON newsletter_subscriptions FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END
$$;

-- Only allow users to view their own subscription
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own subscription' AND tablename = 'newsletter_subscriptions') THEN
    CREATE POLICY "Users can view their own subscription"
      ON newsletter_subscriptions FOR SELECT
      TO public
      USING (auth.jwt() ->> 'email' = email);
  END IF;
END
$$;

-- Only allow users to update/delete their own subscription (unsubscribe)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own subscription') THEN
    CREATE POLICY "Users can update their own subscription"
      ON newsletter_subscriptions FOR UPDATE
      TO public
      USING (auth.jwt() ->> 'email' = email);
  END IF;
END
$$;
