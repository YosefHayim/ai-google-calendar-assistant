'use client'

import { QueryHookOptions, useQueryWrapper } from '../useQueryWrapper'

import { QUERY_CONFIG } from '@/lib/constants'
import { calendarsService } from '@/services/calendars-service'
import { queryKeys } from '@/lib/query/keys'
import { useQuery } from '@tanstack/react-query'

interface UseCalendarsOptions extends QueryHookOptions {
  /** Whether to fetch custom calendars (default: true) */
  custom?: boolean
}

/**
 * Hook to fetch all user calendars from connected Google Calendar accounts.
 *
 * @param options - Query options for customizing the fetch behavior
 * @param options.custom - Whether to fetch custom calendars (default: true)
 * @returns Normalized query state containing array of calendar objects
 */
export function useCalendars(options?: UseCalendarsOptions) {
  const custom = options?.custom ?? true

  const query = useQuery({
    queryKey: queryKeys.calendars.list(custom),
    queryFn: () => calendarsService.getCalendars(custom),
    staleTime: options?.staleTime ?? QUERY_CONFIG.CALENDARS_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  })

  return useQueryWrapper(query)
}
