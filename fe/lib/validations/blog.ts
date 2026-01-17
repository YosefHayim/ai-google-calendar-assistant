import { z } from 'zod'
import { BLOG_CATEGORIES } from '@/types/blog'

export const blogPostSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be at most 200 characters'),
  excerpt: z
    .string()
    .min(50, 'Excerpt must be at least 50 characters')
    .max(500, 'Excerpt must be at most 500 characters'),
  content: z
    .string()
    .min(100, 'Content must be at least 100 characters')
    .max(50000, 'Content must be at most 50,000 characters'),
  category: z.enum(BLOG_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  tags: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published']).default('published'),
})

export type BlogPostFormData = z.infer<typeof blogPostSchema>

export const blogPostDefaults: BlogPostFormData = {
  title: '',
  excerpt: '',
  content: '',
  category: 'Productivity',
  tags: '',
  featured: false,
  status: 'published',
}

export const bulkBlogPostSchema = z.object({
  title: z.string().min(10).max(200),
  excerpt: z.string().min(50).max(500),
  content: z.string().min(100).max(50000),
  category: z.enum(BLOG_CATEGORIES),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  status: z.enum(['draft', 'published']).optional(),
  author: z
    .object({
      name: z.string(),
      role: z.string(),
    })
    .optional(),
  read_time: z.string().optional(),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
})

export const bulkBlogPostsSchema = z.array(bulkBlogPostSchema).min(1, 'At least one post is required')

export type BulkBlogPostData = z.infer<typeof bulkBlogPostSchema>
