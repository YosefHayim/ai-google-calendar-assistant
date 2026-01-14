-- Blog posts table for dynamic content management
-- Image URLs are stored as keys only (e.g., 'focus-time.jpg')
-- Full S3 URL is constructed in the application layer

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_key TEXT, -- Just the filename, e.g., 'focus-time.jpg'
  
  -- Author info stored as JSONB for flexibility
  author JSONB NOT NULL DEFAULT '{"name": "Yosef Sabag", "role": "CEO & Co-Founder"}',
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  read_time TEXT NOT NULL DEFAULT '5 min read',
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  
  -- SEO data stored as JSONB
  seo JSONB NOT NULL DEFAULT '{"title": "", "description": "", "keywords": []}',
  
  -- Status for draft/published workflow
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view published blog posts') THEN
    CREATE POLICY "Anyone can view published blog posts"
      ON blog_posts FOR SELECT
      TO public
      USING (status = 'published');
  END IF;
END
$$;

-- Service role can do everything (for admin operations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role has full access to blog posts') THEN
    CREATE POLICY "Service role has full access to blog posts"
      ON blog_posts FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Add comment describing the table
COMMENT ON TABLE blog_posts IS 'Blog posts with SEO metadata. image_key stores S3 filename only.';
COMMENT ON COLUMN blog_posts.image_key IS 'S3 object key (filename only). Full URL constructed as: https://ally-ai-google-calendar.s3.eu-north-1.amazonaws.com/{image_key}';
