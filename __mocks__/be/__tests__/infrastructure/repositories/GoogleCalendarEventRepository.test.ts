import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { calendar_v3 } from "googleapis";
import { GoogleCalendarEventRepository } from "@/infrastructure/repositories/GoogleCalendarEventRepository";
import { Event } from "@/domain/entities/Event";
import { EventMapper } from "@/infrastructure/repositories/mappers/EventMapper";

// Mock the EventMapper
jest.mock("@/infrastructure/repositories/mappers/EventMapper");

describe("GoogleCalendarEventRepository", () => {
  let repository: GoogleCalendarEventRepository;
  let mockCalendarClient: jest.Mocked<calendar_v3.Calendar>;
  let mockEvent: Event;

  beforeEach(() => {
    // Create mock Event entity
    mockEvent = new Event(
      "event-1",
      "Meeting",
      { dateTime: "2024-12-01T10:00:00Z" },
      { dateTime: "2024-12-01T11:00:00Z" },
      "Meeting description",
      "Conference Room A",
      [{ email: "attendee@example.com" }],
      undefined, // recurrence
      undefined, // reminders
      "confirmed", // status
      "default", // visibility
      "cal-1",
    );

    // Create mock Google Calendar API client
    mockCalendarClient = {
      events: {
        get: jest.fn(),
        list: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<calendar_v3.Calendar>;

    // Create repository instance
    repository = new GoogleCalendarEventRepository(mockCalendarClient);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should find event by ID successfully", async () => {
      const mockResponse = {
        data: {
          id: "event-1",
          summary: "Meeting",
        },
      };

      mockCalendarClient.events.get.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomain as jest.Mock).mockReturnValue(mockEvent);

      const result = await repository.findById("event-1", "cal-1");

      expect(mockCalendarClient.events.get).toHaveBeenCalledWith({
        calendarId: "cal-1",
        eventId: "event-1",
      });
      expect(EventMapper.toDomain).toHaveBeenCalledWith(mockResponse.data, "cal-1");
      expect(result).toBe(mockEvent);
    });

    it("should return null when event not found", async () => {
      mockCalendarClient.events.get.mockResolvedValue({ data: null } as any);

      const result = await repository.findById("nonexistent", "cal-1");

      expect(result).toBeNull();
    });

    it("should return null for 404 errors", async () => {
      const error: any = new Error("Not found");
      error.code = 404;
      mockCalendarClient.events.get.mockRejectedValue(error);

      const result = await repository.findById("nonexistent", "cal-1");

      expect(result).toBeNull();
    });

    it("should throw error for non-404 errors", async () => {
      const error: any = new Error("Server error");
      error.code = 500;
      mockCalendarClient.events.get.mockRejectedValue(error);

      await expect(repository.findById("event-1", "cal-1")).rejects.toThrow();
    });
  });

  describe("findByDateRange", () => {
    const startDate = new Date("2024-12-01T00:00:00Z");
    const endDate = new Date("2024-12-31T23:59:59Z");

    it("should find events in date range", async () => {
      const mockResponse = {
        data: {
          items: [
            { id: "event-1", summary: "Event 1" },
            { id: "event-2", summary: "Event 2" },
          ],
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([mockEvent, mockEvent]);

      const result = await repository.findByDateRange("cal-1", startDate, endDate);

      expect(mockCalendarClient.events.list).toHaveBeenCalledWith({
        calendarId: "cal-1",
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        maxResults: 2500,
        orderBy: "startTime",
      });
      expect(result).toHaveLength(2);
    });

    it("should apply custom options", async () => {
      const mockResponse = {
        data: {
          items: [{ id: "event-1" }],
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([mockEvent]);

      await repository.findByDateRange("cal-1", startDate, endDate, {
        includeRecurring: false,
        maxResults: 10,
        orderBy: "updated",
      });

      expect(mockCalendarClient.events.list).toHaveBeenCalledWith({
        calendarId: "cal-1",
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: false,
        maxResults: 10,
        orderBy: "updated",
      });
    });

    it("should return empty array when no items", async () => {
      mockCalendarClient.events.list.mockResolvedValue({ data: {} } as any);

      const result = await repository.findByDateRange("cal-1", startDate, endDate);

      expect(result).toEqual([]);
    });
  });

  describe("findAll", () => {
    it("should find all events with default pagination", async () => {
      const mockResponse = {
        data: {
          items: [{ id: "event-1" }, { id: "event-2" }],
          nextPageToken: "next-token",
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([mockEvent, mockEvent]);

      const result = await repository.findAll("cal-1");

      expect(mockCalendarClient.events.list).toHaveBeenCalledWith({
        calendarId: "cal-1",
        maxResults: 250,
        pageToken: undefined,
        singleEvents: true,
        orderBy: "startTime",
      });
      expect(result.events).toHaveLength(2);
      expect(result.nextPageToken).toBe("next-token");
    });

    it("should use page token for pagination", async () => {
      const mockResponse = {
        data: {
          items: [{ id: "event-3" }],
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([mockEvent]);

      await repository.findAll("cal-1", { pageToken: "page-2" });

      expect(mockCalendarClient.events.list).toHaveBeenCalledWith({
        calendarId: "cal-1",
        maxResults: 250,
        pageToken: "page-2",
        singleEvents: true,
        orderBy: "startTime",
      });
    });

    it("should apply custom max results", async () => {
      const mockResponse = {
        data: {
          items: [],
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([]);

      await repository.findAll("cal-1", { maxResults: 50 });

      expect(mockCalendarClient.events.list).toHaveBeenCalledWith({
        calendarId: "cal-1",
        maxResults: 50,
        pageToken: undefined,
        singleEvents: true,
        orderBy: "startTime",
      });
    });

    it("should return empty events array when no items", async () => {
      mockCalendarClient.events.list.mockResolvedValue({ data: {} } as any);

      const result = await repository.findAll("cal-1");

      expect(result.events).toEqual([]);
      expect(result.nextPageToken).toBeUndefined();
    });
  });

  describe("search", () => {
    it("should search events by query", async () => {
      const mockResponse = {
        data: {
          items: [{ id: "event-1", summary: "Meeting" }],
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([mockEvent]);

      const result = await repository.search("cal-1", "meeting");

      expect(mockCalendarClient.events.list).toHaveBeenCalledWith({
        calendarId: "cal-1",
        q: "meeting",
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime",
      });
      expect(result).toHaveLength(1);
    });

    it("should apply custom max results", async () => {
      const mockResponse = {
        data: {
          items: [],
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([]);

      await repository.search("cal-1", "query", { maxResults: 20 });

      expect(mockCalendarClient.events.list).toHaveBeenCalledWith({
        calendarId: "cal-1",
        q: "query",
        maxResults: 20,
        singleEvents: true,
        orderBy: "startTime",
      });
    });

    it("should return empty array when no results", async () => {
      mockCalendarClient.events.list.mockResolvedValue({ data: {} } as any);

      const result = await repository.search("cal-1", "nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("should create event successfully", async () => {
      const googleEvent = {
        summary: "New Meeting",
      };

      const mockResponse = {
        data: {
          id: "new-event",
          summary: "New Meeting",
        },
      };

      (EventMapper.toGoogleEvent as jest.Mock).mockReturnValue(googleEvent);
      mockCalendarClient.events.insert.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomain as jest.Mock).mockReturnValue(mockEvent);

      const result = await repository.create(mockEvent);

      expect(EventMapper.toGoogleEvent).toHaveBeenCalledWith(mockEvent);
      expect(mockCalendarClient.events.insert).toHaveBeenCalledWith({
        calendarId: "cal-1",
        requestBody: googleEvent,
        sendUpdates: "all",
      });
      expect(result).toBe(mockEvent);
    });

    it("should throw error if calendar ID missing", async () => {
      const eventWithoutCalendar = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
      );

      await expect(repository.create(eventWithoutCalendar)).rejects.toThrow(
        "Calendar ID is required to create an event",
      );
    });

    it("should throw error if no data returned", async () => {
      (EventMapper.toGoogleEvent as jest.Mock).mockReturnValue({});
      mockCalendarClient.events.insert.mockResolvedValue({ data: null } as any);

      await expect(repository.create(mockEvent)).rejects.toThrow(
        "Failed to create event: no data returned",
      );
    });
  });

  describe("update", () => {
    it("should update event successfully", async () => {
      const googleEvent = {
        summary: "Updated Meeting",
      };

      const mockResponse = {
        data: {
          id: "event-1",
          summary: "Updated Meeting",
        },
      };

      (EventMapper.toGoogleEvent as jest.Mock).mockReturnValue(googleEvent);
      mockCalendarClient.events.update.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomain as jest.Mock).mockReturnValue(mockEvent);

      const result = await repository.update(mockEvent);

      expect(mockCalendarClient.events.update).toHaveBeenCalledWith({
        calendarId: "cal-1",
        eventId: "event-1",
        requestBody: googleEvent,
        sendUpdates: "all",
      });
      expect(result).toBe(mockEvent);
    });

    it("should throw error if calendar ID missing", async () => {
      const eventWithoutCalendar = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
      );

      await expect(repository.update(eventWithoutCalendar)).rejects.toThrow(
        "Calendar ID is required to update an event",
      );
    });

    it("should throw specific error for 404", async () => {
      const error: any = new Error("Not found");
      error.code = 404;

      (EventMapper.toGoogleEvent as jest.Mock).mockReturnValue({});
      mockCalendarClient.events.update.mockRejectedValue(error);

      await expect(repository.update(mockEvent)).rejects.toThrow(`Event not found: ${mockEvent.id}`);
    });
  });

  describe("delete", () => {
    it("should delete event successfully", async () => {
      mockCalendarClient.events.delete.mockResolvedValue({} as any);

      const result = await repository.delete("event-1", "cal-1");

      expect(mockCalendarClient.events.delete).toHaveBeenCalledWith({
        calendarId: "cal-1",
        eventId: "event-1",
        sendUpdates: "all",
      });
      expect(result).toBe(true);
    });

    it("should return false for 404 errors", async () => {
      const error: any = new Error("Not found");
      error.code = 404;
      mockCalendarClient.events.delete.mockRejectedValue(error);

      const result = await repository.delete("nonexistent", "cal-1");

      expect(result).toBe(false);
    });

    it("should throw error for non-404 errors", async () => {
      mockCalendarClient.events.delete.mockRejectedValue(new Error("API Error"));

      await expect(repository.delete("event-1", "cal-1")).rejects.toThrow();
    });
  });

  describe("findConflicts", () => {
    it("should find conflicting events", async () => {
      const startTime = new Date("2024-12-01T10:00:00Z");
      const endTime = new Date("2024-12-01T11:00:00Z");

      const event1 = new Event(
        "event-1",
        "Event 1",
        { dateTime: "2024-12-01T10:30:00Z" },
        { dateTime: "2024-12-01T11:30:00Z" },
      );

      const event2 = new Event(
        "event-2",
        "Event 2",
        { dateTime: "2024-12-01T12:00:00Z" },
        { dateTime: "2024-12-01T13:00:00Z" },
      );

      const mockResponse = {
        data: {
          items: [
            { id: "event-1" },
            { id: "event-2" },
          ],
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([event1, event2]);

      const result = await repository.findConflicts("cal-1", startTime, endTime);

      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should exclude specified event ID", async () => {
      const startTime = new Date("2024-12-01T10:00:00Z");
      const endTime = new Date("2024-12-01T11:00:00Z");

      const mockResponse = {
        data: {
          items: [{ id: "event-1" }],
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([mockEvent]);

      await repository.findConflicts("cal-1", startTime, endTime, "event-1");

      expect(mockCalendarClient.events.list).toHaveBeenCalled();
    });
  });

  describe("findUpcoming", () => {
    it("should find upcoming events with default limit", async () => {
      const mockResponse = {
        data: {
          items: [{ id: "event-1" }],
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([mockEvent]);

      const result = await repository.findUpcoming("cal-1");

      const call = mockCalendarClient.events.list.mock.calls[0][0];
      expect(call.calendarId).toBe("cal-1");
      expect(call.maxResults).toBe(10);
      expect(call.singleEvents).toBe(true);
      expect(call.orderBy).toBe("startTime");
      expect(result).toHaveLength(1);
    });

    it("should apply custom limit", async () => {
      const mockResponse = {
        data: {
          items: [],
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([]);

      await repository.findUpcoming("cal-1", 5);

      const call = mockCalendarClient.events.list.mock.calls[0][0];
      expect(call.maxResults).toBe(5);
    });
  });

  describe("findToday", () => {
    it("should find today's events", async () => {
      const mockResponse = {
        data: {
          items: [{ id: "event-1" }],
        },
      };

      mockCalendarClient.events.list.mockResolvedValue(mockResponse as any);
      (EventMapper.toDomainArray as jest.Mock).mockReturnValue([mockEvent]);

      const result = await repository.findToday("cal-1");

      expect(mockCalendarClient.events.list).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe("Error Handling", () => {
    it("should handle 400 errors", async () => {
      const error: any = new Error("Bad request");
      error.code = 400;
      mockCalendarClient.events.get.mockRejectedValue(error);

      await expect(repository.findById("event-1", "cal-1")).rejects.toThrow(
        /Invalid request in findById/,
      );
    });

    it("should handle 401 errors", async () => {
      const error: any = new Error("Unauthorized");
      error.code = 401;
      mockCalendarClient.events.get.mockRejectedValue(error);

      await expect(repository.findById("event-1", "cal-1")).rejects.toThrow(
        /Unauthorized access in findById/,
      );
    });

    it("should handle 403 errors", async () => {
      const error: any = new Error("Forbidden");
      error.code = 403;
      mockCalendarClient.events.get.mockRejectedValue(error);

      await expect(repository.findById("event-1", "cal-1")).rejects.toThrow(
        /Forbidden access in findById/,
      );
    });

    it("should handle 429 rate limit errors", async () => {
      const error: any = new Error("Too many requests");
      error.code = 429;
      mockCalendarClient.events.get.mockRejectedValue(error);

      await expect(repository.findById("event-1", "cal-1")).rejects.toThrow(
        /Rate limit exceeded in findById/,
      );
    });

    it("should handle 503 service unavailable errors", async () => {
      const error: any = new Error("Service unavailable");
      error.code = 503;
      mockCalendarClient.events.get.mockRejectedValue(error);

      await expect(repository.findById("event-1", "cal-1")).rejects.toThrow(
        /Google Calendar service unavailable in findById/,
      );
    });
  });
});
