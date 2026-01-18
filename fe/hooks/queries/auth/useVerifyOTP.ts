'use client'

import type { ApiResponse, AuthData } from '@/types/api'
import { MutationHookOptions, useMutationWrapper } from '../useMutationWrapper'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { authService } from '@/services/auth.service'
import { queryKeys } from '@/lib/query/keys'

interface VerifyOTPVariables {
  email: string
  token: string
}

/**
 * Hook to verify a user's email with an OTP (One-Time Password) token.
 *
 * Completes the email verification process and automatically invalidates
 * the user query cache to refresh authentication state.
 *
 * @param options - Mutation options for customizing the OTP verification behavior
 * @returns Normalized mutation state for handling the OTP verification operation
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
