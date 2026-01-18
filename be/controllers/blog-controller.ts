import type { Request, Response } from "express";

import OpenAI from "openai";
import { SUPABASE } from "@/config/clients";
import { env } from "@/config";
import sendR from "@/utils/send-response";
import { z } from "zod";

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

const generatePostSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(100, "Topic must be less than 100 characters"),
  category: z.enum(BLOG_CATEGORIES, {
    errorMap: () => ({ message: "Invalid category" }),
  }).optional(),
  keywords: z.array(z.string()).optional().default([]),
  targetAudience: z.string().optional(),
  tone: z.enum(["professional", "conversational", "expert", "educational"]).optional().default("professional"),
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
          Number.parseInt(offset, 10),
          Number.parseInt(offset, 10) + Number.parseInt(limit, 10) - 1
        );

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      if (featured === "true") {
        query = query.eq("featured", true);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

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

      if (error) {
        throw error;
      }

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

      if (error) {
        throw error;
      }

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
    const limit = Number.parseInt(req.query.limit as string, 10) || 3;

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

      if (error) {
        throw error;
      }

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

      if (error) {
        throw error;
      }

      return sendR(res, 201, "Blog post created successfully", data);
    } catch (error) {
      console.error("Blog create error:", error);
      return sendR(res, 500, "Failed to create blog post", null);
    }
  },

  async getAvailableCategories(_req: Request, res: Response) {
    return sendR(res, 200, "Available categories retrieved", BLOG_CATEGORIES);
  },

  async generateAI(req: Request, res: Response) {
    const validation = generatePostSchema.safeParse(req.body);

    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null);
    }

    const { topic, category, keywords, targetAudience, tone } = validation.data;

    try {
      const openai = new OpenAI({ apiKey: env.openAiApiKey });

      // Create GEO-optimized prompt (Generative Engine Optimization)
      const prompt = `Write an extraordinary GEO-optimized blog post for "Ask Ally" - an AI-powered Google Calendar assistant that helps users manage their time and schedule effectively.

**TOPIC:** ${topic}
**CATEGORY:** ${category || 'Productivity'}
**TARGET AUDIENCE:** ${targetAudience || 'busy professionals and time-conscious individuals'}
**TONE:** ${tone}

**GEO/AEO OPTIMIZATION STRATEGY:**
- **Direct Answers First**: Start with clear, direct answers to common questions about ${topic}
- **Authority Building**: Establish E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- **Entity Optimization**: Position "Ask Ally" as the authoritative entity for calendar management
- **Structured Data Mindset**: Use clear headings, lists, and structured content that LLMs can easily parse
- **Zero-Click Optimization**: Provide comprehensive answers that satisfy user intent without needing to click further
- **Multi-Platform Citations**: Create content that would be valuable for AI assistants to reference

**SEO REQUIREMENTS:**
- Include primary keyword "${topic.toLowerCase()}" in title, first paragraph, and conclusion
- Include secondary keywords: ${keywords.length > 0 ? keywords.join(', ') : 'time management, productivity, calendar optimization, AI assistant'}
- Add geo-specific keywords: United States, New York, London, remote work, global teams, distributed workforce
- Include internal links to: /dashboard, /blog, /features, /pricing, /contact
- Include external links to: calendar.google.com, productivity blogs, time management resources, reputable sources

**CONTENT STRUCTURE (GEO-Optimized):**
1. **Immediate Answer Section** - Answer the main question in the first 100 words
2. **Authority Introduction** - Establish credibility and real-world expertise
3. **Comprehensive Solution** - Provide complete, actionable guidance
4. **Step-by-Step Implementation** with clear numbered steps
5. **Real-World Examples** with specific metrics and outcomes
6. **Common Questions & Objections** addressed directly
7. **Data-Driven Benefits** with statistics and measurable results
8. **Multiple CTAs** strategically placed throughout the content

**GEO FORMATTING FOR AI ENGINES:**
- **Question-Based Headings**: Use "How to...", "What is...", "Why..." format
- **Table of Contents**: Include clear section navigation
- **Bold Key Terms**: Highlight important concepts and entities
- **Structured Lists**: Numbered steps, bulleted benefits, clear hierarchies
- **Short Paragraphs**: 2-4 sentences maximum for scannability
- **Data Tables**: Include comparative data where relevant
- **FAQ Section**: Address common follow-up questions

**ASK ALLY SPECIFIC GEO CONTENT:**
- Position as the authoritative AI calendar assistant
- Reference specific features: conversation archiving, smart rescheduling, gap recovery, multi-platform sync
- Include testimonials, case studies, and social proof
- Provide comparison data: "Save 2 hours per week" or "Reduce scheduling conflicts by 80%"
- Mention integration capabilities and platform support
- Include pricing transparency and feature comparisons

Return the blog post in this exact JSON format:
{
  "title": "SEO-optimized title here",
  "excerpt": "Compelling 50-160 character excerpt for meta description",
  "content": "Full blog post content in Markdown format",
  "category": "${category || 'Productivity'}",
  "tags": ["array", "of", "relevant", "tags"],
  "seo": {
    "title": "Custom SEO title (50-60 characters)",
    "description": "Meta description (150-160 characters)",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  },
  "url": "https://askally.io/blog/[generated-slug]"
}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert SEO, GEO (Generative Engine Optimization), and AEO (Answer Engine Optimization) content writer specializing in productivity and AI tools. Create extraordinary, conversion-focused blog content that ranks well on Google, gets featured in AI Overviews, and drives sign-ups for Ask Ally. Focus on becoming the direct answer that AI models choose to reference, establishing authority, and providing comprehensive solutions that satisfy user intent without requiring additional clicks."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return sendR(res, 500, "Failed to generate blog post", null);
      }

      // Parse the JSON response
      let generatedPost;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        generatedPost = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return sendR(res, 500, "Failed to parse generated content", null);
      }

      // Generate slug and validate content
      const slug = generateSlug(generatedPost.title);
      const readTime = estimateReadTime(generatedPost.content);

      // Create the blog post
      const postData = {
        slug,
        title: generatedPost.title,
        excerpt: generatedPost.excerpt,
        content: generatedPost.content,
        category: generatedPost.category || category || "Productivity",
        author: { name: "Yosef Sabag", role: "CEO & Co-Founder" },
        read_time: readTime,
        featured: false,
        tags: generatedPost.tags || [],
        seo: generatedPost.seo || {
          title: generatedPost.title,
          description: generatedPost.excerpt,
          keywords: keywords || []
        },
        status: "published",
        published_at: new Date().toISOString(),
      };

      const { data, error } = await blogTable()
        .insert(postData)
        .select()
        .single();

      if (error) {
        console.error("Blog creation error:", error);
        return sendR(res, 500, "Failed to save generated blog post", null);
      }

      // Return the post data with the full URL
      const fullUrl = `${process.env.FRONTEND_URL || 'https://askally.io'}/blog/${slug}`;

      return sendR(res, 201, "AI-generated blog post created successfully", {
        ...data,
        url: fullUrl
      });

    } catch (error) {
      console.error("AI blog generation error:", error);
      return sendR(res, 500, "Failed to generate blog post with AI", null);
    }
  },
};
