'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { AIInsightsResponse } from '@/types/analytics'

interface UseAIInsightsOptions {
  timeMin: Date | null
  timeMax: Date | null
  enabled?: boolean
}

interface APIResponse {
  status: string
  message: string
  data: AIInsightsResponse
}

/**
 * Fetches AI-powered insights for calendar events
 *
 * Features:
 * - 5 minute stale time (matches backend Redis cache)
 * - Auto-retry 3 times with exponential backoff
 * - No refetch on window focus (insights don't change frequently)
 */
export function useAIInsights({ timeMin, timeMax, enabled = true }: UseAIInsightsOptions) {
  return useQuery<AIInsightsResponse>({
    queryKey: ['ai-insights', timeMin?.toISOString(), timeMax?.toISOString()],
    queryFn: async (): Promise<AIInsightsResponse> => {
      if (!timeMin || !timeMax) {
        throw new Error('timeMin and timeMax are required')
      }

      const params = new URLSearchParams({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
      })

      const response = await apiClient.get<APIResponse>(`${ENDPOINTS.EVENTS_INSIGHTS}?${params.toString()}`)

      if (!response.data?.data) {
        throw new Error('Invalid response format from insights API')
      }

      return response.data.data
    },
    enabled: enabled && !!timeMin && !!timeMax,
    staleTime: 5 * 60 * 1000, // 5 minutes - matches backend Redis cache TTL
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    refetchOnWindowFocus: false, // Insights don't change frequently
    retry: 3, // Auto-retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  })
}
