"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "@/lib/api/services/events.service";
import { queryKeys } from "@/lib/query/keys";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";
import type { QuickAddEventRequest, CalendarEvent, ApiResponse } from "@/types/api";

/**
 * Hook to quickly add an event using natural language text
 */
export function useQuickAddEvent(
  options?: MutationHookOptions<CalendarEvent, QuickAddEventRequest>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation<ApiResponse<CalendarEvent>, Error, QuickAddEventRequest>({
    mutationFn: (data) => eventsService.quickAdd(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.calendars.freeBusy(),
      });
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
