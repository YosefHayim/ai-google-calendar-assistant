'use client'

import { useQuery } from '@tanstack/react-query'
import { QueryHookOptions, useQueryWrapper } from '../useQueryWrapper'
import { QUERY_CONFIG } from '@/lib/constants'
import { contactsService } from '@/services/contacts-service'
import { queryKeys } from '@/lib/query/keys'
import type { SearchContactsParams } from '@/types/contacts'

interface UseSearchContactsOptions extends QueryHookOptions {
  params: SearchContactsParams
}

export function useSearchContacts(options: UseSearchContactsOptions) {
  const { params } = options
  const hasQuery = Boolean(params.query && params.query.length > 0)

  const query = useQuery({
    queryKey: queryKeys.contacts.search(params),
    queryFn: () => contactsService.searchContacts(params),
    staleTime: options?.staleTime ?? QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: (options?.enabled ?? true) && hasQuery,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  })

  return useQueryWrapper(query)
}
