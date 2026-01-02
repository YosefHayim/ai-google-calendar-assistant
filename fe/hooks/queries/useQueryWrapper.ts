'use client'

import { UseQueryResult } from '@tanstack/react-query'
import type { ApiResponse } from '@/types/api'
import { NormalizedQueryState, extractApiError } from '@/lib/query/types'

/**
 * Wraps a React Query result with normalized state interface.
 * Provides consistent loading, error, and data handling across all query hooks.
 */
export function useQueryWrapper<TData>(
  queryResult: UseQueryResult<ApiResponse<TData>, Error>,
): NormalizedQueryState<TData> {
  const { data: response, isLoading, isFetching, isRefetching, isError, error, isSuccess, refetch } = queryResult

  const apiError = isError ? extractApiError(error) : null

  return {
    // Extract data from ApiResponse wrapper
    data: response?.data ?? null,

    // Loading states
    isLoading,
    isFetching,
    isRefetching,

    // Error states
    isError,
    error: apiError,
    errorMessage: apiError?.message ?? null,

    // Success
    isSuccess: isSuccess && response?.status === 'success',

    // Status mapping
    status: isLoading ? 'loading' : isError ? 'error' : isSuccess ? 'success' : 'idle',

    // Refetch action
    refetch: async () => {
      await refetch()
    },
  }
}

/**
 * Options for query hooks
 */
export interface QueryHookOptions {
  /** Whether the query should execute */
  enabled?: boolean
  /** Refetch when window regains focus */
  refetchOnWindowFocus?: boolean
  /** Refetch when component mounts */
  refetchOnMount?: boolean
  /** Time until data is considered stale (ms) */
  staleTime?: number
  /** Time until inactive data is garbage collected (ms) */
  gcTime?: number
}
