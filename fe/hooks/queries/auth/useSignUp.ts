"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/lib/api/services/auth.service";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";
import type { AuthData, ApiResponse } from "@/types/api";

interface SignUpVariables {
  email: string;
  password: string;
}

/**
 * Hook to sign up a new user with email and password
 */
export function useSignUp(
  options?: MutationHookOptions<AuthData, SignUpVariables>
) {
  const mutation = useMutation<ApiResponse<AuthData>, Error, SignUpVariables>({
    mutationFn: ({ email, password }) => authService.signUp(email, password),
    onSuccess: (data, variables) => {
      if (data.data) {
        options?.onSuccess?.(data.data, variables);
      }
    },
    onError: options?.onError,
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data?.data ?? undefined, error, variables);
    },
  });

  return useMutationWrapper(mutation);
}
