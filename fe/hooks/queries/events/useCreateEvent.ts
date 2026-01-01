"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "@/lib/api/services/events.service";
import { queryKeys } from "@/lib/query/keys";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";
import type { CreateEventRequest, CalendarEvent } from "@/types/api";

/**
 * Hook to create a new calendar event
 */
export function useCreateEvent(
  options?: MutationHookOptions<CalendarEvent, CreateEventRequest>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (eventData: CreateEventRequest) =>
      eventsService.createEvent(eventData),
    onSuccess: (data, variables) => {
      // Invalidate events list to show new event
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
      // Also invalidate free/busy as it may have changed
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
