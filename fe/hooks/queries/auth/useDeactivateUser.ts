"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/services/auth.service";
import { queryKeys } from "@/lib/query/keys";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";

/**
 * Hook to deactivate the current user's account
 */
export function useDeactivateUser(options?: MutationHookOptions<null, void>) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => authService.deactivateUser(),
    onSuccess: () => {
      // Clear all auth-related caches
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
      queryClient.removeQueries({ queryKey: queryKeys.calendars.all });
      queryClient.removeQueries({ queryKey: queryKeys.events.all });
      options?.onSuccess?.(null, undefined);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });

  return useMutationWrapper(mutation);
}
