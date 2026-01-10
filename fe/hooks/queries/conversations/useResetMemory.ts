'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resetMemory, ResetMemoryResult } from '@/services/chatService'
import { queryKeys } from '@/lib/query'
import type { MutationHookOptions } from '../useMutationWrapper'

/**
 * Hook to reset all memory (embeddings, context, conversations) for the current user
 * This clears all learned patterns and conversation history
 */
export function useResetMemory(options?: MutationHookOptions<ResetMemoryResult, void>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<ResetMemoryResult, Error, void>({
    mutationFn: () => resetMemory(),
    onSuccess: (data) => {
      // Invalidate all conversation queries since they've been deleted
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
    resetMemory: mutation.mutate,
    resetMemoryAsync: mutation.mutateAsync,
    isResetting: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    result: mutation.data,
    reset: mutation.reset,
  }
}
