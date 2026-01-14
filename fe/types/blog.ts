export interface BlogAuthor {
  name: string
  role: string
  avatar?: string
}

export interface BlogSEO {
  title: string
  description: string
  keywords: string[]
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  image_key: string | null
  author: BlogAuthor
  published_at: string
  updated_at: string | null
  created_at: string
  read_time: string
  featured: boolean
  tags: string[]
  seo: BlogSEO
  status: 'draft' | 'published' | 'archived'
}

export interface BlogPostsResponse {
  posts: BlogPost[]
  total: number
}

export interface BlogQueryParams {
  category?: string
  featured?: boolean
  limit?: number
  offset?: number
}

export const BLOG_CATEGORIES = [
  'Productivity',
  'Time Management',
  'AI & Technology',
  'Tips & Tricks',
  'Work-Life Balance',
  'Meeting Efficiency',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

export interface CreateBlogPostData {
  title: string
  excerpt: string
  content: string
  category: BlogCategory
  image_key?: string | null
  author?: {
    name: string
    role: string
  }
  read_time?: string
  featured?: boolean
  tags?: string[]
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  status?: 'draft' | 'published'
}
