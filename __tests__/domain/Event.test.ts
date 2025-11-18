import { describe, it, expect, beforeEach } from "@jest/globals";
import { Event, type EventDateTime, type EventAttendee, type EventReminder } from "../../domain/entities/Event";

describe("Event Entity", () => {
  describe("Constructor and Validation", () => {
    it("should create a valid timed event", () => {
      const event = new Event(
        "event-1",
        "Team Meeting",
        { dateTime: "2024-12-01T10:00:00Z", timeZone: "America/New_York" },
        { dateTime: "2024-12-01T11:00:00Z", timeZone: "America/New_York" },
      );

      expect(event.id).toBe("event-1");
      expect(event.summary).toBe("Team Meeting");
      expect(event.start.dateTime).toBe("2024-12-01T10:00:00Z");
      expect(event.end.dateTime).toBe("2024-12-01T11:00:00Z");
    });

    it("should create a valid all-day event", () => {
      const event = new Event(
        "event-2",
        "Company Holiday",
        { date: "2024-12-25" },
        { date: "2024-12-26" },
      );

      expect(event.isAllDay()).toBe(true);
      expect(event.start.date).toBe("2024-12-25");
      expect(event.end.date).toBe("2024-12-26");
    });

    it("should throw error for empty ID", () => {
      expect(() => {
        new Event("", "Meeting", { dateTime: "2024-12-01T10:00:00Z" }, { dateTime: "2024-12-01T11:00:00Z" });
      }).toThrow("Event ID is required");
    });

    it("should throw error for empty summary", () => {
      expect(() => {
        new Event("event-1", "", { dateTime: "2024-12-01T10:00:00Z" }, { dateTime: "2024-12-01T11:00:00Z" });
      }).toThrow("Event summary is required");
    });

    it("should throw error for missing start time", () => {
      expect(() => {
        new Event("event-1", "Meeting", null as any, { dateTime: "2024-12-01T11:00:00Z" });
      }).toThrow("Event start time is required");
    });

    it("should throw error for missing end time", () => {
      expect(() => {
        new Event("event-1", "Meeting", { dateTime: "2024-12-01T10:00:00Z" }, null as any);
      }).toThrow("Event end time is required");
    });

    it("should throw error if start has both dateTime and date", () => {
      expect(() => {
        new Event(
          "event-1",
          "Meeting",
          { dateTime: "2024-12-01T10:00:00Z", date: "2024-12-01" },
          { dateTime: "2024-12-01T11:00:00Z" },
        );
      }).toThrow("Event start cannot have both dateTime and date");
    });

    it("should throw error if end has both dateTime and date", () => {
      expect(() => {
        new Event(
          "event-1",
          "Meeting",
          { dateTime: "2024-12-01T10:00:00Z" },
          { dateTime: "2024-12-01T11:00:00Z", date: "2024-12-01" },
        );
      }).toThrow("Event end cannot have both dateTime and date");
    });

    it("should throw error if start and end use different formats", () => {
      expect(() => {
        new Event("event-1", "Meeting", { dateTime: "2024-12-01T10:00:00Z" }, { date: "2024-12-01" });
      }).toThrow("Event start and end must use the same format");
    });

    it("should throw error if start time is after end time", () => {
      expect(() => {
        new Event(
          "event-1",
          "Meeting",
          { dateTime: "2024-12-01T12:00:00Z" },
          { dateTime: "2024-12-01T11:00:00Z" },
        );
      }).toThrow("Event start time must be before end time");
    });

    it("should throw error if start time equals end time", () => {
      expect(() => {
        new Event(
          "event-1",
          "Meeting",
          { dateTime: "2024-12-01T10:00:00Z" },
          { dateTime: "2024-12-01T10:00:00Z" },
        );
      }).toThrow("Event start time must be before end time");
    });

    it("should throw error if start date is after end date", () => {
      expect(() => {
        new Event("event-1", "Holiday", { date: "2024-12-26" }, { date: "2024-12-25" });
      }).toThrow("Event start date must be before or equal to end date");
    });

    it("should allow start date equal to end date for all-day events", () => {
      const event = new Event("event-1", "Holiday", { date: "2024-12-25" }, { date: "2024-12-25" });

      expect(event.start.date).toBe("2024-12-25");
      expect(event.end.date).toBe("2024-12-25");
    });
  });

  describe("Event Type Checks", () => {
    it("should correctly identify all-day events", () => {
      const allDayEvent = new Event("event-1", "Holiday", { date: "2024-12-25" }, { date: "2024-12-26" });

      expect(allDayEvent.isAllDay()).toBe(true);
    });

    it("should correctly identify timed events", () => {
      const timedEvent = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
      );

      expect(timedEvent.isAllDay()).toBe(false);
    });

    it("should correctly identify recurring events", () => {
      const recurringEvent = new Event(
        "event-1",
        "Weekly Standup",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T10:30:00Z" },
        undefined,
        undefined,
        undefined,
        { rule: "RRULE:FREQ=WEEKLY;BYDAY=MO" },
      );

      expect(recurringEvent.isRecurring()).toBe(true);
    });

    it("should correctly identify non-recurring events", () => {
      const event = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
      );

      expect(event.isRecurring()).toBe(false);
    });

    it("should correctly identify cancelled events", () => {
      const event = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "cancelled",
      );

      expect(event.isCancelled()).toBe(true);
    });

    it("should correctly identify non-cancelled events", () => {
      const event = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "confirmed",
      );

      expect(event.isCancelled()).toBe(false);
    });
  });

  describe("Time-based Checks", () => {
    it("should identify past events", () => {
      const pastEvent = new Event(
        "event-1",
        "Past Meeting",
        { dateTime: "2020-01-01T10:00:00Z" },
        { dateTime: "2020-01-01T11:00:00Z" },
      );

      expect(pastEvent.isPast()).toBe(true);
      expect(pastEvent.isFuture()).toBe(false);
      expect(pastEvent.isOngoing()).toBe(false);
    });

    it("should identify future events", () => {
      const futureEvent = new Event(
        "event-1",
        "Future Meeting",
        { dateTime: "2030-01-01T10:00:00Z" },
        { dateTime: "2030-01-01T11:00:00Z" },
      );

      expect(futureEvent.isFuture()).toBe(true);
      expect(futureEvent.isPast()).toBe(false);
      expect(futureEvent.isOngoing()).toBe(false);
    });
  });

  describe("Duration Calculation", () => {
    it("should calculate duration for 1-hour event", () => {
      const event = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
      );

      expect(event.getDurationMinutes()).toBe(60);
    });

    it("should calculate duration for 30-minute event", () => {
      const event = new Event(
        "event-1",
        "Quick Sync",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T10:30:00Z" },
      );

      expect(event.getDurationMinutes()).toBe(30);
    });

    it("should calculate duration for multi-day event", () => {
      const event = new Event(
        "event-1",
        "Conference",
        { dateTime: "2024-12-01T09:00:00Z" },
        { dateTime: "2024-12-03T17:00:00Z" },
      );

      expect(event.getDurationMinutes()).toBe(2 * 24 * 60 + 8 * 60); // 2 days + 8 hours
    });
  });

  describe("Attendee Management", () => {
    let event: Event;

    beforeEach(() => {
      event = new Event(
        "event-1",
        "Team Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
      );
    });

    it("should add a valid attendee", () => {
      event.addAttendee({
        email: "user@example.com",
        displayName: "User Name",
        responseStatus: "needsAction",
      });

      expect(event.attendees).toHaveLength(1);
      expect(event.attendees?.[0].email).toBe("user@example.com");
    });

    it("should throw error for invalid attendee email", () => {
      expect(() => {
        event.addAttendee({
          email: "invalid-email",
        });
      }).toThrow("Invalid attendee email");
    });

    it("should throw error for duplicate attendee", () => {
      event.addAttendee({ email: "user@example.com" });

      expect(() => {
        event.addAttendee({ email: "user@example.com" });
      }).toThrow("Attendee user@example.com already exists");
    });

    it("should remove attendee", () => {
      event.addAttendee({ email: "user1@example.com" });
      event.addAttendee({ email: "user2@example.com" });

      const removed = event.removeAttendee("user1@example.com");

      expect(removed).toBe(true);
      expect(event.attendees).toHaveLength(1);
      expect(event.attendees?.[0].email).toBe("user2@example.com");
    });

    it("should return false when removing non-existent attendee", () => {
      const removed = event.removeAttendee("nonexistent@example.com");

      expect(removed).toBe(false);
    });

    it("should throw error for invalid attendee email during construction", () => {
      expect(() => {
        new Event(
          "event-1",
          "Meeting",
          { dateTime: "2024-12-01T10:00:00Z" },
          { dateTime: "2024-12-01T11:00:00Z" },
          undefined,
          undefined,
          [{ email: "invalid-email" }],
        );
      }).toThrow("Invalid attendee email");
    });
  });

  describe("Reminder Validation", () => {
    it("should accept valid reminders", () => {
      const event = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
        undefined,
        undefined,
        undefined,
        undefined,
        [
          { method: "email", minutes: 60 },
          { method: "popup", minutes: 10 },
        ],
      );

      expect(event.reminders).toHaveLength(2);
    });

    it("should throw error for negative reminder minutes", () => {
      expect(() => {
        new Event(
          "event-1",
          "Meeting",
          { dateTime: "2024-12-01T10:00:00Z" },
          { dateTime: "2024-12-01T11:00:00Z" },
          undefined,
          undefined,
          undefined,
          undefined,
          [{ method: "email", minutes: -10 }],
        );
      }).toThrow("Reminder minutes cannot be negative");
    });
  });

  describe("Event Updates", () => {
    let event: Event;

    beforeEach(() => {
      event = new Event(
        "event-1",
        "Original Title",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
      );
    });

    it("should update summary", () => {
      event.updateSummary("Updated Title");

      expect(event.summary).toBe("Updated Title");
      expect(event.updatedAt).toBeDefined();
    });

    it("should throw error when updating summary to empty string", () => {
      expect(() => {
        event.updateSummary("");
      }).toThrow("Event summary cannot be empty");
    });

    it("should update event time", () => {
      event.updateTime(
        { dateTime: "2024-12-02T14:00:00Z" },
        { dateTime: "2024-12-02T15:00:00Z" },
      );

      expect(event.start.dateTime).toBe("2024-12-02T14:00:00Z");
      expect(event.end.dateTime).toBe("2024-12-02T15:00:00Z");
    });

    it("should revert time update if validation fails", () => {
      const originalStart = event.start;
      const originalEnd = event.end;

      expect(() => {
        event.updateTime(
          { dateTime: "2024-12-02T15:00:00Z" },
          { dateTime: "2024-12-02T14:00:00Z" }, // End before start
        );
      }).toThrow("Event start time must be before end time");

      expect(event.start).toEqual(originalStart);
      expect(event.end).toEqual(originalEnd);
    });

    it("should cancel event", () => {
      event.cancel();

      expect(event.status).toBe("cancelled");
      expect(event.isCancelled()).toBe(true);
      expect(event.updatedAt).toBeDefined();
    });
  });

  describe("Event Cloning", () => {
    it("should clone event with new ID", () => {
      const original = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
        "Description",
        "Location",
        [{ email: "user@example.com" }],
      );

      const cloned = original.clone("event-2");

      expect(cloned.id).toBe("event-2");
      expect(cloned.summary).toBe(original.summary);
      expect(cloned.description).toBe(original.description);
      expect(cloned.location).toBe(original.location);
      expect(cloned.attendees).toHaveLength(1);

      // Ensure deep copy
      cloned.updateSummary("Updated");
      expect(original.summary).toBe("Meeting");
    });
  });

  describe("Serialization", () => {
    it("should convert to plain object", () => {
      const event = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
        "Description",
        "Office",
      );

      const obj = event.toObject();

      expect(obj.id).toBe("event-1");
      expect(obj.summary).toBe("Meeting");
      expect(obj.description).toBe("Description");
      expect(obj.location).toBe("Office");
    });

    it("should create from plain object", () => {
      const obj = {
        id: "event-1",
        summary: "Meeting",
        start: { dateTime: "2024-12-01T10:00:00Z" },
        end: { dateTime: "2024-12-01T11:00:00Z" },
        description: "Description",
        location: "Office",
        status: "confirmed",
      };

      const event = Event.fromObject(obj);

      expect(event.id).toBe("event-1");
      expect(event.summary).toBe("Meeting");
      expect(event.description).toBe("Description");
      expect(event.location).toBe("Office");
      expect(event.status).toBe("confirmed");
    });

    it("should round-trip through serialization", () => {
      const original = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
        "Description",
      );

      const obj = original.toObject();
      const restored = Event.fromObject(obj);

      expect(restored.id).toBe(original.id);
      expect(restored.summary).toBe(original.summary);
      expect(restored.start).toEqual(original.start);
      expect(restored.end).toEqual(original.end);
    });
  });

  describe("Edge Cases", () => {
    it("should handle event with minimal required fields", () => {
      const event = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
      );

      expect(event.description).toBeUndefined();
      expect(event.location).toBeUndefined();
      expect(event.attendees).toBeUndefined();
    });

    it("should handle event with all optional fields", () => {
      const event = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z", timeZone: "America/New_York" },
        { dateTime: "2024-12-01T11:00:00Z", timeZone: "America/New_York" },
        "Full description",
        "Conference Room A",
        [{ email: "user@example.com", displayName: "User" }],
        { rule: "RRULE:FREQ=WEEKLY" },
        [{ method: "email", minutes: 30 }],
        "confirmed",
        "private",
        "calendar-1",
        new Date(),
        new Date(),
      );

      expect(event.description).toBe("Full description");
      expect(event.location).toBe("Conference Room A");
      expect(event.attendees).toHaveLength(1);
      expect(event.recurrence).toBeDefined();
      expect(event.reminders).toHaveLength(1);
      expect(event.status).toBe("confirmed");
      expect(event.visibility).toBe("private");
      expect(event.calendarId).toBe("calendar-1");
    });

    it("should handle events with timezone information", () => {
      const event = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00-05:00", timeZone: "America/New_York" },
        { dateTime: "2024-12-01T11:00:00-05:00", timeZone: "America/New_York" },
      );

      expect(event.start.timeZone).toBe("America/New_York");
      expect(event.end.timeZone).toBe("America/New_York");
    });
  });
});
