'use client'

import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/lib/api/services/events.service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import { useQueryWrapper, QueryHookOptions } from '../useQueryWrapper'
import type { EventQueryParams } from '@/types/api'

interface UseEventsOptions extends QueryHookOptions {
  /** Query parameters for filtering events */
  params?: EventQueryParams
}

/**
 * Hook to fetch events with optional filtering
 */
export function useEvents(options?: UseEventsOptions) {
  const params = options?.params

  const query = useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => eventsService.getEvents(params),
    staleTime: options?.staleTime ?? QUERY_CONFIG.EVENTS_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  })

  return useQueryWrapper(query)
}
