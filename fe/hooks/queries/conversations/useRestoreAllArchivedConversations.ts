'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { restoreAllArchivedConversations } from '@/services/chatService'
import { queryKeys } from '@/lib/query'
import type { MutationHookOptions } from '../useMutationWrapper'

/**
 * Hook to restore all archived conversations
 * Uses mutation pattern since this is a write operation
 */
export function useRestoreAllArchivedConversations(options?: MutationHookOptions<boolean, void>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<boolean, Error, void>({
    mutationFn: () => restoreAllArchivedConversations(),
    onSuccess: (data) => {
      // Invalidate conversation list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      })
      // Invalidate archived conversations list
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.archived(),
      })
      options?.onSuccess?.(data, undefined)
    },
    onError: (error) => {
      options?.onError?.(error, undefined)
    },
    onSettled: (data, error) => {
      options?.onSettled?.(data, error, undefined)
    },
  })

  return {
    restoreAllArchivedConversations: mutation.mutate,
    restoreAllArchivedConversationsAsync: mutation.mutateAsync,
    isRestoring: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}