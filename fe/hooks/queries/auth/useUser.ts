'use client'

import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services/auth.service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import { useQueryWrapper, QueryHookOptions } from '../useQueryWrapper'

interface UseUserOptions extends QueryHookOptions {
  /** Whether to fetch custom user format with avatar_url */
  customUser?: boolean
  /** Force refresh from database, bypassing cache */
  refresh?: boolean
}

export function useUser(options?: UseUserOptions) {
  const customUser = options?.customUser ?? false
  const refresh = options?.refresh ?? false
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
