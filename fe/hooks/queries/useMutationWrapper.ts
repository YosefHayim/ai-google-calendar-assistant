'use client'

import { UseMutationResult } from '@tanstack/react-query'
import type { ApiResponse } from '@/types/api'
import { NormalizedMutationState, extractApiError } from '@/lib/query/types'

/**
 * Wraps a React Query mutation result with normalized state interface.
 * Provides consistent loading, error, and data handling across all mutation hooks.
 */
export function useMutationWrapper<TData, TVariables>(
  mutationResult: UseMutationResult<ApiResponse<TData>, Error, TVariables>,
): NormalizedMutationState<TData, TVariables> {
  const {
    mutate,
    mutateAsync: originalMutateAsync,
    isPending,
    isError,
    isSuccess,
    isIdle,
    error,
    data: response,
    reset,
  } = mutationResult

  const apiError = isError ? extractApiError(error) : null

  // Wrap mutateAsync to extract data from ApiResponse
  const mutateAsync = async (variables: TVariables): Promise<TData> => {
    const result = await originalMutateAsync(variables)
    if (result.status === 'error') {
      throw new Error(result.message)
    }
    return result.data as TData
  }

  return {
    mutate,
    mutateAsync,

    isLoading: isPending,
    isPending,
    isError,
    isSuccess,
    isIdle,

    error: apiError,
    errorMessage: apiError?.message ?? null,

    data: response?.data ?? null,

    reset,
  }
}

/**
 * Options for mutation hooks
 */
export interface MutationHookOptions<TData, TVariables> {
  /** Called when mutation succeeds */
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>
  /** Called when mutation fails */
  onError?: (error: Error, variables: TVariables) => void
  /** Called when mutation completes (success or error) */
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void
}
