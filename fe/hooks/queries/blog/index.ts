'use client'

import type { BlogCategory, BlogQueryParams, CreateBlogPostData } from '@/types/blog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { QUERY_CONFIG } from '@/lib/constants'
import { blogService } from '@/services/blog-service'
import { toast } from 'sonner'

export const blogKeys = {
  all: ['blog'] as const,
  list: (params?: BlogQueryParams) => [...blogKeys.all, 'list', params] as const,
  post: (slug: string) => [...blogKeys.all, 'post', slug] as const,
  categories: () => [...blogKeys.all, 'categories'] as const,
  availableCategories: () => [...blogKeys.all, 'availableCategories'] as const,
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

export function useAvailableCategories() {
  return useQuery({
    queryKey: blogKeys.availableCategories(),
    queryFn: async () => {
      const response = await blogService.getAvailableCategories()
      return response.data ?? []
    },
    staleTime: 60 * QUERY_CONFIG.DEFAULT_STALE_TIME,
  })
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postData: CreateBlogPostData) => {
      const response = await blogService.create(postData)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
      toast.success('Blog post created!', {
        description: `"${data?.title}" has been published successfully.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create blog post', {
        description: error.message || 'Please try again.',
      })
    },
  })
}

export function useGenerateAIBlogPost(options?: { onSuccess?: () => void; onError?: (error: Error) => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (generateData: {
      topic: string
      category?: BlogCategory
      keywords?: string[]
      targetAudience?: string
      tone?: 'professional' | 'conversational' | 'expert' | 'educational'
    }) => {
      const response = await blogService.generateAI(generateData)
      return response.data
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
      toast.success('AI-generated blog post created!', {
        description: `Post created successfully. URL: ${data?.url}`,
        duration: 10000,
      })
      options?.onSuccess?.()
    },
    onError: (error: Error, variables, context) => {
      toast.error('Failed to generate blog post', {
        description: error.message || 'Please try again.',
      })
      options?.onError?.(error)
    },
  })
}
