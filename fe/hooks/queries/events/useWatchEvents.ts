"use client";

import { useMutation } from "@tanstack/react-query";
import { eventsService } from "@/lib/api/services/events.service";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";
import type { WatchEventsRequest, CalendarEvent } from "@/types/api";

/**
 * Hook to set up a watch channel for event updates
 */
export function useWatchEvents(
  options?: MutationHookOptions<CalendarEvent, WatchEventsRequest>
) {
  const mutation = useMutation({
    mutationFn: (data: WatchEventsRequest) => eventsService.watchEvents(data),
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data.data!, variables);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });

  return useMutationWrapper(mutation);
}
