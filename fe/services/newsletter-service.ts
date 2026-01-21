import type { ApiResponse } from '@/types/api'
import { apiClient } from '@/lib/api/client'

export interface NewsletterSubscriptionData {
  email: string
  source?: 'blog' | 'homepage' | 'footer' | 'other'
}

export interface NewsletterResponse {
  email: string
  subscribed?: boolean
  subscribedAt?: string
}

export const newsletterService = {
  async subscribe(data: NewsletterSubscriptionData): Promise<ApiResponse<NewsletterResponse>> {
    const { data: responseData } = await apiClient.post<ApiResponse<NewsletterResponse>>(
      '/api/newsletter/subscribe',
      data,
    )
    return responseData
  },

  async unsubscribe(email: string): Promise<ApiResponse<NewsletterResponse>> {
    const { data: responseData } = await apiClient.post<ApiResponse<NewsletterResponse>>(
      '/api/newsletter/unsubscribe',
      {
        email,
      },
    )
    return responseData
  },

  async getStatus(email: string): Promise<ApiResponse<NewsletterResponse>> {
    const { data: responseData } = await apiClient.get<ApiResponse<NewsletterResponse>>(
      `/api/newsletter/status?email=${encodeURIComponent(email)}`,
    )
    return responseData
  },
}
