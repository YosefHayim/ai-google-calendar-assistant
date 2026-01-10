'use client'

import { useQuery } from '@tanstack/react-query'
import { calendarsService } from '@/services/calendars.service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import { useQueryWrapper, QueryHookOptions } from '../useQueryWrapper'

/**
 * Hook to fetch calendar timezone information
 */
export function useCalendarTimezones(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.calendars.timezones(),
    queryFn: () => calendarsService.getTimezones(),
    // Timezones rarely change, use longer stale time
    staleTime: options?.staleTime ?? QUERY_CONFIG.CALENDARS_STALE_TIME * 2,
    enabled: options?.enabled ?? true,
  })

  return useQueryWrapper(query)
}
