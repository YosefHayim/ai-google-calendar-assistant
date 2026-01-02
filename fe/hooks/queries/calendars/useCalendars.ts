'use client'

import { useQuery } from '@tanstack/react-query'
import { calendarsService } from '@/lib/api/services/calendars.service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import { useQueryWrapper, QueryHookOptions } from '../useQueryWrapper'

interface UseCalendarsOptions extends QueryHookOptions {
  /** Whether to fetch custom calendars (default: true) */
  custom?: boolean
}

/**
 * Hook to fetch all calendars
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
