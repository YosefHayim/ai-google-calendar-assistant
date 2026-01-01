"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/lib/api/services/auth.service";
import { queryKeys } from "@/lib/query/keys";
import { QUERY_CONFIG } from "@/lib/constants";
import { useQueryWrapper, QueryHookOptions } from "../useQueryWrapper";

/**
 * Hook to fetch the current authenticated user
 */
export function useUser(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: () => authService.getUser(),
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  });

  return useQueryWrapper(query);
}
