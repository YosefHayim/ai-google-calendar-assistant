"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/services/auth.service";
import { queryKeys } from "@/lib/query/keys";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";
import type { AuthData } from "@/types/api";

interface SignInVariables {
  email: string;
  password: string;
}

/**
 * Hook to sign in a user with email and password
 */
export function useSignIn(
  options?: MutationHookOptions<AuthData, SignInVariables>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ email, password }: SignInVariables) =>
      authService.signIn(email, password),
    onSuccess: (data, variables) => {
      // Invalidate user query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      options?.onSuccess?.(data.data!, variables);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });

  return useMutationWrapper(mutation);
}
