import { QUERY_CONFIG } from '@/lib/constants'
import { deleteConversation } from '@/services/chatService'
import { queryKeys } from '@/lib/query'
import { useQuery } from '@tanstack/react-query'
import { useQueryWrapper } from '../useQueryWrapper'

export const useDeleteConversationById = async (conversationId: number) => {
  const query = useQuery({
    queryKey: queryKeys.conversations.detail(conversationId),
    queryFn: () => deleteConversation(conversationId),
    staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: true,
  })
  return useQueryWrapper(query)
}
