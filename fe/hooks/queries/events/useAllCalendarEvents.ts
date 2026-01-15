'use client'

import { useQuery } from '@tanstack/react-query'
import { eventsService, AllCalendarEventsParams } from '@/services/events.service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import { useQueryWrapper, QueryHookOptions } from '../useQueryWrapper'

interface UseAllCalendarEventsOptions extends QueryHookOptions {
  params?: AllCalendarEventsParams
}

/**
 * Hook to fetch events from all calendars
 * Returns events grouped by calendarId
 */
export function useAllCalendarEvents(options?: UseAllCalendarEventsOptions) {
  const params = options?.params

  const query = useQuery({
    queryKey: [...queryKeys.events.all, 'all-calendars', params ?? {}],
    queryFn: () => eventsService.getAllCalendarEvents(params),
    staleTime: options?.staleTime ?? QUERY_CONFIG.EVENTS_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  })

  return useQueryWrapper(query)
}
