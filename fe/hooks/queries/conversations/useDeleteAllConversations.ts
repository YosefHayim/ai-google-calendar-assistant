'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAllConversations } from '@/services/chatService'
import { queryKeys } from '@/lib/query'
import type { MutationHookOptions } from '../useMutationWrapper'

/**
 * Hook to delete all conversations
 * Replaces manual fetch + loading state in SettingsModal
 */
export function useDeleteAllConversations(
  options?: MutationHookOptions<boolean, void>,
) {
  const queryClient = useQueryClient()

  const mutation = useMutation<boolean, Error, void>({
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
    reset: mutation.reset,
  }
}
