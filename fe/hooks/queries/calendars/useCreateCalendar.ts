'use client'

import type { ApiResponse, CreateCalendarRequest, CreateCalendarResponse } from '@/types/api'
import { MutationHookOptions, useMutationWrapper } from '../useMutationWrapper'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { calendarsService } from '@/services/calendars.service'
import { queryKeys } from '@/lib/query/keys'

/**
 * Hook to create a new calendar in the user's Google Calendar account.
 *
 * Automatically invalidates the calendars list cache upon successful creation
 * to ensure the new calendar appears in subsequent queries.
 *
 * @param options - Mutation options for customizing the calendar creation behavior
 * @returns Normalized mutation state for handling the calendar creation operation
 */
export function useCreateCalendar(options?: MutationHookOptions<CreateCalendarResponse, CreateCalendarRequest>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<ApiResponse<CreateCalendarResponse>, Error, CreateCalendarRequest>({
    mutationFn: (calendarData) => calendarsService.createCalendar(calendarData),
    onSuccess: (data, variables) => {
      // Invalidate calendars list to show new calendar
      queryClient.invalidateQueries({ queryKey: queryKeys.calendars.lists() })
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
