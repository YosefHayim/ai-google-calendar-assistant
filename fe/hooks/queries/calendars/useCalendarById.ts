'use client'

import { QueryHookOptions, useQueryWrapper } from '../useQueryWrapper'

import { QUERY_CONFIG } from '@/lib/constants'
import { calendarsService } from '@/services/calendars-service'
import { queryKeys } from '@/lib/query/keys'
import { useQuery } from '@tanstack/react-query'

interface UseCalendarByIdOptions extends QueryHookOptions {
  /** The calendar ID to fetch */
  id: string
}

/**
 * Hook to fetch a specific calendar by its Google Calendar ID.
 *
 * @param options - Query options including the required calendar ID
 * @param options.id - The Google Calendar ID to fetch details for
 * @returns Normalized query state containing the calendar object or null if not found
 */
export function useCalendarById(options: UseCalendarByIdOptions) {
  const { id, ...queryOptions } = options

  const query = useQuery({
    queryKey: queryKeys.calendars.detail(id),
    queryFn: () => calendarsService.getCalendarById(id),
    staleTime: queryOptions?.staleTime ?? QUERY_CONFIG.CALENDARS_STALE_TIME,
    enabled: queryOptions?.enabled ?? !!id,
    refetchOnWindowFocus: queryOptions?.refetchOnWindowFocus ?? false,
  })

  return useQueryWrapper(query)
}
