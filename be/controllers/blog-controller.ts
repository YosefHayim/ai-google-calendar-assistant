import type { Request, Response } from "express";
import { z } from "zod";
import { SUPABASE } from "@/config/clients";
import sendR from "@/utils/send-response";

// Blog posts table is not yet in database.types.ts - use untyped queries
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blogTable = () => (SUPABASE as any).from("blog_posts");

const BLOG_CATEGORIES = [
  "Productivity",
  "Time Management",
  "AI & Technology",
  "Tips & Tricks",
  "Work-Life Balance",
  "Meeting Efficiency",
] as const;

const listQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

const createPostSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  excerpt: z.string().min(50, "Excerpt must be at least 50 characters"),
  content: z.string().min(100, "Content must be at least 100 characters"),
  category: z.enum(BLOG_CATEGORIES, {
    errorMap: () => ({ message: "Invalid category" }),
  }),
  image_key: z.string().optional().nullable(),
  author: z
    .object({
      name: z.string().default("Yosef Sabag"),
      role: z.string().default("CEO & Co-Founder"),
    })
    .optional(),
  read_time: z.string().optional(),
  featured: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional().default([]),
    })
    .optional(),
  status: z.enum(["draft", "published"]).optional().default("published"),
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
}

function estimateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export const blogController = {
  async getAll(req: Request, res: Response) {
    const validation = listQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null);
    }

    const { category, featured, limit = "50", offset = "0" } = validation.data;

    try {
      let query = blogTable()
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(
          Number.parseInt(offset),
          Number.parseInt(offset) + Number.parseInt(limit) - 1
        );

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      if (featured === "true") {
        query = query.eq("featured", true);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return sendR(res, 200, "Blog posts retrieved successfully", {
        posts: data || [],
        total: count || data?.length || 0,
      });
    } catch (error) {
      console.error("Blog getAll error:", error);
      return sendR(res, 500, "Failed to fetch blog posts", null);
    }
  },

  async getBySlug(req: Request, res: Response) {
    const { slug } = req.params;

    if (!slug) {
      return sendR(res, 400, "Slug is required", null);
    }

    try {
      const { data, error } = await blogTable()
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error || !data) {
        return sendR(res, 404, "Blog post not found", null);
      }

      return sendR(res, 200, "Blog post retrieved successfully", data);
    } catch (error) {
      console.error("Blog getBySlug error:", error);
      return sendR(res, 500, "Failed to fetch blog post", null);
    }
  },

  async getCategories(_req: Request, res: Response) {
    try {
      const { data, error } = await blogTable()
        .select("category")
        .eq("status", "published");

      if (error) throw error;

      const categories = [
        ...new Set(data?.map((p: { category: string }) => p.category) || []),
      ];
      const categoriesWithAll = ["All", ...categories.sort()];

      return sendR(
        res,
        200,
        "Categories retrieved successfully",
        categoriesWithAll
      );
    } catch (error) {
      console.error("Blog getCategories error:", error);
      return sendR(res, 500, "Failed to fetch categories", null);
    }
  },

  async getFeatured(_req: Request, res: Response) {
    try {
      const { data, error } = await blogTable()
        .select("*")
        .eq("status", "published")
        .eq("featured", true)
        .order("published_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      return sendR(
        res,
        200,
        "Featured posts retrieved successfully",
        data || []
      );
    } catch (error) {
      console.error("Blog getFeatured error:", error);
      return sendR(res, 500, "Failed to fetch featured posts", null);
    }
  },

  async getRelated(req: Request, res: Response) {
    const { slug } = req.params;
    const limit = Number.parseInt(req.query.limit as string) || 3;

    if (!slug) {
      return sendR(res, 400, "Slug is required", null);
    }

    try {
      const { data: currentPost } = await blogTable()
        .select("category, tags")
        .eq("slug", slug)
        .single();

      if (!currentPost) {
        return sendR(res, 404, "Blog post not found", null);
      }

      const { data, error } = await blogTable()
        .select("*")
        .eq("status", "published")
        .eq("category", currentPost.category)
        .neq("slug", slug)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return sendR(
        res,
        200,
        "Related posts retrieved successfully",
        data || []
      );
    } catch (error) {
      console.error("Blog getRelated error:", error);
      return sendR(res, 500, "Failed to fetch related posts", null);
    }
  },

  async create(req: Request, res: Response) {
    const validation = createPostSchema.safeParse(req.body);

    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null);
    }

    const postData = validation.data;
    const slug = generateSlug(postData.title);
    const readTime = postData.read_time || estimateReadTime(postData.content);

    try {
      const { data: existingPost } = await blogTable()
        .select("slug")
        .eq("slug", slug)
        .single();

      if (existingPost) {
        return sendR(
          res,
          409,
          "A blog post with this title already exists",
          null
        );
      }

      const defaultAuthor = { name: "Yosef Sabag", role: "CEO & Co-Founder" };
      const defaultSeo = {
        title: postData.title,
        description: postData.excerpt,
        keywords: postData.tags || [],
      };

      const { data, error } = await blogTable()
        .insert({
          slug,
          title: postData.title,
          excerpt: postData.excerpt,
          content: postData.content,
          category: postData.category,
          image_key: postData.image_key || null,
          author: postData.author || defaultAuthor,
          read_time: readTime,
          featured: postData.featured,
          tags: postData.tags || [],
          seo: postData.seo || defaultSeo,
          status: postData.status || "published",
          published_at:
            postData.status === "published" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      return sendR(res, 201, "Blog post created successfully", data);
    } catch (error) {
      console.error("Blog create error:", error);
      return sendR(res, 500, "Failed to create blog post", null);
    }
  },

  async getAvailableCategories(_req: Request, res: Response) {
    return sendR(res, 200, "Available categories retrieved", BLOG_CATEGORIES);
  },
};
