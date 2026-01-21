'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatResponse, continueConversation } from '@/services/chat-service'
import { queryKeys } from '@/lib/query'
import type { MutationHookOptions } from '../useMutationWrapper'

interface ContinueConversationParams {
  conversationId: string
  message: string
}

export function useUpdateConversationById(options?: MutationHookOptions<ChatResponse, ContinueConversationParams>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<ChatResponse, Error, ContinueConversationParams>({
    mutationFn: ({ conversationId, message }) => continueConversation(conversationId, message),
    onSuccess: (data, variables) => {
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
