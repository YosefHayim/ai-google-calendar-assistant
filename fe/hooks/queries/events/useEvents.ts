'use client'

import { QueryHookOptions, useQueryWrapper } from '../useQueryWrapper'

import type { EventQueryParams } from '@/types/api'
import { QUERY_CONFIG } from '@/lib/constants'
import { eventsService } from '@/services/events-service'
import { queryKeys } from '@/lib/query/keys'
import { useQuery } from '@tanstack/react-query'

interface UseEventsOptions extends QueryHookOptions {
  /** Query parameters for filtering events */
  params?: EventQueryParams
}

/**
 * Hook to fetch calendar events with optional filtering and pagination.
 *
 * Supports filtering by date range, calendar IDs, search terms, and other criteria
 * as defined by the EventQueryParams interface.
 *
 * @param options - Query options for customizing the fetch behavior
 * @param options.params - Query parameters for filtering and pagination
 * @returns Normalized query state containing array of calendar events
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
