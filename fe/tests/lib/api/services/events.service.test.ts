import { describe, expect, it, beforeEach, mock } from "bun:test";

// Mock apiClient
const mockGet = mock(() => Promise.resolve({ data: {} }));
const mockPost = mock(() => Promise.resolve({ data: {} }));
const mockPatch = mock(() => Promise.resolve({ data: {} }));
const mockDelete = mock(() => Promise.resolve({ data: {} }));

mock.module("@/lib/api/client", () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  },
}));

mock.module("@/lib/api/endpoints", () => ({
  ENDPOINTS: {
    EVENTS: "/api/events",
    EVENTS_BY_ID: (id: string) => `/api/events/${id}`,
    EVENTS_ANALYTICS: "/api/events/analytics",
    EVENTS_QUICK_ADD: "/api/events/quick-add",
    EVENTS_MOVE: "/api/events/move",
    EVENTS_WATCH: "/api/events/watch",
  },
}));

// Import after mocks
import { eventsService } from "@/services/events.service";

describe("eventsService", () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockPost.mockClear();
    mockPatch.mockClear();
    mockDelete.mockClear();
  });

  describe("getEvents", () => {
    it("should fetch events list", async () => {
      const mockEvents = [
        { id: "event-1", summary: "Meeting 1" },
        { id: "event-2", summary: "Meeting 2" },
      ];
      mockGet.mockResolvedValue({
        data: {
          status: "success",
          data: { data: { items: mockEvents } },
        },
      });

      const result = await eventsService.getEvents();

      expect(mockGet).toHaveBeenCalledWith("/api/events", { params: undefined });
      expect(result.data).toEqual(mockEvents);
    });

    it("should pass query params", async () => {
      mockGet.mockResolvedValue({
        data: { status: "success", data: { data: { items: [] } } },
      });

      await eventsService.getEvents({
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        calendarId: "primary",
      });

      expect(mockGet).toHaveBeenCalledWith("/api/events", {
        params: {
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          calendarId: "primary",
        },
      });
    });

    it("should return empty array when no items", async () => {
      mockGet.mockResolvedValue({
        data: { status: "success", data: {} },
      });

      const result = await eventsService.getEvents();

      expect(result.data).toEqual([]);
    });
  });

  describe("getEventById", () => {
    it("should fetch single event by ID", async () => {
      const mockEvent = { id: "event-123", summary: "Test Event" };
      mockGet.mockResolvedValue({
        data: { status: "success", data: mockEvent },
      });

      const result = await eventsService.getEventById("event-123");

      expect(mockGet).toHaveBeenCalledWith("/api/events/event-123", {
        params: undefined,
      });
      expect(result.data).toEqual(mockEvent);
    });

    it("should include calendarId when provided", async () => {
      mockGet.mockResolvedValue({
        data: { status: "success", data: {} },
      });

      await eventsService.getEventById("event-123", "work-calendar");

      expect(mockGet).toHaveBeenCalledWith("/api/events/event-123", {
        params: { calendarId: "work-calendar" },
      });
    });
  });

  describe("createEvent", () => {
    it("should create a new event", async () => {
      const mockEvent = { id: "new-event", summary: "New Meeting" };
      mockPost.mockResolvedValue({
        data: { status: "success", data: mockEvent },
      });

      const eventData = {
        summary: "New Meeting",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      const result = await eventsService.createEvent(eventData);

      expect(mockPost).toHaveBeenCalledWith("/api/events", eventData);
      expect(result.data).toEqual(mockEvent);
    });
  });

  describe("updateEvent", () => {
    it("should update an existing event", async () => {
      const mockEvent = { id: "event-123", summary: "Updated Meeting" };
      mockPatch.mockResolvedValue({
        data: { status: "success", data: mockEvent },
      });

      const updateData = { summary: "Updated Meeting" };

      const result = await eventsService.updateEvent("event-123", updateData);

      expect(mockPatch).toHaveBeenCalledWith("/api/events/event-123", updateData);
      expect(result.data).toEqual(mockEvent);
    });
  });

  describe("deleteEvent", () => {
    it("should delete an event", async () => {
      mockDelete.mockResolvedValue({
        data: { status: "success", data: null },
      });

      const result = await eventsService.deleteEvent("event-123");

      expect(mockDelete).toHaveBeenCalledWith("/api/events/event-123");
      expect(result.status).toBe("success");
    });
  });

  describe("getAnalytics", () => {
    it("should fetch event analytics", async () => {
      const mockAnalytics = {
        totalEvents: 50,
        upcomingEvents: 10,
        busyHours: 25,
      };
      mockGet.mockResolvedValue({
        data: { status: "success", data: mockAnalytics },
      });

      const result = await eventsService.getAnalytics();

      expect(mockGet).toHaveBeenCalledWith("/api/events/analytics", { params: undefined });
      expect(result.data).toEqual(mockAnalytics);
    });

    it("should pass query params for analytics", async () => {
      mockGet.mockResolvedValue({
        data: { status: "success", data: {} },
      });

      await eventsService.getAnalytics({ startDate: "2024-01-01" });

      expect(mockGet).toHaveBeenCalledWith("/api/events/analytics", {
        params: { startDate: "2024-01-01" },
      });
    });
  });

  describe("quickAdd", () => {
    it("should quick add an event successfully", async () => {
      const mockResponse = { event: { id: "quick-event", summary: "Lunch" } };
      mockPost.mockResolvedValue({
        data: { status: "success", data: mockResponse },
      });

      const result = await eventsService.quickAdd({ text: "Lunch tomorrow at noon" });

      expect(mockPost).toHaveBeenCalledWith("/api/events/quick-add", {
        text: "Lunch tomorrow at noon",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockResponse);
      }
    });

    it("should handle conflict with confirmation required", async () => {
      const conflictResponse = {
        event: { id: "conflict-event" },
        conflicts: [{ id: "existing-event" }],
      };
      const axiosError = {
        response: {
          status: 409,
          data: {
            status: "error",
            message: "Event conflicts detected",
            data: conflictResponse,
          },
        },
      };
      mockPost.mockRejectedValue(axiosError);

      const result = await eventsService.quickAdd({ text: "Meeting at 2pm" });

      expect(result.success).toBe(false);
      if (!result.success && result.requiresConfirmation) {
        expect(result.data).toEqual(conflictResponse);
        expect(result.error).toBe("Event conflicts detected");
      }
    });

    it("should handle other errors", async () => {
      mockPost.mockRejectedValue(new Error("Network error"));

      const result = await eventsService.quickAdd({ text: "Invalid event" });

      expect(result.success).toBe(false);
      if (!result.success && !result.requiresConfirmation) {
        expect(result.error).toBe("Network error");
      }
    });

    it("should return default error message for non-Error throws", async () => {
      mockPost.mockRejectedValue("Unknown error");

      const result = await eventsService.quickAdd({ text: "Test" });

      expect(result.success).toBe(false);
      if (!result.success && !result.requiresConfirmation) {
        expect(result.error).toBe("Failed to create event");
      }
    });
  });

  describe("moveEvent", () => {
    it("should move an event", async () => {
      const mockEvent = { id: "event-123", summary: "Moved Event" };
      mockPost.mockResolvedValue({
        data: { status: "success", data: mockEvent },
      });

      const moveData = {
        eventId: "event-123",
        destinationCalendarId: "other-calendar",
      };

      const result = await eventsService.moveEvent(moveData);

      expect(mockPost).toHaveBeenCalledWith("/api/events/move", moveData);
      expect(result.data).toEqual(mockEvent);
    });
  });

  describe("watchEvents", () => {
    it("should start watching events", async () => {
      mockPost.mockResolvedValue({
        data: { status: "success", data: { resourceId: "watch-123" } },
      });

      const watchData = {
        calendarId: "primary",
        address: "https://webhook.example.com",
      };

      const result = await eventsService.watchEvents(watchData);

      expect(mockPost).toHaveBeenCalledWith("/api/events/watch", watchData);
      expect(result.status).toBe("success");
    });
  });
});
