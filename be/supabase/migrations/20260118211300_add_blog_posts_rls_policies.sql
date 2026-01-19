-- Migration: Add RLS policies for blog_posts table
-- This allows:
--   - Public SELECT for published posts (for blog readers)
--   - Full CRUD for service role (backend admin operations)

-- First, check if RLS is enabled and enable if not
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe re-run)
DROP POLICY IF EXISTS "Allow public read access to published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow service role full access to blog posts" ON public.blog_posts;

-- Policy 1: Public read access for published posts only
-- Anyone can read blog posts that are published
CREATE POLICY "Allow public read access to published blog posts"
ON public.blog_posts
FOR SELECT
TO public
USING (status = 'published');

-- Policy 2: Service role has full access (for admin/backend operations)
-- This allows the backend to create, update, delete posts via service role key
CREATE POLICY "Allow service role full access to blog posts"
ON public.blog_posts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
