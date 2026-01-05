'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { preferencesService, type PreferenceResponse } from '@/lib/api/services/preferences.service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import type { AllyBrainFormData, ContextualSchedulingFormData } from '@/lib/validations/preferences'
import type { QueryHookOptions } from '../useQueryWrapper'

/**
 * Hook to fetch Ally's Brain preference
 */
export function useAllyBrain(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.preferences.allyBrain(),
    queryFn: async () => {
      const response = await preferencesService.getAllyBrain()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook to update Ally's Brain preference
 */
export function useUpdateAllyBrain() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: AllyBrainFormData) => preferencesService.updateAllyBrain(data),
    onSuccess: (response) => {
      // Update the cache with the new value
      if (response.data) {
        queryClient.setQueryData<PreferenceResponse<AllyBrainFormData>>(
          queryKeys.preferences.allyBrain(),
          response.data,
        )
      }
      // Invalidate all preferences to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.list() })
    },
  })

  return {
    updateAllyBrain: mutation.mutate,
    updateAllyBrainAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

/**
 * Hook to fetch Contextual Scheduling preference
 */
export function useContextualScheduling(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.preferences.contextualScheduling(),
    queryFn: async () => {
      const response = await preferencesService.getContextualScheduling()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook to update Contextual Scheduling preference
 */
export function useUpdateContextualScheduling() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: ContextualSchedulingFormData) => preferencesService.updateContextualScheduling(data),
    onSuccess: (response) => {
      // Update the cache with the new value
      if (response.data) {
        queryClient.setQueryData<PreferenceResponse<ContextualSchedulingFormData>>(
          queryKeys.preferences.contextualScheduling(),
          response.data,
        )
      }
      // Invalidate all preferences to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.list() })
    },
  })

  return {
    updateContextualScheduling: mutation.mutate,
    updateContextualSchedulingAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}
