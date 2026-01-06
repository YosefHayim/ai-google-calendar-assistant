'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsService, QuickAddResult } from '@/lib/api/services/events.service'
import { queryKeys } from '@/lib/query/keys'
import type { QuickAddEventRequest, QuickAddResponse } from '@/types/api'

export interface QuickAddMutationOptions {
  onSuccess?: (data: QuickAddResponse, variables: QuickAddEventRequest) => void | Promise<void>
  onConflict?: (data: QuickAddResponse, variables: QuickAddEventRequest) => void
  onError?: (error: string, variables: QuickAddEventRequest) => void
  onSettled?: (result: QuickAddResult | undefined, variables: QuickAddEventRequest) => void
}

export function useQuickAddEvent(options?: QuickAddMutationOptions) {
  const queryClient = useQueryClient()

  const mutation = useMutation<QuickAddResult, Error, QuickAddEventRequest>({
    mutationFn: (data) => eventsService.quickAdd(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() })
        queryClient.invalidateQueries({ queryKey: queryKeys.calendars.freeBusy() })
        options?.onSuccess?.(result.data, variables)
      } else if (result.requiresConfirmation) {
        options?.onConflict?.(result.data, variables)
      } else {
        options?.onError?.(result.error, variables)
      }
    },
    onError: (error, variables) => {
      options?.onError?.(error.message, variables)
    },
    onSettled: (result, _error, variables) => {
      options?.onSettled?.(result, variables)
    },
  })

  return {
    quickAdd: mutation.mutate,
    quickAddAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    result: mutation.data,
    reset: mutation.reset,
  }
}
