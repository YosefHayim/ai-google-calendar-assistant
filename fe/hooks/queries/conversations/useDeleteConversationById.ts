'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteConversation } from '@/services/chat-service'
import { queryKeys } from '@/lib/query'
import type { MutationHookOptions } from '../useMutationWrapper'

/**
 * Hook to delete a conversation by ID
 * Uses mutation pattern since this is a write operation
 */
export function useDeleteConversationById(options?: MutationHookOptions<boolean, string>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<boolean, Error, string>({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onSuccess: (data, conversationId) => {
      // Invalidate conversation list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      })
      // Remove the specific conversation from cache
      queryClient.removeQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      })
      options?.onSuccess?.(data, conversationId)
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables)
    },
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data, error, variables)
    },
  })

  return {
    deleteConversation: mutation.mutate,
    deleteConversationAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}
