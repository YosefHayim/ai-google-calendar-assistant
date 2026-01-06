'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { StreamCallbacks, continueConversation } from '@/services/chatService'
import { queryKeys } from '@/lib/query'
import type { MutationHookOptions } from '../useMutationWrapper'

interface ContinueConversationParams {
  conversationId: number
  message: string
  callbacks: StreamCallbacks
}

/**
 * Hook to continue a conversation (send a message)
 * Uses mutation pattern since this is a write operation
 */
export function useUpdateConversationById(options?: MutationHookOptions<void, ContinueConversationParams>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, Error, ContinueConversationParams>({
    mutationFn: ({ conversationId, message, callbacks }) => continueConversation(conversationId, message, callbacks),
    onSuccess: (data, variables) => {
      // Invalidate conversation detail to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(variables.conversationId),
      })
      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables)
    },
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data, error, variables)
    },
  })

  return {
    continueConversation: mutation.mutate,
    continueConversationAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}
