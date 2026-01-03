import { StreamCallbacks, continueConversation } from '@/services/chatService'

import { QUERY_CONFIG } from '@/lib/constants'
import { queryKeys } from '@/lib/query'
import { useQuery } from '@tanstack/react-query'
import { useQueryWrapper } from '../useQueryWrapper'

export const useUpdateConversationById = async (
  conversationId: number,
  message: string,
  callbacks: StreamCallbacks,
) => {
  const query = useQuery({
    queryKey: queryKeys.conversations.detail(conversationId),
    queryFn: () => continueConversation(conversationId, message, callbacks),
    staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: true,
  })
  return useQueryWrapper(query)
}
