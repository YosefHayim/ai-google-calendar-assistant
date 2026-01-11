'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eventsService, RescheduleSuggestionsResponse, RescheduleEventRequest } from '@/services/events.service'
import { queryKeys } from '@/lib/query/keys'
import { useMutationWrapper, MutationHookOptions } from '../useMutationWrapper'
import type { CalendarEvent, ApiResponse } from '@/types/api'

interface UseRescheduleSuggestionsParams {
  eventId: string
  calendarId?: string
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any'
  daysToSearch?: number
  excludeWeekends?: boolean
  enabled?: boolean
}

/**
 * Hook to fetch reschedule suggestions for an event
 */
export function useRescheduleSuggestions({
  eventId,
  calendarId,
  preferredTimeOfDay,
  daysToSearch,
  excludeWeekends,
  enabled = true,
}: UseRescheduleSuggestionsParams) {
  return useQuery<ApiResponse<RescheduleSuggestionsResponse>, Error>({
    queryKey: ['reschedule-suggestions', eventId, calendarId, preferredTimeOfDay, daysToSearch, excludeWeekends],
    queryFn: () =>
      eventsService.getRescheduleSuggestions(eventId, {
        calendarId,
        preferredTimeOfDay,
        daysToSearch,
        excludeWeekends,
      }),
    enabled: enabled && !!eventId,
    staleTime: 30 * 1000, // 30 seconds - suggestions can change quickly
  })
}

interface RescheduleEventParams extends RescheduleEventRequest {
  eventId: string
}

/**
 * Hook to apply a reschedule to an event
 */
export function useRescheduleEvent(options?: MutationHookOptions<CalendarEvent, RescheduleEventParams>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<ApiResponse<CalendarEvent>, Error, RescheduleEventParams>({
    mutationFn: ({ eventId, ...data }) => eventsService.rescheduleEvent(eventId, data),
    onSuccess: (data, variables) => {
      // Invalidate events queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
      queryClient.invalidateQueries({
        queryKey: queryKeys.calendars.freeBusy(),
      })
      // Invalidate the specific event
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.byId(variables.eventId),
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
