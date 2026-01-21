'use client'

import { useMutation } from '@tanstack/react-query'
import { eventsService } from '@/services/events-service'
import { useMutationWrapper, MutationHookOptions } from '../useMutationWrapper'
import type { WatchEventsRequest, CalendarEvent, ApiResponse } from '@/types/api'

/**
 * Hook to set up a watch channel for event updates
 */
export function useWatchEvents(options?: MutationHookOptions<CalendarEvent, WatchEventsRequest>) {
  const mutation = useMutation<ApiResponse<CalendarEvent>, Error, WatchEventsRequest>({
    mutationFn: (data) => eventsService.watchEvents(data),
    onSuccess: (data, variables) => {
      if (data.data) {
        options?.onSuccess?.(data.data, variables)
      }
    },
    onError: options?.onError,
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data?.data ?? undefined, error, variables)
    },
  })

  return useMutationWrapper(mutation)
}
