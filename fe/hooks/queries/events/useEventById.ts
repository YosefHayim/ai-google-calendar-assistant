'use client'

import { useQuery } from '@tanstack/react-query'
import { eventsService } from '@/services/events.service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import { useQueryWrapper, QueryHookOptions } from '../useQueryWrapper'

interface UseEventByIdOptions extends QueryHookOptions {
  /** The event ID to fetch */
  id: string
  /** Optional calendar ID */
  calendarId?: string
}

/**
 * Hook to fetch a specific event by ID
 */
export function useEventById(options: UseEventByIdOptions) {
  const { id, calendarId, ...queryOptions } = options

  const query = useQuery({
    queryKey: queryKeys.events.detail(id, calendarId),
    queryFn: () => eventsService.getEventById(id, calendarId),
    staleTime: queryOptions?.staleTime ?? QUERY_CONFIG.EVENTS_STALE_TIME,
    enabled: queryOptions?.enabled ?? !!id,
  })

  return useQueryWrapper(query)
}
