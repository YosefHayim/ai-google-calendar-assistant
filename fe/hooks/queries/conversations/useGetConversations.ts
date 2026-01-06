import { QUERY_CONFIG } from "@/lib/constants";
import {
  getConversations,
  type ConversationListResponse,
} from "@/services/chatService";
import { queryKeys } from "@/lib/query/keys";
import { useQuery } from "@tanstack/react-query";

export const useGetConversations = () => {
  const query = useQuery<ConversationListResponse, Error>({
    queryKey: queryKeys.conversations.list(),
    queryFn: () => getConversations(20, 0),
    staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: true,
  });

  return {
    conversations: query.data?.conversations ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};
