import { QUERY_CONFIG } from '@/lib/constants'
import { getConversations } from '@/services/chatService'
import { queryKeys } from '@/lib/query/keys'
import { useQuery } from '@tanstack/react-query'
import { useQueryWrapper } from '../useQueryWrapper'

export const useRefreshConversations = async () => {
  const query = useQuery({
    queryKey: queryKeys.conversations.list(),
    queryFn: () => getConversations(20, 0),
    staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: true,
  })

  return useQueryWrapper(query)
}
