'use client'

import { useQuery } from '@tanstack/react-query'
import { QueryHookOptions, useQueryWrapper } from '../useQueryWrapper'
import { QUERY_CONFIG } from '@/lib/constants'
import { contactsService } from '@/services/contacts-service'
import { queryKeys } from '@/lib/query/keys'
import type { GetContactsParams } from '@/types/contacts'

interface UseContactsOptions extends QueryHookOptions {
  params?: GetContactsParams
}

export function useContacts(options?: UseContactsOptions) {
  const params = options?.params

  const query = useQuery({
    queryKey: queryKeys.contacts.list(params),
    queryFn: () => contactsService.getContacts(params),
    staleTime: options?.staleTime ?? QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  })

  return useQueryWrapper(query)
}
