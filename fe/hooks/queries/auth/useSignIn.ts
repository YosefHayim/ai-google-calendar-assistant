'use client'

import type { ApiResponse, AuthData } from '@/types/api'
import { MutationHookOptions, useMutationWrapper } from '../useMutationWrapper'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { authService } from '@/services/auth-service'
import { queryKeys } from '@/lib/query/keys'

interface SignInVariables {
  email: string
  password: string
}

/**
 * Hook to sign in a user with email and password.
 *
 * On successful sign-in, automatically invalidates the user query cache
 * to ensure fresh user data is available.
 *
 * @param options - Mutation options for customizing the sign-in behavior
 * @returns Normalized mutation state for handling the sign-in operation
 */
export function useSignIn(options?: MutationHookOptions<AuthData, SignInVariables>) {
  const queryClient = useQueryClient()

  const mutation = useMutation<ApiResponse<AuthData>, Error, SignInVariables>({
    mutationFn: ({ email, password }) => authService.signIn(email, password),
    onSuccess: (data, variables) => {
      // Invalidate user query to refetch
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
