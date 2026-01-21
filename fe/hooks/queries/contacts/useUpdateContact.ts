'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMutationWrapper, MutationHookOptions } from '../useMutationWrapper'
import { contactsService } from '@/services/contacts-service'
import { queryKeys } from '@/lib/query/keys'
import type { Contact, UpdateContactBody } from '@/types/contacts'

interface UpdateContactVariables {
  id: string
  body: UpdateContactBody
}

export function useUpdateContact(options?: MutationHookOptions<Contact, UpdateContactVariables>) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ id, body }: UpdateContactVariables) => contactsService.updateContact(id, body),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.detail(variables.id) })
      options?.onSuccess?.(data.data!, variables)
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables)
    },
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data?.data, error, variables)
    },
  })

  return useMutationWrapper(mutation)
}
