'use client'

import { useQuery } from '@tanstack/react-query'
import { calendarsService } from '@/services/calendars.service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import { useQueryWrapper, QueryHookOptions } from '../useQueryWrapper'

/**
 * Hook to fetch free/busy information for calendars
 */
export function useFreeBusy(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.calendars.freeBusy(),
    queryFn: () => calendarsService.getFreeBusy(),
    // Free/busy is time-sensitive, use shorter stale time
    staleTime: options?.staleTime ?? QUERY_CONFIG.EVENTS_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  })

  return useQueryWrapper(query)
}
