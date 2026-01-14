import type { ApiResponse } from '@/types/api'
import type { BlogPost, BlogPostsResponse, BlogQueryParams } from '@/types/blog'
import { apiClient } from '@/lib/api/client'
import { ASSETS } from '@/lib/constants'

export function getBlogImageUrl(imageKey: string | null | undefined): string | undefined {
  if (!imageKey) return undefined
  return `${ASSETS.S3_BASE_URL}/${imageKey}`
}

export const blogService = {
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

  async getBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    const { data } = await apiClient.get<ApiResponse<BlogPost>>(`/api/blog/${slug}`)
    return data
  },

  async getCategories(): Promise<ApiResponse<string[]>> {
    const { data } = await apiClient.get<ApiResponse<string[]>>('/api/blog/categories')
    return data
  },

  async getFeatured(): Promise<ApiResponse<BlogPost[]>> {
    const { data } = await apiClient.get<ApiResponse<BlogPost[]>>('/api/blog/featured')
    return data
  },

  async getRelated(slug: string, limit?: number): Promise<ApiResponse<BlogPost[]>> {
    const url = limit ? `/api/blog/${slug}/related?limit=${limit}` : `/api/blog/${slug}/related`
    const { data } = await apiClient.get<ApiResponse<BlogPost[]>>(url)
    return data
  },
}
