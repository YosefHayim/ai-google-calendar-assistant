import { describe, it, expect } from "@jest/globals";
import { EventMapper } from "@/infrastructure/repositories/mappers/EventMapper";
import { Event } from "@/domain/entities/Event";
import type { calendar_v3 } from "googleapis";

describe("EventMapper", () => {
  describe("toDomain", () => {
    it("should map Google Calendar event to domain Event entity", () => {
      const googleEvent: calendar_v3.Schema$Event = {
        id: "event-123",
        summary: "Team Meeting",
        description: "Weekly sync",
        location: "Conference Room A",
        start: {
          dateTime: "2024-01-15T10:00:00Z",
          timeZone: "America/New_York",
        },
        end: {
          dateTime: "2024-01-15T11:00:00Z",
          timeZone: "America/New_York",
        },
        status: "confirmed",
        visibility: "default",
        attendees: [
          {
            email: "john@example.com",
            displayName: "John Doe",
            responseStatus: "accepted",
          },
        ],
        recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO"],
        reminders: {
          overrides: [
            { method: "email", minutes: 30 },
            { method: "popup", minutes: 10 },
          ],
        },
        created: "2024-01-01T00:00:00Z",
        updated: "2024-01-10T00:00:00Z",
      };

      const event = EventMapper.toDomain(googleEvent, "cal-123");

      expect(event).toBeInstanceOf(Event);
      expect(event.id).toBe("event-123");
      expect(event.summary).toBe("Team Meeting");
      expect(event.description).toBe("Weekly sync");
      expect(event.location).toBe("Conference Room A");
      expect(event.start.dateTime).toBe("2024-01-15T10:00:00Z");
      expect(event.end.dateTime).toBe("2024-01-15T11:00:00Z");
      expect(event.status).toBe("confirmed");
      expect(event.calendarId).toBe("cal-123");
      expect(event.attendees).toHaveLength(1);
      expect(event.reminders).toHaveLength(2);
    });

    it("should handle all-day events", () => {
      const googleEvent: calendar_v3.Schema$Event = {
        id: "event-123",
        summary: "All Day Event",
        start: { date: "2024-01-15" },
        end: { date: "2024-01-16" },
      };

      const event = EventMapper.toDomain(googleEvent);

      expect(event.start.date).toBe("2024-01-15");
      expect(event.end.date).toBe("2024-01-16");
      expect(event.start.dateTime).toBeUndefined();
      expect(event.end.dateTime).toBeUndefined();
    });

    it("should throw error when id is missing", () => {
      const googleEvent: calendar_v3.Schema$Event = {
        summary: "Meeting",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      expect(() => EventMapper.toDomain(googleEvent)).toThrow(
        "Invalid Google Calendar event: missing required fields",
      );
    });

    it("should throw error when summary is missing", () => {
      const googleEvent: calendar_v3.Schema$Event = {
        id: "event-123",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      expect(() => EventMapper.toDomain(googleEvent)).toThrow(
        "Invalid Google Calendar event: missing required fields",
      );
    });

    it("should throw error when start is missing", () => {
      const googleEvent: calendar_v3.Schema$Event = {
        id: "event-123",
        summary: "Meeting",
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      expect(() => EventMapper.toDomain(googleEvent)).toThrow(
        "Invalid Google Calendar event: missing required fields",
      );
    });

    it("should throw error when end is missing", () => {
      const googleEvent: calendar_v3.Schema$Event = {
        id: "event-123",
        summary: "Meeting",
        start: { dateTime: "2024-01-15T10:00:00Z" },
      };

      expect(() => EventMapper.toDomain(googleEvent)).toThrow(
        "Invalid Google Calendar event: missing required fields",
      );
    });

    it("should handle event without optional fields", () => {
      const googleEvent: calendar_v3.Schema$Event = {
        id: "event-123",
        summary: "Simple Meeting",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      const event = EventMapper.toDomain(googleEvent);

      expect(event.description).toBeUndefined();
      expect(event.location).toBeUndefined();
      expect(event.attendees).toBeUndefined();
      expect(event.recurrence).toBeUndefined();
      expect(event.reminders).toBeUndefined();
    });
  });

  describe("toGoogleEvent", () => {
    it("should map domain Event to Google Calendar event format", () => {
      const event = new Event(
        "event-123",
        "Team Meeting",
        { dateTime: "2024-01-15T10:00:00Z", timeZone: "America/New_York" },
        { dateTime: "2024-01-15T11:00:00Z", timeZone: "America/New_York" },
        "Weekly sync",
        "Conference Room A",
        [{ email: "john@example.com", displayName: "John Doe" }],
        { rule: "RRULE:FREQ=WEEKLY;BYDAY=MO" },
        [{ method: "email", minutes: 30 }],
        "confirmed",
        "default",
        "cal-123",
      );

      const googleEvent = EventMapper.toGoogleEvent(event);

      expect(googleEvent.id).toBe("event-123");
      expect(googleEvent.summary).toBe("Team Meeting");
      expect(googleEvent.description).toBe("Weekly sync");
      expect(googleEvent.location).toBe("Conference Room A");
      expect(googleEvent.start?.dateTime).toBe("2024-01-15T10:00:00Z");
      expect(googleEvent.end?.dateTime).toBe("2024-01-15T11:00:00Z");
      expect(googleEvent.status).toBe("confirmed");
      expect(googleEvent.visibility).toBe("default");
      expect(googleEvent.attendees).toHaveLength(1);
      expect(googleEvent.recurrence).toEqual(["RRULE:FREQ=WEEKLY;BYDAY=MO"]);
      expect(googleEvent.reminders?.overrides).toHaveLength(1);
    });

    it("should handle event without attendees", () => {
      const event = new Event(
        "event-123",
        "Meeting",
        { dateTime: "2024-01-15T10:00:00Z" },
        { dateTime: "2024-01-15T11:00:00Z" },
      );

      const googleEvent = EventMapper.toGoogleEvent(event);

      expect(googleEvent.attendees).toBeUndefined();
    });

    it("should handle event without recurrence", () => {
      const event = new Event(
        "event-123",
        "Meeting",
        { dateTime: "2024-01-15T10:00:00Z" },
        { dateTime: "2024-01-15T11:00:00Z" },
      );

      const googleEvent = EventMapper.toGoogleEvent(event);

      expect(googleEvent.recurrence).toBeUndefined();
    });

    it("should handle event without reminders", () => {
      const event = new Event(
        "event-123",
        "Meeting",
        { dateTime: "2024-01-15T10:00:00Z" },
        { dateTime: "2024-01-15T11:00:00Z" },
      );

      const googleEvent = EventMapper.toGoogleEvent(event);

      expect(googleEvent.reminders).toBeUndefined();
    });
  });

  describe("toGoogleEventPartial", () => {
    it("should map partial Event updates", () => {
      const updates = {
        summary: "Updated Meeting",
        description: "Updated description",
        location: "New Location",
        status: "tentative" as const,
      };

      const partial = EventMapper.toGoogleEventPartial(updates);

      expect(partial.summary).toBe("Updated Meeting");
      expect(partial.description).toBe("Updated description");
      expect(partial.location).toBe("New Location");
      expect(partial.status).toBe("tentative");
    });

    it("should handle start and end updates", () => {
      const updates = {
        start: { dateTime: "2024-01-20T10:00:00Z", timeZone: "America/New_York" },
        end: { dateTime: "2024-01-20T11:00:00Z", timeZone: "America/New_York" },
      };

      const partial = EventMapper.toGoogleEventPartial(updates);

      expect(partial.start?.dateTime).toBe("2024-01-20T10:00:00Z");
      expect(partial.end?.dateTime).toBe("2024-01-20T11:00:00Z");
    });

    it("should handle attendees updates", () => {
      const updates = {
        attendees: [{ email: "new@example.com" }],
      };

      const partial = EventMapper.toGoogleEventPartial(updates);

      expect(partial.attendees).toHaveLength(1);
      expect(partial.attendees?.[0].email).toBe("new@example.com");
    });

    it("should handle empty updates", () => {
      const updates = {};

      const partial = EventMapper.toGoogleEventPartial(updates);

      expect(partial.summary).toBeUndefined();
      expect(partial.start).toBeUndefined();
    });
  });

  describe("toDomainArray", () => {
    it("should map array of Google Calendar events to domain entities", () => {
      const googleEvents: calendar_v3.Schema$Event[] = [
        {
          id: "event-1",
          summary: "Event 1",
          start: { dateTime: "2024-01-15T10:00:00Z" },
          end: { dateTime: "2024-01-15T11:00:00Z" },
        },
        {
          id: "event-2",
          summary: "Event 2",
          start: { dateTime: "2024-01-16T10:00:00Z" },
          end: { dateTime: "2024-01-16T11:00:00Z" },
        },
      ];

      const events = EventMapper.toDomainArray(googleEvents, "cal-123");

      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(Event);
      expect(events[1]).toBeInstanceOf(Event);
      expect(events[0].id).toBe("event-1");
      expect(events[1].id).toBe("event-2");
      expect(events[0].calendarId).toBe("cal-123");
      expect(events[1].calendarId).toBe("cal-123");
    });

    it("should filter out events without required fields", () => {
      const googleEvents: calendar_v3.Schema$Event[] = [
        {
          id: "event-1",
          summary: "Event 1",
          start: { dateTime: "2024-01-15T10:00:00Z" },
          end: { dateTime: "2024-01-15T11:00:00Z" },
        },
        {
          id: "event-2",
          summary: "Event 2",
          start: { dateTime: "2024-01-16T10:00:00Z" },
          // Missing end
        },
        {
          id: "event-3",
          // Missing summary
          start: { dateTime: "2024-01-17T10:00:00Z" },
          end: { dateTime: "2024-01-17T11:00:00Z" },
        },
      ];

      const events = EventMapper.toDomainArray(googleEvents);

      expect(events).toHaveLength(1);
      expect(events[0].id).toBe("event-1");
    });

    it("should return empty array for empty input", () => {
      const events = EventMapper.toDomainArray([]);
      expect(events).toHaveLength(0);
    });
  });
});
