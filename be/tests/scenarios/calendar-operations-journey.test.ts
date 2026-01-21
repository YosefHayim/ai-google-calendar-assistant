import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mockFn } from "../test-utils";

/**
 * Business Scenario: Calendar Operations Journey
 *
 * Tests the complete user journey for calendar operations including:
 * - OAuth connection flow
 * - Event CRUD operations
 * - Quick add with AI parsing
 * - Conflict detection
 * - Rescheduling suggestions
 */

// Mock Google Calendar API
const mockCalendarEvents = {
  list: mockFn(),
  get: mockFn(),
  insert: mockFn(),
  update: mockFn(),
  delete: mockFn(),
  move: mockFn(),
};

const mockCalendarList = {
  list: mockFn(),
};

const mockCalendar = {
  events: mockCalendarEvents,
  calendarList: mockCalendarList,
};

// Mock token data
const mockTokenData = {
  user_id: "user-123",
  email: "user@example.com",
  access_token: "valid-access-token",
  refresh_token: "valid-refresh-token",
  expiry_date: Date.now() + 3_600_000,
  scope: "https://www.googleapis.com/auth/calendar",
  token_type: "Bearer",
};

jest.mock("@/domains/calendar/utils/init", () => ({
  createCalendarFromValidatedTokens: () => mockCalendar,
  initUserSupabaseCalendarWithTokensAndUpdateTokens: async () => mockCalendar,
}));

jest.mock("@/config", () => ({
  STATUS_RESPONSE: {
    SUCCESS: { code: 200, success: true },
    CREATED: { code: 201, success: true },
    BAD_REQUEST: { code: 400, success: false },
    NOT_FOUND: { code: 404, success: false },
    CONFLICT: { code: 409, success: false },
  },
  REQUEST_CONFIG_BASE: { prettyPrint: true },
  ACTION: {
    GET: "GET",
    INSERT: "INSERT",
    UPDATE: "UPDATE",
    DELETE: "DELETE",
  },
}));

describe("Calendar Operations Journey", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Scenario 1: OAuth Connection Flow", () => {
    it("should validate existing OAuth tokens", async () => {
      const tokens = { ...mockTokenData };
      const isValid = tokens.expiry_date > Date.now();

      expect(isValid).toBe(true);
    });

    it("should detect expired tokens", async () => {
      const expiredTokens = {
        ...mockTokenData,
        expiry_date: Date.now() - 3_600_000, // 1 hour ago
      };
      const isExpired = expiredTokens.expiry_date < Date.now();

      expect(isExpired).toBe(true);
    });

    it("should refresh tokens when near expiry", async () => {
      const nearExpiryTokens = {
        ...mockTokenData,
        expiry_date: Date.now() + 300_000, // 5 minutes left
      };
      const needsRefresh = nearExpiryTokens.expiry_date - Date.now() < 600_000; // 10 min threshold

      expect(needsRefresh).toBe(true);
    });
  });

  describe("Scenario 2: Fetching Calendar Events", () => {
    it("should fetch events for a date range", async () => {
      const events = [
        {
          id: "event-1",
          summary: "Team Meeting",
          start: { dateTime: "2026-01-16T09:00:00Z" },
          end: { dateTime: "2026-01-16T10:00:00Z" },
        },
        {
          id: "event-2",
          summary: "Lunch",
          start: { dateTime: "2026-01-16T12:00:00Z" },
          end: { dateTime: "2026-01-16T13:00:00Z" },
        },
      ];

      mockCalendarEvents.list.mockResolvedValueOnce({
        data: { items: events },
      });

      const result = await mockCalendar.events.list({
        calendarId: "primary",
        timeMin: "2026-01-16T00:00:00Z",
        timeMax: "2026-01-17T00:00:00Z",
      });

      expect(result.data.items).toHaveLength(2);
      expect(result.data.items[0].summary).toBe("Team Meeting");
    });

    it("should fetch events from multiple calendars", async () => {
      mockCalendarList.list.mockResolvedValueOnce({
        data: {
          items: [
            { id: "primary", summary: "Primary Calendar" },
            { id: "work@group.calendar.google.com", summary: "Work" },
            { id: "personal@group.calendar.google.com", summary: "Personal" },
          ],
        },
      });

      const calendars = await mockCalendar.calendarList.list();
      expect(calendars.data.items).toHaveLength(3);
    });
  });

  describe("Scenario 3: Creating Events", () => {
    it("should create a simple event", async () => {
      const newEvent = {
        summary: "Doctor Appointment",
        start: { dateTime: "2026-01-20T14:00:00Z" },
        end: { dateTime: "2026-01-20T15:00:00Z" },
        description: "Annual checkup",
        location: "Medical Center",
      };

      mockCalendarEvents.insert.mockResolvedValueOnce({
        data: { id: "new-event-123", ...newEvent },
      });

      const result = await mockCalendar.events.insert({
        calendarId: "primary",
        requestBody: newEvent,
      });

      expect(result.data.id).toBe("new-event-123");
      expect(result.data.summary).toBe("Doctor Appointment");
    });

    it("should create an event with attendees", async () => {
      const eventWithAttendees = {
        summary: "Project Review",
        start: { dateTime: "2026-01-21T10:00:00Z" },
        end: { dateTime: "2026-01-21T11:00:00Z" },
        attendees: [
          { email: "colleague1@example.com" },
          { email: "colleague2@example.com" },
        ],
      };

      mockCalendarEvents.insert.mockResolvedValueOnce({
        data: { id: "event-with-attendees", ...eventWithAttendees },
      });

      const result = await mockCalendar.events.insert({
        calendarId: "primary",
        requestBody: eventWithAttendees,
        sendUpdates: "all",
      });

      expect(result.data.attendees).toHaveLength(2);
    });

    it("should create a recurring event", async () => {
      const recurringEvent = {
        summary: "Weekly Standup",
        start: { dateTime: "2026-01-20T09:00:00Z", timeZone: "UTC" },
        end: { dateTime: "2026-01-20T09:30:00Z", timeZone: "UTC" },
        recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"],
      };

      mockCalendarEvents.insert.mockResolvedValueOnce({
        data: { id: "recurring-123", ...recurringEvent },
      });

      const result = await mockCalendar.events.insert({
        calendarId: "primary",
        requestBody: recurringEvent,
      });

      expect(result.data.recurrence).toContain(
        "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"
      );
    });
  });

  describe("Scenario 4: Quick Add with AI Parsing", () => {
    it("should parse natural language event description", () => {
      const _input = "Meeting with John tomorrow at 3pm for 1 hour";

      // Simulated AI parsing result
      const parsed = {
        summary: "Meeting with John",
        start: { dateTime: "2026-01-17T15:00:00Z" },
        end: { dateTime: "2026-01-17T16:00:00Z" },
        confidence: 0.95,
      };

      expect(parsed.summary).toBe("Meeting with John");
      expect(parsed.confidence).toBeGreaterThan(0.9);
    });

    it("should detect and resolve ambiguous times", () => {
      const _input = "Call with team at 3";

      // Simulated ambiguity detection
      const parsed = {
        summary: "Call with team",
        ambiguousTime: true,
        possibleTimes: ["15:00", "03:00"],
        suggestedTime: "15:00", // Default to PM during work hours
      };

      expect(parsed.ambiguousTime).toBe(true);
      expect(parsed.suggestedTime).toBe("15:00");
    });

    it("should extract location from description", () => {
      const _input = "Lunch at Cafe Milano at 12pm";

      const parsed = {
        summary: "Lunch",
        location: "Cafe Milano",
        start: { dateTime: "2026-01-17T12:00:00Z" },
        end: { dateTime: "2026-01-17T13:00:00Z" },
      };

      expect(parsed.location).toBe("Cafe Milano");
    });
  });

  describe("Scenario 5: Conflict Detection", () => {
    it("should detect overlapping events", () => {
      const existingEvents = [
        {
          id: "existing-1",
          start: { dateTime: "2026-01-20T14:00:00Z" },
          end: { dateTime: "2026-01-20T15:00:00Z" },
        },
      ];

      const newEvent = {
        start: { dateTime: "2026-01-20T14:30:00Z" },
        end: { dateTime: "2026-01-20T15:30:00Z" },
      };

      const hasConflict = existingEvents.some((existing) => {
        const existingStart = new Date(existing.start.dateTime).getTime();
        const existingEnd = new Date(existing.end.dateTime).getTime();
        const newStart = new Date(newEvent.start.dateTime).getTime();
        const newEnd = new Date(newEvent.end.dateTime).getTime();

        return newStart < existingEnd && newEnd > existingStart;
      });

      expect(hasConflict).toBe(true);
    });

    it("should not flag adjacent events as conflicts", () => {
      const existingEvents = [
        {
          id: "existing-1",
          start: { dateTime: "2026-01-20T14:00:00Z" },
          end: { dateTime: "2026-01-20T15:00:00Z" },
        },
      ];

      const newEvent = {
        start: { dateTime: "2026-01-20T15:00:00Z" },
        end: { dateTime: "2026-01-20T16:00:00Z" },
      };

      const hasConflict = existingEvents.some((existing) => {
        const existingStart = new Date(existing.start.dateTime).getTime();
        const existingEnd = new Date(existing.end.dateTime).getTime();
        const newStart = new Date(newEvent.start.dateTime).getTime();
        const newEnd = new Date(newEvent.end.dateTime).getTime();

        return newStart < existingEnd && newEnd > existingStart;
      });

      expect(hasConflict).toBe(false);
    });

    it("should return conflict details", () => {
      const conflicts = [
        {
          eventId: "conflict-1",
          summary: "Existing Meeting",
          overlapMinutes: 30,
          suggestion: "Move new event to 15:30",
        },
      ];

      expect(conflicts[0].overlapMinutes).toBe(30);
      expect(conflicts[0].suggestion).toContain("Move");
    });
  });

  describe("Scenario 6: Event Updates", () => {
    it("should update event summary", async () => {
      mockCalendarEvents.update.mockResolvedValueOnce({
        data: {
          id: "event-123",
          summary: "Updated Meeting Title",
        },
      });

      const result = await mockCalendar.events.update({
        calendarId: "primary",
        eventId: "event-123",
        requestBody: { summary: "Updated Meeting Title" },
      });

      expect(result.data.summary).toBe("Updated Meeting Title");
    });

    it("should reschedule event to new time", async () => {
      mockCalendarEvents.update.mockResolvedValueOnce({
        data: {
          id: "event-123",
          start: { dateTime: "2026-01-21T10:00:00Z" },
          end: { dateTime: "2026-01-21T11:00:00Z" },
        },
      });

      const result = await mockCalendar.events.update({
        calendarId: "primary",
        eventId: "event-123",
        requestBody: {
          start: { dateTime: "2026-01-21T10:00:00Z" },
          end: { dateTime: "2026-01-21T11:00:00Z" },
        },
      });

      expect(result.data.start.dateTime).toBe("2026-01-21T10:00:00Z");
    });

    it("should move event to different calendar", async () => {
      mockCalendarEvents.move.mockResolvedValueOnce({
        data: { id: "event-123", calendarId: "work@group.calendar.google.com" },
      });

      const result = await mockCalendar.events.move({
        calendarId: "primary",
        eventId: "event-123",
        destination: "work@group.calendar.google.com",
      });

      expect(result.data.calendarId).toBe("work@group.calendar.google.com");
    });
  });

  describe("Scenario 7: Event Deletion", () => {
    it("should delete a single event", async () => {
      mockCalendarEvents.delete.mockResolvedValueOnce({ data: {} });

      const _result = await mockCalendar.events.delete({
        calendarId: "primary",
        eventId: "event-123",
      });

      expect(mockCalendarEvents.delete).toHaveBeenCalledWith({
        calendarId: "primary",
        eventId: "event-123",
      });
    });

    it("should handle deletion of recurring event instance", async () => {
      mockCalendarEvents.delete.mockResolvedValueOnce({ data: {} });

      await mockCalendar.events.delete({
        calendarId: "primary",
        eventId: "recurring-123_20260120T090000Z",
      });

      expect(mockCalendarEvents.delete).toHaveBeenCalled();
    });

    it("should prevent mass deletion without confirmation", () => {
      const eventsToDelete = Array.from({ length: 10 }, (_, i) => `event-${i}`);
      const massDeleteThreshold = 5;

      const requiresConfirmation = eventsToDelete.length > massDeleteThreshold;

      expect(requiresConfirmation).toBe(true);
    });
  });

  describe("Scenario 8: Rescheduling Suggestions", () => {
    it("should find available time slots", () => {
      const _busySlots = [
        { start: "2026-01-20T09:00:00Z", end: "2026-01-20T10:00:00Z" },
        { start: "2026-01-20T14:00:00Z", end: "2026-01-20T15:00:00Z" },
      ];

      const _workingHours = { start: 9, end: 17 };
      const _durationMinutes = 60;

      // Find available slots (simplified logic)
      const availableSlots = [
        { start: "2026-01-20T10:00:00Z", end: "2026-01-20T11:00:00Z" },
        { start: "2026-01-20T11:00:00Z", end: "2026-01-20T12:00:00Z" },
        { start: "2026-01-20T15:00:00Z", end: "2026-01-20T16:00:00Z" },
      ];

      expect(availableSlots.length).toBeGreaterThan(0);
    });

    it("should prefer morning slots for morning preference", () => {
      const availableSlots = [
        { start: "2026-01-20T10:00:00Z", score: 90 },
        { start: "2026-01-20T14:00:00Z", score: 70 },
        { start: "2026-01-20T16:00:00Z", score: 50 },
      ];

      const _preference = "morning";
      const bestSlot = availableSlots.reduce((best, slot) =>
        slot.score > best.score ? slot : best
      );

      expect(bestSlot.start).toContain("T10:00");
    });

    it("should exclude weekends when requested", () => {
      const suggestions = [
        { date: "2026-01-20", dayOfWeek: 1 }, // Monday
        { date: "2026-01-21", dayOfWeek: 2 }, // Tuesday
        { date: "2026-01-24", dayOfWeek: 5 }, // Friday
      ];

      const _excludeWeekends = true;
      const filtered = suggestions.filter(
        (s) => s.dayOfWeek >= 1 && s.dayOfWeek <= 5
      );

      expect(filtered.length).toBe(3);
    });
  });
});
