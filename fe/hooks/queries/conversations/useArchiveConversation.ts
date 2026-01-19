'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { MutationHookOptions } from '../useMutationWrapper'
import { archiveConversation } from '@/services/chatService'
import { queryKeys } from '@/lib/query'

/**
 * Hook to archive a conversation by ID
 * Uses mutation pattern since this is a write operation
 */
export function useArchiveConversation(options?: MutationHookOptions<boolean, string>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<boolean, Error, string>({
    mutationFn: (conversationId: string) => archiveConversation(conversationId),
    onSuccess: (data, conversationId) => {
      // Invalidate conversation list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      })
      // Invalidate archived conversations list
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.archived(),
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
    archiveConversation: mutation.mutate,
    archiveConversationAsync: mutation.mutateAsync,
    isArchiving: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}
