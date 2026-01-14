import type { Request, Response } from "express";
import { z } from "zod";
import { SUPABASE } from "@/config/clients";
import sendR from "@/utils/send-response";

const listQuerySchema = z.object({
  category: z.string().optional(),
  featured: z.enum(["true", "false"]).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
});

export const blogController = {
  async getAll(req: Request, res: Response) {
    const validation = listQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null);
    }

    const { category, featured, limit = "50", offset = "0" } = validation.data;

    try {
      let query = SUPABASE.from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

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
      const { data, error } = await SUPABASE.from("blog_posts")
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
      const { data, error } = await SUPABASE.from("blog_posts")
        .select("category")
        .eq("status", "published");

      if (error) throw error;

      const categories = [...new Set(data?.map((p) => p.category) || [])];
      const categoriesWithAll = ["All", ...categories.sort()];

      return sendR(
        res,
        200,
        "Categories retrieved successfully",
        categoriesWithAll,
      );
    } catch (error) {
      console.error("Blog getCategories error:", error);
      return sendR(res, 500, "Failed to fetch categories", null);
    }
  },

  async getFeatured(_req: Request, res: Response) {
    try {
      const { data, error } = await SUPABASE.from("blog_posts")
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
        data || [],
      );
    } catch (error) {
      console.error("Blog getFeatured error:", error);
      return sendR(res, 500, "Failed to fetch featured posts", null);
    }
  },

  async getRelated(req: Request, res: Response) {
    const { slug } = req.params;
    const limit = parseInt(req.query.limit as string) || 3;

    if (!slug) {
      return sendR(res, 400, "Slug is required", null);
    }

    try {
      const { data: currentPost } = await SUPABASE.from("blog_posts")
        .select("category, tags")
        .eq("slug", slug)
        .single();

      if (!currentPost) {
        return sendR(res, 404, "Blog post not found", null);
      }

      const { data, error } = await SUPABASE.from("blog_posts")
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
        data || [],
      );
    } catch (error) {
      console.error("Blog getRelated error:", error);
      return sendR(res, 500, "Failed to fetch related posts", null);
    }
  },
};
