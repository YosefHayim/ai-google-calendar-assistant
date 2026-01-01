"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/services/auth.service";
import { queryKeys } from "@/lib/query/keys";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";
import type { AuthData } from "@/types/api";

interface VerifyOTPVariables {
  email: string;
  token: string;
}

/**
 * Hook to verify a user's email with an OTP token
 */
export function useVerifyOTP(
  options?: MutationHookOptions<AuthData, VerifyOTPVariables>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ email, token }: VerifyOTPVariables) =>
      authService.verifyOTP(email, token),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      options?.onSuccess?.(data.data!, variables);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });

  return useMutationWrapper(mutation);
}
