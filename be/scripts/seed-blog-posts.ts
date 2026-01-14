#!/usr/bin/env bun
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://vdwjfekcsnurtjsieojv.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const S3_BASE_URL =
  "https://ally-ai-google-calendar.s3.eu-north-1.amazonaws.com";

function extractImageKey(imageUrl: string | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith(S3_BASE_URL)) {
    return imageUrl.replace(`${S3_BASE_URL}/`, "");
  }
  return null;
}

interface BlogPostData {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image?: string;
  author: { name: string; role: string; avatar?: string };
  publishedAt: string;
  updatedAt?: string;
  readTime: string;
  featured?: boolean;
  tags: string[];
  seo: { title: string; description: string; keywords: string[] };
}

async function loadBlogPosts(): Promise<BlogPostData[]> {
  const blogPostsPath = path.resolve(
    __dirname,
    "../../fe/lib/data/blog-posts.ts",
  );
  const content = fs.readFileSync(blogPostsPath, "utf-8");

  const postsMatch = content.match(
    /export const BLOG_POSTS: BlogPost\[\] = \[([\s\S]*)\];?\s*$/m,
  );
  if (!postsMatch) {
    throw new Error("Could not find BLOG_POSTS array in file");
  }

  const dataFile = path.resolve(__dirname, "../../fe/lib/data/blog-posts.ts");
  const { BLOG_POSTS } = await import(dataFile);
  return BLOG_POSTS as BlogPostData[];
}

async function seedBlogPosts() {
  console.log("Loading blog posts from frontend data file...");

  let blogPosts: BlogPostData[];
  try {
    blogPosts = await loadBlogPosts();
  } catch {
    console.error(
      "Failed to load blog posts. Run this script with bun from the be/ directory:",
    );
    console.error(
      "  cd be && SUPABASE_SERVICE_ROLE_KEY=... bun run scripts/seed-blog-posts.ts",
    );
    process.exit(1);
  }

  console.log(`Found ${blogPosts.length} posts to seed.`);

  const postsToInsert = blogPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    image_key: extractImageKey(post.image),
    author: post.author,
    published_at: new Date(post.publishedAt).toISOString(),
    updated_at: post.updatedAt ? new Date(post.updatedAt).toISOString() : null,
    read_time: post.readTime,
    featured: post.featured ?? false,
    tags: post.tags,
    seo: post.seo,
    status: "published" as const,
  }));

  console.log("Sample post data:", JSON.stringify(postsToInsert[0], null, 2));

  const { data, error } = await supabase
    .from("blog_posts")
    .upsert(postsToInsert, { onConflict: "slug" })
    .select();

  if (error) {
    console.error("Error seeding blog posts:", error);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data?.length || 0} blog posts!`);

  const withImages = postsToInsert.filter((p) => p.image_key).length;
  const withoutImages = postsToInsert.filter((p) => !p.image_key).length;
  console.log(`Posts with S3 images: ${withImages}`);
  console.log(`Posts without S3 images (Unsplash): ${withoutImages}`);

  process.exit(0);
}

seedBlogPosts().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
