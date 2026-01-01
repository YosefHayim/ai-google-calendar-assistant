"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService } from "@/lib/api/services/events.service";
import { queryKeys } from "@/lib/query/keys";
import { useMutationWrapper, MutationHookOptions } from "../useMutationWrapper";

/**
 * Hook to delete a calendar event
 */
export function useDeleteEvent(options?: MutationHookOptions<null, string>) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => eventsService.deleteEvent(id),
    onSuccess: (_, id) => {
      // Remove event from cache
      queryClient.removeQueries({
        queryKey: queryKeys.events.detail(id),
      });
      // Invalidate events list
      queryClient.invalidateQueries({
        queryKey: queryKeys.events.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.calendars.freeBusy(),
      });
      options?.onSuccess?.(null, id);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });

  return useMutationWrapper(mutation);
}
