'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMutationWrapper, MutationHookOptions } from '../useMutationWrapper'
import { contactsService, SyncResult } from '@/services/contacts-service'
import { queryKeys } from '@/lib/query/keys'

export function useSyncContacts(options?: MutationHookOptions<SyncResult, void>) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => contactsService.syncContacts(),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
      options?.onSuccess?.(data.data!, variables)
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables)
    },
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data?.data ?? undefined, error, variables)
    },
  })

  return useMutationWrapper(mutation)
}
