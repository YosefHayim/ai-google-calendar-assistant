'use client'

import type { ApiResponse, GapQueryParams, GapsResponse } from '@/types/api'

import { gapsService } from '@/services/gaps.service'
import { queryKeys } from '@/lib/query/keys'
import { useQuery } from '@tanstack/react-query'

export interface UseGapsOptions {
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  staleTime?: number
}

/**
 * Hook to fetch analyzed time gaps from the user's calendar.
 *
 * Analyzes calendar events to identify potential scheduling gaps and opportunities
 * for better time management and productivity.
 *
 * @param params - Query parameters for filtering gap analysis
 * @param options - Query options for customizing the fetch behavior
 * @returns Object containing gap analysis data, settings, and query state
 */
export function useGaps(params?: GapQueryParams, options?: UseGapsOptions) {
  const query = useQuery<ApiResponse<GapsResponse>, Error, GapsResponse | null>({
    queryKey: queryKeys.gaps.list(params),
    queryFn: async () => {
      const response = await gapsService.getGaps(params)
      return response
    },
    select: (response) => response.data,
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes
    enabled: options?.enabled,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  })

  return {
    data: query.data,
    gaps: query.data?.gaps ?? [],
    settings: query.data?.settings ?? null,
    totalCount: query.data?.totalCount ?? 0,
    analyzedRange: query.data?.analyzedRange ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
