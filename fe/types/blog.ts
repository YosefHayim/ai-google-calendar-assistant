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
