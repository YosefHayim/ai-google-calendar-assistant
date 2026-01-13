'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query'
import { QUERY_CONFIG } from '@/lib/constants'
import { integrationsService } from '@/services/integrations.service'
import { useQueryWrapper, type QueryHookOptions } from '../useQueryWrapper'

export function useSlackStatus(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.integrations.slack(),
    queryFn: () => integrationsService.getSlackStatus(),
    staleTime: options?.staleTime ?? QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return useQueryWrapper(query)
}
