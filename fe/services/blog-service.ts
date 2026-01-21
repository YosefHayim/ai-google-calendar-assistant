import type { BlogCategory, BlogPost, BlogPostsResponse, BlogQueryParams, CreateBlogPostData } from '@/types/blog'

import { ASSETS } from '@/lib/constants'
import type { ApiResponse } from '@/types/api'
import { apiClient } from '@/lib/api/client'

/**
 * Generates a full S3 URL for a blog post image.
 *
 * Constructs the complete URL by combining the S3 base URL with the image key.
 * Returns undefined if no image key is provided.
 *
 * @param imageKey - The S3 object key for the blog image
 * @returns Full S3 URL or undefined if imageKey is null/undefined
 *
 * @example
 * getBlogImageUrl('blog/post-1/header.jpg') // "https://cdn.example.com/blog/post-1/header.jpg"
 * getBlogImageUrl(null) // undefined
 */
export function getBlogImageUrl(imageKey: string | null | undefined): string | undefined {
  if (!imageKey) return undefined
  return `${ASSETS.S3_BASE_URL}/${imageKey}`
}

/**
 * Blog service providing methods to interact with the blog API.
 *
 * Handles fetching blog posts, categories, and managing blog content.
 */
export const blogService = {
  /**
   * Fetches all blog posts with optional filtering and pagination.
   *
   * @param params - Optional query parameters for filtering and pagination
   * @param params.category - Filter posts by specific category
   * @param params.featured - Only return featured posts if true
   * @param params.limit - Maximum number of posts to return
   * @param params.offset - Number of posts to skip for pagination
   * @returns Promise resolving to API response with blog posts data
   */
  async getAll(params?: BlogQueryParams): Promise<ApiResponse<BlogPostsResponse>> {
    const searchParams = new URLSearchParams()
    if (params?.category && params.category !== 'All') {
      searchParams.set('category', params.category)
    }
    if (params?.featured) {
      searchParams.set('featured', 'true')
    }
    if (params?.limit) {
      searchParams.set('limit', String(params.limit))
    }
    if (params?.offset) {
      searchParams.set('offset', String(params.offset))
    }

    const query = searchParams.toString()
    const url = query ? `/api/blog?${query}` : '/api/blog'

    const { data } = await apiClient.get<ApiResponse<BlogPostsResponse>>(url)
    return data
  },

  /**
   * Fetches a single blog post by its URL slug.
   *
   * @param slug - The URL slug of the blog post
   * @returns Promise resolving to API response with blog post data
   */
  async getBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    const { data } = await apiClient.get<ApiResponse<BlogPost>>(`/api/blog/${slug}`)
    return data
  },

  /**
   * Fetches all available blog post categories.
   *
   * @returns Promise resolving to API response with array of category names
   */
  async getCategories(): Promise<ApiResponse<string[]>> {
    const { data } = await apiClient.get<ApiResponse<string[]>>('/api/blog/categories')
    return data
  },

  /**
   * Fetches all featured blog posts.
   *
   * @returns Promise resolving to API response with array of featured blog posts
   */
  async getFeatured(): Promise<ApiResponse<BlogPost[]>> {
    const { data } = await apiClient.get<ApiResponse<BlogPost[]>>('/api/blog/featured')
    return data
  },

  /**
   * Fetches related blog posts for a given post.
   *
   * @param slug - The slug of the current blog post
   * @param limit - Optional maximum number of related posts to return
   * @returns Promise resolving to API response with array of related blog posts
   */
  async getRelated(slug: string, limit?: number): Promise<ApiResponse<BlogPost[]>> {
    const url = limit ? `/api/blog/${slug}/related?limit=${limit}` : `/api/blog/${slug}/related`
    const { data } = await apiClient.get<ApiResponse<BlogPost[]>>(url)
    return data
  },

  /**
   * Fetches all available blog categories with metadata.
   *
   * @returns Promise resolving to API response with array of blog category objects
   */
  async getAvailableCategories(): Promise<ApiResponse<BlogCategory[]>> {
    const { data } = await apiClient.get<ApiResponse<BlogCategory[]>>('/api/blog/categories/available')
    return data
  },

  /**
   * Creates a new blog post.
   *
   * @param postData - The blog post data to create
   * @returns Promise resolving to API response with the created blog post
   */
  async create(postData: CreateBlogPostData): Promise<ApiResponse<BlogPost>> {
    const { data } = await apiClient.post<ApiResponse<BlogPost>>('/api/blog', postData)
    return data
  },

  /**
   * Generates a new blog post using AI based on the provided parameters.
   *
   * @param generateData - Parameters for AI blog post generation
   * @param generateData.topic - The main topic or title for the blog post
   * @param generateData.category - Optional category for the blog post
   * @param generateData.keywords - Optional keywords to include in the content
   * @param generateData.targetAudience - Optional target audience description
   * @param generateData.tone - Optional writing tone for the content
   * @returns Promise resolving to API response with the generated blog post and URL
   */
  async generateAI(generateData: {
    topic: string
    category?: BlogCategory
    keywords?: string[]
    targetAudience?: string
    tone?: 'professional' | 'conversational' | 'expert' | 'educational'
  }): Promise<ApiResponse<BlogPost & { url: string }>> {
    const { data } = await apiClient.post<ApiResponse<BlogPost & { url: string }>>(
      '/api/blog/generate-ai',
      generateData,
    )
    return data
  },
}
