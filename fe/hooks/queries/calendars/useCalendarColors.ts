'use client'

import { useQuery } from '@tanstack/react-query'
import { calendarsService } from '@/lib/api/services/calendars.service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import { useQueryWrapper, QueryHookOptions } from '../useQueryWrapper'

/**
 * Hook to fetch available calendar colors
 */
export function useCalendarColors(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.calendars.colors(),
    queryFn: () => calendarsService.getColors(),
    // Colors rarely change, use longer stale time
    staleTime: options?.staleTime ?? QUERY_CONFIG.CALENDARS_STALE_TIME * 2,
    enabled: options?.enabled ?? true,
  })

  return useQueryWrapper(query)
}
