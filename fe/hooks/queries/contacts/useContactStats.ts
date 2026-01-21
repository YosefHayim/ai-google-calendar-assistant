'use client'

import { useQuery } from '@tanstack/react-query'
import { QueryHookOptions, useQueryWrapper } from '../useQueryWrapper'
import { QUERY_CONFIG } from '@/lib/constants'
import { contactsService } from '@/services/contacts-service'
import { queryKeys } from '@/lib/query/keys'

export function useContactStats(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.contacts.stats(),
    queryFn: () => contactsService.getContactStats(),
    staleTime: options?.staleTime ?? QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  })

  return useQueryWrapper(query)
}
