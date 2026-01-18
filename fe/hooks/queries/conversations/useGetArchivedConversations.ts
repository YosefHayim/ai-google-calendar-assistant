'use client'

import { useQuery } from '@tanstack/react-query'
import { getArchivedConversations } from '@/services/chatService'
import { queryKeys } from '@/lib/query'
import type { UseQueryOptions } from '@tanstack/react-query'
import type { ConversationListResponse } from '@/services/chatService'

/**
 * Hook to get all archived conversations for the current user
 */
export function useGetArchivedConversations(
  options?: Omit<UseQueryOptions<ConversationListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery<ConversationListResponse>({
    queryKey: queryKeys.conversations.archived(),
    queryFn: getArchivedConversations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}