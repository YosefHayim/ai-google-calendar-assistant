'use client'

import { QueryHookOptions, useQueryWrapper } from '../useQueryWrapper'

import { QUERY_CONFIG } from '@/lib/constants'
import { authService } from '@/services/auth.service'
import { queryKeys } from '@/lib/query/keys'
import { useQuery } from '@tanstack/react-query'

interface UseUserOptions extends QueryHookOptions {
  /** Whether to fetch custom user format with avatar_url */
  customUser?: boolean
  /** Force refresh from database, bypassing cache */
  refresh?: boolean
}

export function useUser(options?: UseUserOptions) {
  const customUser = options?.customUser ?? false
  const refresh = options?.refresh ?? true
  const query = useQuery({
    queryKey: [...queryKeys.auth.user(), customUser, refresh],
    queryFn: () => authService.getUser(customUser, refresh),
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return useQueryWrapper(query)
}
