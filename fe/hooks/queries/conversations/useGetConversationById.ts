import { ConversationListItem, getConversation } from '@/services/chatService'

import { QUERY_CONFIG } from '@/lib/constants'
import { queryKeys } from '@/lib/query'
import { useQuery } from '@tanstack/react-query'
import { useQueryWrapper } from '../useQueryWrapper'

export const useGetConversationById = (conversationId: number | null) => {
  const query = useQuery({
    queryKey: queryKeys.conversations.detail(conversationId ?? 0),
    queryFn: () => getConversation(conversationId!),
    staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: conversationId !== null,
  })
  return useQueryWrapper(query)
}
