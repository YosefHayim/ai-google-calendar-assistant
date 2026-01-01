"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "@/lib/api/services/events.service";
import { queryKeys } from "@/lib/query/keys";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";
import type { QuickAddEventRequest, CalendarEvent } from "@/types/api";

/**
 * Hook to quickly add an event using natural language text
 */
export function useQuickAddEvent(
  options?: MutationHookOptions<CalendarEvent, QuickAddEventRequest>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: QuickAddEventRequest) => eventsService.quickAdd(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.calendars.freeBusy(),
      });
      options?.onSuccess?.(data.data!, variables);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });

  return useMutationWrapper(mutation);
}
