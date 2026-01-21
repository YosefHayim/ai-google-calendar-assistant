'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query'
import { integrationsService } from '@/services/integrations-service'
import { useMutationWrapper, type MutationHookOptions } from '../useMutationWrapper'
import type { ApiResponse } from '@/types/api'

type DisconnectResponse = { isActive: boolean }

/**
 * Hook to disconnect Google Calendar integration
 * Replaces manual loading state management for disconnect action
 */
export function useDisconnectGoogleCalendar(options?: MutationHookOptions<DisconnectResponse, void>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<ApiResponse<DisconnectResponse>, Error, void>({
    mutationFn: () => integrationsService.disconnectGoogleCalendar(),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.googleCalendar(),
      })
      if (data.data) {
        options?.onSuccess?.(data.data, variables)
      }
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables)
    },
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data?.data ?? undefined, error, variables)
    },
  })

  return useMutationWrapper(mutation)
}
