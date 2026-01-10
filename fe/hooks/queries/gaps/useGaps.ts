'use client'

import { useQuery } from '@tanstack/react-query'
import { gapsService } from '@/services/gaps.service'
import { queryKeys } from '@/lib/query/keys'
import type { GapsResponse, GapQueryParams, ApiResponse } from '@/types/api'

export interface UseGapsOptions {
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  staleTime?: number
}

/**
 * Hook to fetch analyzed gaps from the calendar
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
