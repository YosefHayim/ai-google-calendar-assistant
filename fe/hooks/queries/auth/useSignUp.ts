"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/lib/api/services/auth.service";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";
import type { AuthData } from "@/types/api";

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
  const mutation = useMutation({
    mutationFn: ({ email, password }: SignUpVariables) =>
      authService.signUp(email, password),
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data.data!, variables);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });

  return useMutationWrapper(mutation);
}
