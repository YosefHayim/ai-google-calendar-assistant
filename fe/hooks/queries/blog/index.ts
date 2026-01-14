'use client'

import { useQuery } from '@tanstack/react-query'
import { blogService } from '@/services/blog.service'
import type { BlogQueryParams } from '@/types/blog'
import { QUERY_CONFIG } from '@/lib/constants'

export const blogKeys = {
  all: ['blog'] as const,
  list: (params?: BlogQueryParams) => [...blogKeys.all, 'list', params] as const,
  post: (slug: string) => [...blogKeys.all, 'post', slug] as const,
  categories: () => [...blogKeys.all, 'categories'] as const,
  featured: () => [...blogKeys.all, 'featured'] as const,
  related: (slug: string, limit?: number) => [...blogKeys.all, 'related', slug, limit] as const,
}

export function useBlogPosts(params?: BlogQueryParams) {
  return useQuery({
    queryKey: blogKeys.list(params),
    queryFn: async () => {
      const response = await blogService.getAll(params)
      return response.data ?? { posts: [], total: 0 }
    },
    staleTime: 5 * QUERY_CONFIG.DEFAULT_STALE_TIME,
  })
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: blogKeys.post(slug),
    queryFn: async () => {
      const response = await blogService.getBySlug(slug)
      return response.data
    },
    enabled: !!slug,
    staleTime: 5 * QUERY_CONFIG.DEFAULT_STALE_TIME,
  })
}

export function useBlogCategories() {
  return useQuery({
    queryKey: blogKeys.categories(),
    queryFn: async () => {
      const response = await blogService.getCategories()
      return response.data ?? ['All']
    },
    staleTime: 10 * QUERY_CONFIG.DEFAULT_STALE_TIME,
  })
}

export function useFeaturedPosts() {
  return useQuery({
    queryKey: blogKeys.featured(),
    queryFn: async () => {
      const response = await blogService.getFeatured()
      return response.data ?? []
    },
    staleTime: 5 * QUERY_CONFIG.DEFAULT_STALE_TIME,
  })
}

export function useRelatedPosts(slug: string, limit?: number) {
  return useQuery({
    queryKey: blogKeys.related(slug, limit),
    queryFn: async () => {
      const response = await blogService.getRelated(slug, limit)
      return response.data ?? []
    },
    enabled: !!slug,
    staleTime: 5 * QUERY_CONFIG.DEFAULT_STALE_TIME,
  })
}
