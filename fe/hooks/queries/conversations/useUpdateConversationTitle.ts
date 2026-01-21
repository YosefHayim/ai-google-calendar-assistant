'use client'

import { ConversationListItem, updateConversationTitle } from '@/services/chat-service'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { MutationHookOptions } from '../useMutationWrapper'
import { queryKeys } from '@/lib/query'

type UpdateConversationTitleParams = {
  conversationId: string
  title: string
}

/**
 * Hook to update a conversation title
 * Uses mutation pattern since this is a write operation
 */
export function useUpdateConversationTitle(options?: MutationHookOptions<boolean, UpdateConversationTitleParams>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<boolean, Error, UpdateConversationTitleParams>({
    mutationFn: ({ conversationId, title }: UpdateConversationTitleParams) =>
      updateConversationTitle(conversationId, title),
    onSuccess: (data, variables) => {
      // Invalidate conversation list to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.list(),
      })
      // Update the specific conversation in cache if it exists
      queryClient.setQueryData(
        queryKeys.conversations.detail(variables.conversationId),
        (oldData: ConversationListItem) => {
          if (oldData) {
            return { ...oldData, title: variables.title }
          }
          return oldData
        },
      )
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
    updateConversationTitle: mutation.mutate,
    updateConversationTitleAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}
