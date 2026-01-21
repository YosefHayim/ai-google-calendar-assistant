'use client'

import type { ApiResponse, AuthData } from '@/types/api'
import { MutationHookOptions, useMutationWrapper } from '../useMutationWrapper'

import { authService } from '@/services/auth-service'
import { useMutation } from '@tanstack/react-query'

interface SignUpVariables {
  email: string
  password: string
}

/**
 * Hook to sign up a new user with email and password.
 *
 * Creates a new user account and handles the registration process.
 *
 * @param options - Mutation options for customizing the sign-up behavior
 * @returns Normalized mutation state for handling the sign-up operation
 */
export function useSignUp(options?: MutationHookOptions<AuthData, SignUpVariables>) {
  const mutation = useMutation<ApiResponse<AuthData>, Error, SignUpVariables>({
    mutationFn: ({ email, password }) => authService.signUp(email, password),
    onSuccess: (data, variables) => {
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
