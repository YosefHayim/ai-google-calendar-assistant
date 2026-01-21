import { getConversation, type FullConversation } from '@/services/chat-service'
import { QUERY_CONFIG } from '@/lib/constants'
import { queryKeys } from '@/lib/query'
import { useQuery } from '@tanstack/react-query'
import type { QueryHookOptions } from '../useQueryWrapper'

/**
 * @deprecated Use useConversation instead for a cleaner API
 */
export function useGetConversationById(conversationId: string, options?: QueryHookOptions) {
  const query = useQuery<FullConversation | null, Error>({
    queryKey: queryKeys.conversations.detail(conversationId),
    queryFn: () => getConversation(conversationId),
    staleTime: options?.staleTime ?? QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
  })

  return {
    conversation: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  }
}
