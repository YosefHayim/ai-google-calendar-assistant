'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query'
import { QUERY_CONFIG } from '@/lib/constants'
import { integrationsService } from '@/lib/api/services/integrations.service'
import { useQueryWrapper, type QueryHookOptions } from '../useQueryWrapper'

/**
 * Hook to fetch Google Calendar integration status
 * Replaces manual useState + useEffect pattern
 */
export function useGoogleCalendarStatus(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.integrations.googleCalendar(),
    queryFn: () => integrationsService.getGoogleCalendarStatus(),
    staleTime: options?.staleTime ?? QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return useQueryWrapper(query)
}
