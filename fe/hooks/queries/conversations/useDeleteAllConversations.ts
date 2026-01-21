'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAllConversations } from '@/services/chat-service'
import { queryKeys } from '@/lib/query'
import type { MutationHookOptions } from '../useMutationWrapper'

type DeleteAllResult = { success: boolean; deletedCount: number }

/**
 * Hook to delete all conversations for the current user
 * Clears all chat history and conversation data
 */
export function useDeleteAllConversations(options?: MutationHookOptions<DeleteAllResult, void>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<DeleteAllResult, Error, void>({
    mutationFn: () => deleteAllConversations(),
    onSuccess: (data) => {
      // Invalidate all conversation queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      })
      options?.onSuccess?.(data, undefined)
    },
    onError: (error) => {
      options?.onError?.(error, undefined)
    },
    onSettled: (data, error) => {
      options?.onSettled?.(data, error ?? null, undefined)
    },
  })

  return {
    deleteAll: mutation.mutate,
    deleteAllAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    deletedCount: mutation.data?.deletedCount,
    reset: mutation.reset,
  }
}
