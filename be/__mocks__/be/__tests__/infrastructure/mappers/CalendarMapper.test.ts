import { describe, it, expect } from "@jest/globals";
import { CalendarMapper } from "@/infrastructure/repositories/mappers/CalendarMapper";
import { Calendar } from "@/domain/entities/Calendar";
import type { calendar_v3 } from "googleapis";

describe("CalendarMapper", () => {
  describe("toDomain", () => {
    it("should map Google Calendar to domain Calendar entity", () => {
      const googleCalendar: calendar_v3.Schema$CalendarListEntry = {
        id: "cal-123",
        summary: "My Calendar",
        timeZone: "America/New_York",
        description: "Test calendar",
        backgroundColor: "#FF0000",
        foregroundColor: "#FFFFFF",
        location: "New York",
        selected: true,
        accessRole: "owner",
      };

      const calendar = CalendarMapper.toDomain(googleCalendar);

      expect(calendar).toBeInstanceOf(Calendar);
      expect(calendar.id).toBe("cal-123");
      expect(calendar.name).toBe("My Calendar");
      expect(calendar.settings.timeZone).toBe("America/New_York");
      expect(calendar.settings.description).toBe("Test calendar");
      expect(calendar.isDefault).toBe(true);
      expect(calendar.accessRole).toBe("owner");
    });

    it("should use UTC as default timezone", () => {
      const googleCalendar: calendar_v3.Schema$Calendar = {
        id: "cal-123",
        summary: "My Calendar",
      };

      const calendar = CalendarMapper.toDomain(googleCalendar);

      expect(calendar.settings.timeZone).toBe("UTC");
    });

    it("should throw error when id is missing", () => {
      const googleCalendar: calendar_v3.Schema$Calendar = {
        summary: "My Calendar",
      };

      expect(() => CalendarMapper.toDomain(googleCalendar)).toThrow(
        "Invalid Google Calendar: missing required fields (id or summary)",
      );
    });

    it("should throw error when summary is missing", () => {
      const googleCalendar: calendar_v3.Schema$Calendar = {
        id: "cal-123",
      };

      expect(() => CalendarMapper.toDomain(googleCalendar)).toThrow(
        "Invalid Google Calendar: missing required fields (id or summary)",
      );
    });

    it("should default to reader access role", () => {
      const googleCalendar: calendar_v3.Schema$CalendarListEntry = {
        id: "cal-123",
        summary: "My Calendar",
        accessRole: "unknownRole",
      };

      const calendar = CalendarMapper.toDomain(googleCalendar);

      expect(calendar.accessRole).toBe("reader");
    });

    it("should map all access roles correctly", () => {
      const roles = ["owner", "writer", "reader", "freeBusyReader"] as const;

      roles.forEach((role) => {
        const googleCalendar: calendar_v3.Schema$CalendarListEntry = {
          id: "cal-123",
          summary: "My Calendar",
          accessRole: role,
        };

        const calendar = CalendarMapper.toDomain(googleCalendar);
        expect(calendar.accessRole).toBe(role);
      });
    });
  });

  describe("toGoogleCalendar", () => {
    it("should map domain Calendar to Google Calendar format", () => {
      const calendar = new Calendar(
        "cal-123",
        "My Calendar",
        "user-456",
        {
          timeZone: "America/New_York",
          description: "Test calendar",
          location: "New York",
        },
        true,
        "owner",
      );

      const googleCalendar = CalendarMapper.toGoogleCalendar(calendar);

      expect(googleCalendar.id).toBe("cal-123");
      expect(googleCalendar.summary).toBe("My Calendar");
      expect(googleCalendar.timeZone).toBe("America/New_York");
      expect(googleCalendar.description).toBe("Test calendar");
      expect(googleCalendar.location).toBe("New York");
    });
  });

  describe("toGoogleCalendarListEntry", () => {
    it("should map domain Calendar to Google CalendarListEntry format", () => {
      const calendar = new Calendar(
        "cal-123",
        "My Calendar",
        "user-456",
        {
          timeZone: "Europe/London",
          backgroundColor: "#FF0000",
          foregroundColor: "#FFFFFF",
        },
        false,
        "writer",
      );

      const listEntry = CalendarMapper.toGoogleCalendarListEntry(calendar);

      expect(listEntry.id).toBe("cal-123");
      expect(listEntry.summary).toBe("My Calendar");
      expect(listEntry.timeZone).toBe("Europe/London");
      expect(listEntry.backgroundColor).toBe("#FF0000");
      expect(listEntry.foregroundColor).toBe("#FFFFFF");
      expect(listEntry.selected).toBe(false);
      expect(listEntry.accessRole).toBe("writer");
    });
  });

  describe("toGoogleCalendarPartial", () => {
    it("should map partial Calendar updates", () => {
      const updates = {
        name: "Updated Calendar",
        settings: {
          timeZone: "Asia/Tokyo",
          description: "Updated description",
          location: "Tokyo",
        },
      };

      const partial = CalendarMapper.toGoogleCalendarPartial(updates);

      expect(partial.summary).toBe("Updated Calendar");
      expect(partial.timeZone).toBe("Asia/Tokyo");
      expect(partial.description).toBe("Updated description");
      expect(partial.location).toBe("Tokyo");
    });

    it("should handle undefined updates", () => {
      const updates = {};

      const partial = CalendarMapper.toGoogleCalendarPartial(updates);

      expect(partial.summary).toBeUndefined();
      expect(partial.timeZone).toBeUndefined();
    });
  });

  describe("toDomainArray", () => {
    it("should map array of Google Calendars to domain entities", () => {
      const googleCalendars: calendar_v3.Schema$CalendarListEntry[] = [
        { id: "cal-1", summary: "Calendar 1" },
        { id: "cal-2", summary: "Calendar 2" },
      ];

      const calendars = CalendarMapper.toDomainArray(googleCalendars);

      expect(calendars).toHaveLength(2);
      expect(calendars[0]).toBeInstanceOf(Calendar);
      expect(calendars[1]).toBeInstanceOf(Calendar);
      expect(calendars[0].id).toBe("cal-1");
      expect(calendars[1].id).toBe("cal-2");
    });

    it("should filter out calendars without id or summary", () => {
      const googleCalendars: calendar_v3.Schema$CalendarListEntry[] = [
        { id: "cal-1", summary: "Calendar 1" },
        { id: "cal-2" }, // Missing summary
        { summary: "Calendar 3" }, // Missing id
      ];

      const calendars = CalendarMapper.toDomainArray(googleCalendars);

      expect(calendars).toHaveLength(1);
      expect(calendars[0].id).toBe("cal-1");
    });

    it("should return empty array for empty input", () => {
      const calendars = CalendarMapper.toDomainArray([]);
      expect(calendars).toHaveLength(0);
    });
  });
});
