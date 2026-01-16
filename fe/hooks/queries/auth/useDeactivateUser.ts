'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { queryKeys } from '@/lib/query/keys'
import { STORAGE_KEYS } from '@/lib/constants'
import { useMutationWrapper, MutationHookOptions } from '../useMutationWrapper'
import type { ApiResponse } from '@/types/api'

/**
 * Hook to deactivate the current user's account
 */
export function useDeactivateUser(options?: MutationHookOptions<null, void>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<ApiResponse<null>, Error, void>({
    mutationFn: () => authService.deactivateUser(),
    onSuccess: () => {
      // Clear all auth-related caches
      queryClient.removeQueries({ queryKey: queryKeys.auth.all })
      queryClient.removeQueries({ queryKey: queryKeys.calendars.all })
      queryClient.removeQueries({ queryKey: queryKeys.events.all })

      // Clear localStorage tokens to prevent stale session issues on re-registration
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
      }

      options?.onSuccess?.(null, undefined)
    },
    onError: options?.onError,
    onSettled: (data, error, variables) => {
      options?.onSettled?.(null, error, variables)
    },
  })

  return useMutationWrapper(mutation)
}
