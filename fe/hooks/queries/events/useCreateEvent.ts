'use client'

import type { ApiResponse, CalendarEvent, CreateEventRequest } from '@/types/api'
import { MutationHookOptions, useMutationWrapper } from '../useMutationWrapper'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { eventsService } from '@/services/events.service'
import { queryKeys } from '@/lib/query/keys'

/**
 * Hook to create a new calendar event in Google Calendar.
 *
 * Automatically invalidates events list and free/busy caches upon successful creation
 * to ensure the new event appears in subsequent queries and availability calculations.
 *
 * @param options - Mutation options for customizing the event creation behavior
 * @returns Normalized mutation state for handling the event creation operation
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
