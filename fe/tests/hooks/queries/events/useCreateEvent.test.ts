import { describe, expect, it, beforeEach, mock } from "bun:test";

// Mock eventsService
const mockCreateEvent = mock(() =>
  Promise.resolve({
    status: "success",
    data: {
      id: "event-123",
      summary: "New Event",
      start: { dateTime: "2024-01-15T10:00:00Z" },
      end: { dateTime: "2024-01-15T11:00:00Z" },
    },
  })
);

mock.module("@/lib/api/services/events.service", () => ({
  eventsService: {
    createEvent: mockCreateEvent,
  },
}));

// Mock queryKeys
mock.module("@/lib/query/keys", () => ({
  queryKeys: {
    events: {
      lists: () => ["events", "list"],
    },
    calendars: {
      freeBusy: () => ["calendars", "freeBusy"],
    },
  },
}));

// Mock query types
mock.module("@/lib/query/types", () => ({
  extractApiError: (error: Error) => ({
    message: error.message,
    status: 500,
  }),
}));

// Track mock state
let mockMutationState = {
  isPending: false,
  isError: false,
  isSuccess: false,
  isIdle: true,
  error: null as Error | null,
  data: null as unknown,
};
let mockMutationFn: ((vars: unknown) => Promise<unknown>) | null = null;
let mockOnSuccess: ((data: unknown, vars: unknown) => void) | null = null;
let mockInvalidateQueries = mock(() => {});

// Mock React Query
mock.module("@tanstack/react-query", () => ({
  useMutation: (options: {
    mutationFn: (vars: unknown) => Promise<unknown>;
    onSuccess?: (data: unknown, vars: unknown) => void;
    onError?: (error: Error) => void;
    onSettled?: (data: unknown, error: Error | null, vars: unknown) => void;
  }) => {
    mockMutationFn = options.mutationFn;
    mockOnSuccess = options.onSuccess || null;
    return {
      mutate: mock((vars: unknown) => {
        mockMutationFn?.(vars);
      }),
      mutateAsync: mock(async (vars: unknown) => {
        const result = await mockMutationFn?.(vars);
        if (mockOnSuccess && result) {
          mockOnSuccess(result, vars);
        }
        return result;
      }),
      ...mockMutationState,
    };
  },
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// Import after mocks
import { useCreateEvent } from "@/hooks/queries/events/useCreateEvent";

describe("useCreateEvent", () => {
  beforeEach(() => {
    mockCreateEvent.mockClear();
    mockInvalidateQueries.mockClear();
    mockMutationState = {
      isPending: false,
      isError: false,
      isSuccess: false,
      isIdle: true,
      error: null,
      data: null,
    };
  });

  describe("initialization", () => {
    it("should return mutation functions", () => {
      const result = useCreateEvent();

      expect(typeof result.mutate).toBe("function");
      expect(typeof result.mutateAsync).toBe("function");
    });

    it("should return loading state", () => {
      const result = useCreateEvent();

      expect(result.isLoading).toBe(false);
      expect(result.isPending).toBe(false);
    });

    it("should return idle state initially", () => {
      const result = useCreateEvent();

      expect(result.isIdle).toBe(true);
    });
  });

  describe("mutation", () => {
    it("should call eventsService.createEvent with event data", async () => {
      const { mutateAsync } = useCreateEvent();

      const eventData = {
        summary: "New Meeting",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      await mutateAsync(eventData);

      expect(mockCreateEvent).toHaveBeenCalledWith(eventData);
    });

    it("should return created event data on success", async () => {
      const mockEvent = {
        id: "new-event",
        summary: "Created Event",
        start: { dateTime: "2024-01-15T14:00:00Z" },
        end: { dateTime: "2024-01-15T15:00:00Z" },
      };
      mockCreateEvent.mockResolvedValue({
        status: "success",
        data: mockEvent,
      });

      const { mutateAsync } = useCreateEvent();
      const result = await mutateAsync({
        summary: "Created Event",
        start: { dateTime: "2024-01-15T14:00:00Z" },
        end: { dateTime: "2024-01-15T15:00:00Z" },
      });

      expect(result).toBeDefined();
      expect(result.data.id).toBe("new-event");
    });

    it("should invalidate events list on success", async () => {
      const { mutateAsync } = useCreateEvent();

      await mutateAsync({
        summary: "Test",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["events", "list"],
      });
    });

    it("should invalidate free/busy on success", async () => {
      const { mutateAsync } = useCreateEvent();

      await mutateAsync({
        summary: "Test",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      });

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["calendars", "freeBusy"],
      });
    });
  });

  describe("callbacks", () => {
    it("should call onSuccess callback with created event", async () => {
      const onSuccess = mock(() => {});
      const mockEvent = {
        id: "event-456",
        summary: "Callback Test",
      };
      mockCreateEvent.mockResolvedValue({
        status: "success",
        data: mockEvent,
      });

      const { mutateAsync } = useCreateEvent({ onSuccess });
      const eventData = { summary: "Callback Test" };
      await mutateAsync(eventData);

      expect(onSuccess).toHaveBeenCalledWith(mockEvent, eventData);
    });

    it("should accept onError callback", () => {
      const onError = mock(() => {});
      const result = useCreateEvent({ onError });

      expect(typeof result.mutate).toBe("function");
    });

    it("should accept onSettled callback", () => {
      const onSettled = mock(() => {});
      const result = useCreateEvent({ onSettled });

      expect(typeof result.mutate).toBe("function");
    });
  });

  describe("error handling", () => {
    it("should handle create event failure", async () => {
      mockCreateEvent.mockRejectedValue(new Error("Failed to create event"));

      const { mutateAsync } = useCreateEvent();

      await expect(
        mutateAsync({
          summary: "Test",
          start: { dateTime: "2024-01-15T10:00:00Z" },
          end: { dateTime: "2024-01-15T11:00:00Z" },
        })
      ).rejects.toThrow("Failed to create event");
    });

    it("should handle validation errors", async () => {
      mockCreateEvent.mockRejectedValue(new Error("Invalid event data"));

      const { mutateAsync } = useCreateEvent();

      await expect(
        mutateAsync({
          summary: "",
          start: { dateTime: "" },
          end: { dateTime: "" },
        })
      ).rejects.toThrow("Invalid event data");
    });

    it("should handle network errors", async () => {
      mockCreateEvent.mockRejectedValue(new Error("Network error"));

      const { mutateAsync } = useCreateEvent();

      await expect(
        mutateAsync({
          summary: "Test",
          start: { dateTime: "2024-01-15T10:00:00Z" },
          end: { dateTime: "2024-01-15T11:00:00Z" },
        })
      ).rejects.toThrow("Network error");
    });
  });

  describe("reset", () => {
    it("should provide reset function", () => {
      const result = useCreateEvent();

      expect(typeof result.reset).toBe("function");
    });
  });

  describe("data handling", () => {
    it("should return null data initially", () => {
      const result = useCreateEvent();

      expect(result.data).toBeNull();
    });

    it("should return null errorMessage when no error", () => {
      const result = useCreateEvent();

      expect(result.errorMessage).toBeNull();
    });
  });
});
