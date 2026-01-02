'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/lib/api/services/auth.service'
import { queryKeys } from '@/lib/query/keys'
import { useMutationWrapper, MutationHookOptions } from '../useMutationWrapper'
import type { AuthData, ApiResponse } from '@/types/api'

interface VerifyOTPVariables {
  email: string
  token: string
}

/**
 * Hook to verify a user's email with an OTP token
 */
export function useVerifyOTP(options?: MutationHookOptions<AuthData, VerifyOTPVariables>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<ApiResponse<AuthData>, Error, VerifyOTPVariables>({
    mutationFn: ({ email, token }) => authService.verifyOTP(email, token),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() })
      if (data.data) {
        options?.onSuccess?.(data.data, variables)
      }
    },
    onError: options?.onError,
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data?.data ?? undefined, error, variables)
    },
  })

  return useMutationWrapper(mutation)
}
