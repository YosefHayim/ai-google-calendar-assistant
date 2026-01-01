"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "@/lib/api/services/events.service";
import { queryKeys } from "@/lib/query/keys";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";
import type { MoveEventRequest, CalendarEvent } from "@/types/api";

/**
 * Hook to move an event to a different calendar
 */
export function useMoveEvent(
  options?: MutationHookOptions<CalendarEvent, MoveEventRequest>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: MoveEventRequest) => eventsService.moveEvent(data),
    onSuccess: (data, variables) => {
      // Invalidate all events as the event moved between calendars
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
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
