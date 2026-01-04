'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query'
import { QUERY_CONFIG } from '@/lib/constants'
import { getConversations, type ConversationListResponse } from '@/services/chatService'
import type { QueryHookOptions } from '../useQueryWrapper'
import type { ApiResponse } from '@/types/api'

interface UseConversationsOptions extends QueryHookOptions {
  limit?: number
  offset?: number
}

/**
 * Hook to fetch list of conversations
 * Replaces manual useState + useEffect pattern in ChatContext
 */
export function useConversations(options?: UseConversationsOptions) {
  const { limit = 20, offset = 0, ...queryOptions } = options ?? {}

  const query = useQuery<ConversationListResponse, Error>({
    queryKey: [...queryKeys.conversations.list(), { limit, offset }],
    queryFn: () => getConversations(limit, offset),
    staleTime: queryOptions.staleTime ?? QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: queryOptions.enabled ?? true,
    refetchOnWindowFocus: queryOptions.refetchOnWindowFocus ?? false,
    refetchOnMount: queryOptions.refetchOnMount ?? true,
  })

  return {
    conversations: query.data?.conversations ?? [],
    pagination: query.data?.pagination ?? { limit, offset, count: 0 },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  }
}
