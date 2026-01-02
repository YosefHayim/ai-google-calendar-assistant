'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService } from '@/lib/api/services/events.service'
import { queryKeys } from '@/lib/query/keys'
import { useMutationWrapper, MutationHookOptions } from '../useMutationWrapper'
import type { CreateEventRequest, CalendarEvent, ApiResponse } from '@/types/api'

/**
 * Hook to create a new calendar event
 */
export function useCreateEvent(options?: MutationHookOptions<CalendarEvent, CreateEventRequest>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<ApiResponse<CalendarEvent>, Error, CreateEventRequest>({
    mutationFn: (eventData) => eventsService.createEvent(eventData),
    onSuccess: (data, variables) => {
      // Invalidate events list to show new event
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() })
      // Also invalidate free/busy as it may have changed
      queryClient.invalidateQueries({
        queryKey: queryKeys.calendars.freeBusy(),
      })
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
