'use client'

import { useQuery } from '@tanstack/react-query'
import { gapsService } from '@/lib/api/services/gaps.service'
import { queryKeys } from '@/lib/query/keys'
import type { GapRecoverySettings, ApiResponse } from '@/types/api'

export interface UseGapSettingsOptions {
  enabled?: boolean
}

/**
 * Hook to fetch gap recovery settings
 */
export function useGapSettings(options?: UseGapSettingsOptions) {
  const query = useQuery<ApiResponse<{ settings: GapRecoverySettings }>, Error, GapRecoverySettings | null>({
    queryKey: queryKeys.gaps.settings(),
    queryFn: async () => {
      const response = await gapsService.getSettings()
      return response
    },
    select: (response) => response.data?.settings ?? null,
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: options?.enabled,
  })

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
