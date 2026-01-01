"use client";

import { useQuery } from "@tanstack/react-query";
import { eventsService } from "@/lib/api/services/events.service";
import { queryKeys } from "@/lib/query/keys";
import { QUERY_CONFIG } from "@/lib/constants";
import { useQueryWrapper, QueryHookOptions } from "../useQueryWrapper";
import type { EventQueryParams } from "@/types/api";

interface UseEventAnalyticsOptions extends QueryHookOptions {
  /** Query parameters for filtering analytics */
  params?: EventQueryParams;
}

/**
 * Hook to fetch event analytics data
 */
export function useEventAnalytics(options?: UseEventAnalyticsOptions) {
  const params = options?.params;

  const query = useQuery({
    queryKey: queryKeys.events.analytics(params),
    queryFn: () => eventsService.getAnalytics(params),
    staleTime: options?.staleTime ?? QUERY_CONFIG.CALENDARS_STALE_TIME,
    enabled: options?.enabled ?? true,
  });

  return useQueryWrapper(query);
}
