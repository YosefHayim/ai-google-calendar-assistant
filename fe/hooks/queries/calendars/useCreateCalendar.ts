'use client'

import type { ApiResponse, CreateCalendarRequest, CreateCalendarResponse } from '@/types/api'
import { MutationHookOptions, useMutationWrapper } from '../useMutationWrapper'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { calendarsService } from '@/lib/api/services/calendars.service'
import { queryKeys } from '@/lib/query/keys'

/**
 * Hook to create a new calendar event
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
