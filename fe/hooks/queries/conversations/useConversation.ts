'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query'
import { QUERY_CONFIG } from '@/lib/constants'
import { getConversation, type FullConversation } from '@/services/chatService'
import type { QueryHookOptions } from '../useQueryWrapper'

interface UseConversationOptions extends QueryHookOptions {
  conversationId: string | null
}

/**
 * Hook to fetch a single conversation by ID
 * Replaces manual useState + useEffect pattern in ChatContext
 */
export function useConversation(options: UseConversationOptions) {
  const { conversationId, ...queryOptions } = options

  const query = useQuery<FullConversation | null, Error>({
    queryKey: queryKeys.conversations.detail(conversationId ?? ''),
    queryFn: () => (conversationId ? getConversation(conversationId) : Promise.resolve(null)),
    staleTime: queryOptions.staleTime ?? QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: (queryOptions.enabled ?? true) && conversationId !== null,
    refetchOnWindowFocus: queryOptions.refetchOnWindowFocus ?? false,
    refetchOnMount: queryOptions.refetchOnMount ?? true,
  })

  // When query is disabled (no conversationId), isLoading should be false
  // TanStack Query v5 can leave isLoading stale when query becomes disabled
  const isEnabled = (queryOptions.enabled ?? true) && conversationId !== null
  const isActuallyLoading = isEnabled && query.isLoading

  return {
    conversation: query.data,
    isLoading: isActuallyLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  }
}
