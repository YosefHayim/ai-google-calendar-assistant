'use client'

import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query/keys'
import { useCallback } from 'react'

/**
 * Hook to trigger a refresh of conversations list
 * Returns a function that invalidates the conversations cache
 */
export function useRefreshConversations() {
  const queryClient = useQueryClient()

  const refreshConversations = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.conversations.list(),
    })
  }, [queryClient])

  return { refreshConversations }
}
