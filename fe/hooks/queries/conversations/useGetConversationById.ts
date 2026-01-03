import { ConversationListItem, getConversation } from '@/services/chatService'

import { QUERY_CONFIG } from '@/lib/constants'
import { queryKeys } from '@/lib/query'
import { useQuery } from '@tanstack/react-query'
import { useQueryWrapper } from '../useQueryWrapper'

export const useGetConversationById = async (conversationId: number) => {
  const query = useQuery({
    queryKey: queryKeys.conversations.detail(conversationId),
    queryFn: () => getConversation(conversationId),
    staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: true,
  })
  return useQueryWrapper(query)
}
