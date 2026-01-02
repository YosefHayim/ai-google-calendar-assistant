'use client'

import { useQuery } from '@tanstack/react-query'
import { calendarsService } from '@/lib/api/services/calendars.service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import { useQueryWrapper, QueryHookOptions } from '../useQueryWrapper'

interface UseCalendarByIdOptions extends QueryHookOptions {
  /** The calendar ID to fetch */
  id: string
}

/**
 * Hook to fetch a specific calendar by ID
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
