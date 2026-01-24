'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMutationWrapper, MutationHookOptions } from '../useMutationWrapper'
import { contactsService } from '@/services/contacts-service'
import { queryKeys } from '@/lib/query/keys'
import type { Contact, CreateContactBody } from '@/types/contacts'

export function useCreateContact(options?: MutationHookOptions<Contact, CreateContactBody>) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: CreateContactBody) => contactsService.createContact(body),
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
