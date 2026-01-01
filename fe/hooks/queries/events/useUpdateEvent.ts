"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "@/lib/api/services/events.service";
import { queryKeys } from "@/lib/query/keys";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";
import type { UpdateEventRequest, CalendarEvent } from "@/types/api";

interface UpdateEventVariables {
  /** The event ID to update */
  id: string;
  /** The event data to update */
  data: UpdateEventRequest;
}

/**
 * Hook to update an existing calendar event
 */
export function useUpdateEvent(
  options?: MutationHookOptions<CalendarEvent, UpdateEventVariables>
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: UpdateEventVariables) =>
      eventsService.updateEvent(id, data),
    onSuccess: (data, variables) => {
      // Invalidate specific event detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.details(),
      });
      // Invalidate events list
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.lists(),
      });
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
