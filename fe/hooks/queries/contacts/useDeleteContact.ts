'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMutationWrapper, MutationHookOptions } from '../useMutationWrapper'
import { contactsService } from '@/services/contacts-service'
import { queryKeys } from '@/lib/query/keys'

export function useDeleteContact(options?: MutationHookOptions<null, string>) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (id: string) => contactsService.deleteContact(id),
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
