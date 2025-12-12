import { describe, it, expect } from "@jest/globals";
import { EventDateTime } from "../../domain/value-objects/EventDateTime";

describe("EventDateTime Value Object", () => {
  describe("Creation from DateTime", () => {
    it("should create from Date object", () => {
      const date = new Date("2024-12-01T10:00:00Z");
      const eventDateTime = EventDateTime.fromDateTime(date, "America/New_York");

      expect(eventDateTime.getDateTime()).toEqual(date);
      expect(eventDateTime.getTimeZone()).toBe("America/New_York");
      expect(eventDateTime.isAllDay()).toBe(false);
    });

    it("should use UTC timezone by default", () => {
      const date = new Date("2024-12-01T10:00:00Z");
      const eventDateTime = EventDateTime.fromDateTime(date);

      expect(eventDateTime.getTimeZone()).toBe("UTC");
    });

    it("should throw error for invalid Date object", () => {
      expect(() => {
        EventDateTime.fromDateTime("not a date" as any);
      }).toThrow("Invalid date object provided");
    });

    it("should throw error for invalid date (NaN)", () => {
      const invalidDate = new Date("invalid");

      expect(() => {
        EventDateTime.fromDateTime(invalidDate);
      }).toThrow("Invalid date provided");
    });
  });

  describe("Creation from Date String (All-Day)", () => {
    it("should create from YYYY-MM-DD date string", () => {
      const eventDateTime = EventDateTime.fromDate("2024-12-01", "America/New_York");

      expect(eventDateTime.getDate()).toBe("2024-12-01");
      expect(eventDateTime.getTimeZone()).toBe("America/New_York");
      expect(eventDateTime.isAllDay()).toBe(true);
    });

    it("should use UTC timezone by default for date", () => {
      const eventDateTime = EventDateTime.fromDate("2024-12-01");

      expect(eventDateTime.getTimeZone()).toBe("UTC");
    });

    it("should throw error for invalid date format", () => {
      expect(() => {
        EventDateTime.fromDate("2024-12-1");
      }).toThrow("Invalid date format. Expected YYYY-MM-DD");

      expect(() => {
        EventDateTime.fromDate("12-01-2024");
      }).toThrow("Invalid date format. Expected YYYY-MM-DD");

      expect(() => {
        EventDateTime.fromDate("2024/12/01");
      }).toThrow("Invalid date format. Expected YYYY-MM-DD");
    });

    it("should validate date values", () => {
      expect(() => {
        EventDateTime.fromDate("2024-13-01"); // Invalid month
      }).toThrow("Invalid date format. Expected YYYY-MM-DD");

      expect(() => {
        EventDateTime.fromDate("2024-02-30"); // Invalid day
      }).toThrow("Invalid date format. Expected YYYY-MM-DD");
    });

    it("should accept valid dates", () => {
      const validDates = [
        "2024-01-01",
        "2024-12-31",
        "2024-02-29", // Leap year
        "2023-02-28", // Non-leap year
      ];

      for (const date of validDates) {
        const eventDateTime = EventDateTime.fromDate(date);
        expect(eventDateTime.getDate()).toBe(date);
      }
    });
  });

  describe("Creation from ISO String", () => {
    it("should create from ISO string", () => {
      const isoString = "2024-12-01T10:00:00.000Z";
      const eventDateTime = EventDateTime.fromISOString(isoString, "Europe/London");

      expect(eventDateTime.getDateTime()?.toISOString()).toBe(isoString);
      expect(eventDateTime.getTimeZone()).toBe("Europe/London");
    });

    it("should throw error for invalid ISO string", () => {
      expect(() => {
        EventDateTime.fromISOString("not-an-iso-string");
      }).toThrow("Invalid ISO string provided");
    });
  });

  describe("Comparison Methods", () => {
    it("should correctly compare isBefore for date-time events", () => {
      const earlier = EventDateTime.fromDateTime(new Date("2024-12-01T10:00:00Z"));
      const later = EventDateTime.fromDateTime(new Date("2024-12-01T11:00:00Z"));

      expect(earlier.isBefore(later)).toBe(true);
      expect(later.isBefore(earlier)).toBe(false);
    });

    it("should correctly compare isAfter for date-time events", () => {
      const earlier = EventDateTime.fromDateTime(new Date("2024-12-01T10:00:00Z"));
      const later = EventDateTime.fromDateTime(new Date("2024-12-01T11:00:00Z"));

      expect(later.isAfter(earlier)).toBe(true);
      expect(earlier.isAfter(later)).toBe(false);
    });

    it("should correctly compare isBefore for all-day events", () => {
      const earlier = EventDateTime.fromDate("2024-12-01");
      const later = EventDateTime.fromDate("2024-12-02");

      expect(earlier.isBefore(later)).toBe(true);
      expect(later.isBefore(earlier)).toBe(false);
    });

    it("should correctly compare isAfter for all-day events", () => {
      const earlier = EventDateTime.fromDate("2024-12-01");
      const later = EventDateTime.fromDate("2024-12-02");

      expect(later.isAfter(earlier)).toBe(true);
      expect(earlier.isAfter(later)).toBe(false);
    });

    it("should handle same-day comparisons", () => {
      const date1 = EventDateTime.fromDate("2024-12-01");
      const date2 = EventDateTime.fromDate("2024-12-01");

      expect(date1.isBefore(date2)).toBe(false);
      expect(date1.isAfter(date2)).toBe(false);
    });
  });

  describe("Equality", () => {
    it("should be equal for same date-time and timezone", () => {
      const date = new Date("2024-12-01T10:00:00Z");
      const dt1 = EventDateTime.fromDateTime(date, "America/New_York");
      const dt2 = EventDateTime.fromDateTime(date, "America/New_York");

      expect(dt1.equals(dt2)).toBe(true);
    });

    it("should not be equal for different timezones", () => {
      const date = new Date("2024-12-01T10:00:00Z");
      const dt1 = EventDateTime.fromDateTime(date, "America/New_York");
      const dt2 = EventDateTime.fromDateTime(date, "Europe/London");

      expect(dt1.equals(dt2)).toBe(false);
    });

    it("should not be equal for different times", () => {
      const dt1 = EventDateTime.fromDateTime(new Date("2024-12-01T10:00:00Z"));
      const dt2 = EventDateTime.fromDateTime(new Date("2024-12-01T11:00:00Z"));

      expect(dt1.equals(dt2)).toBe(false);
    });

    it("should be equal for same all-day date", () => {
      const dt1 = EventDateTime.fromDate("2024-12-01", "UTC");
      const dt2 = EventDateTime.fromDate("2024-12-01", "UTC");

      expect(dt1.equals(dt2)).toBe(true);
    });

    it("should not be equal when comparing date-time to all-day", () => {
      const dateTime = EventDateTime.fromDateTime(new Date("2024-12-01T00:00:00Z"));
      const allDay = EventDateTime.fromDate("2024-12-01");

      expect(dateTime.equals(allDay)).toBe(false);
    });
  });

  describe("Google Calendar Format Conversion", () => {
    it("should convert date-time to Google Calendar format", () => {
      const date = new Date("2024-12-01T10:00:00.000Z");
      const eventDateTime = EventDateTime.fromDateTime(date, "America/New_York");

      const gcFormat = eventDateTime.toGoogleCalendarFormat();

      expect(gcFormat.dateTime).toBe("2024-12-01T10:00:00.000Z");
      expect(gcFormat.timeZone).toBe("America/New_York");
      expect(gcFormat.date).toBeUndefined();
    });

    it("should convert all-day date to Google Calendar format", () => {
      const eventDateTime = EventDateTime.fromDate("2024-12-01", "America/New_York");

      const gcFormat = eventDateTime.toGoogleCalendarFormat();

      expect(gcFormat.date).toBe("2024-12-01");
      expect(gcFormat.timeZone).toBe("America/New_York");
      expect(gcFormat.dateTime).toBeUndefined();
    });

    it("should create from Google Calendar date-time format", () => {
      const gcData = {
        dateTime: "2024-12-01T10:00:00.000Z",
        timeZone: "America/New_York",
      };

      const eventDateTime = EventDateTime.fromGoogleCalendarFormat(gcData);

      expect(eventDateTime.getDateTime()?.toISOString()).toBe("2024-12-01T10:00:00.000Z");
      expect(eventDateTime.getTimeZone()).toBe("America/New_York");
      expect(eventDateTime.isAllDay()).toBe(false);
    });

    it("should create from Google Calendar all-day format", () => {
      const gcData = {
        date: "2024-12-01",
        timeZone: "America/New_York",
      };

      const eventDateTime = EventDateTime.fromGoogleCalendarFormat(gcData);

      expect(eventDateTime.getDate()).toBe("2024-12-01");
      expect(eventDateTime.getTimeZone()).toBe("America/New_York");
      expect(eventDateTime.isAllDay()).toBe(true);
    });

    it("should use UTC if no timezone provided in Google Calendar format", () => {
      const gcData = {
        dateTime: "2024-12-01T10:00:00.000Z",
      };

      const eventDateTime = EventDateTime.fromGoogleCalendarFormat(gcData);

      expect(eventDateTime.getTimeZone()).toBe("UTC");
    });

    it("should throw error if neither dateTime nor date provided", () => {
      const gcData = {
        timeZone: "UTC",
      };

      expect(() => {
        EventDateTime.fromGoogleCalendarFormat(gcData as any);
      }).toThrow("Either dateTime or date must be provided in Google Calendar format");
    });

    it("should round-trip through Google Calendar format", () => {
      const original = EventDateTime.fromDateTime(new Date("2024-12-01T10:00:00.000Z"), "Europe/London");

      const gcFormat = original.toGoogleCalendarFormat();
      const restored = EventDateTime.fromGoogleCalendarFormat(gcFormat);

      expect(original.equals(restored)).toBe(true);
    });
  });

  describe("Timezone Changes", () => {
    it("should create copy with different timezone for date-time", () => {
      const original = EventDateTime.fromDateTime(new Date("2024-12-01T10:00:00Z"), "UTC");
      const modified = original.withTimeZone("America/New_York");

      expect(modified.getTimeZone()).toBe("America/New_York");
      expect(modified.getDateTime()).toEqual(original.getDateTime());
      expect(original.getTimeZone()).toBe("UTC"); // Original unchanged
    });

    it("should create copy with different timezone for all-day", () => {
      const original = EventDateTime.fromDate("2024-12-01", "UTC");
      const modified = original.withTimeZone("Europe/Paris");

      expect(modified.getTimeZone()).toBe("Europe/Paris");
      expect(modified.getDate()).toBe("2024-12-01");
      expect(original.getTimeZone()).toBe("UTC"); // Original unchanged
    });
  });

  describe("ISO String Conversion", () => {
    it("should convert date-time to ISO string", () => {
      const date = new Date("2024-12-01T10:00:00.000Z");
      const eventDateTime = EventDateTime.fromDateTime(date);

      expect(eventDateTime.toISOString()).toBe("2024-12-01T10:00:00.000Z");
    });

    it("should return undefined for all-day events", () => {
      const eventDateTime = EventDateTime.fromDate("2024-12-01");

      expect(eventDateTime.toISOString()).toBeUndefined();
    });
  });

  describe("String Representation", () => {
    it("should provide string representation for date-time", () => {
      const date = new Date("2024-12-01T10:00:00.000Z");
      const eventDateTime = EventDateTime.fromDateTime(date, "America/New_York");

      const str = eventDateTime.toString();

      expect(str).toContain("2024-12-01T10:00:00.000Z");
      expect(str).toContain("America/New_York");
    });

    it("should provide string representation for all-day", () => {
      const eventDateTime = EventDateTime.fromDate("2024-12-01", "Europe/London");

      const str = eventDateTime.toString();

      expect(str).toContain("2024-12-01");
      expect(str).toContain("all-day");
      expect(str).toContain("Europe/London");
    });
  });

  describe("Getter Methods", () => {
    it("should return dateTime for timed events", () => {
      const date = new Date("2024-12-01T10:00:00Z");
      const eventDateTime = EventDateTime.fromDateTime(date);

      expect(eventDateTime.getDateTime()).toEqual(date);
      expect(eventDateTime.getDate()).toBeUndefined();
    });

    it("should return date for all-day events", () => {
      const eventDateTime = EventDateTime.fromDate("2024-12-01");

      expect(eventDateTime.getDate()).toBe("2024-12-01");
      expect(eventDateTime.getDateTime()).toBeUndefined();
    });

    it("should always return timezone", () => {
      const dt1 = EventDateTime.fromDateTime(new Date(), "America/New_York");
      const dt2 = EventDateTime.fromDate("2024-12-01", "Europe/London");

      expect(dt1.getTimeZone()).toBe("America/New_York");
      expect(dt2.getTimeZone()).toBe("Europe/London");
    });
  });

  describe("Edge Cases", () => {
    it("should handle leap year dates", () => {
      const leapYear = EventDateTime.fromDate("2024-02-29");

      expect(leapYear.getDate()).toBe("2024-02-29");
    });

    it("should handle end of year dates", () => {
      const endOfYear = EventDateTime.fromDate("2024-12-31");

      expect(endOfYear.getDate()).toBe("2024-12-31");
    });

    it("should handle beginning of year dates", () => {
      const startOfYear = EventDateTime.fromDate("2024-01-01");

      expect(startOfYear.getDate()).toBe("2024-01-01");
    });

    it("should handle dates with milliseconds", () => {
      const date = new Date("2024-12-01T10:00:00.123Z");
      const eventDateTime = EventDateTime.fromDateTime(date);

      expect(eventDateTime.getDateTime()?.getMilliseconds()).toBe(123);
    });

    it("should handle very old dates", () => {
      const oldDate = new Date("1900-01-01T00:00:00Z");
      const eventDateTime = EventDateTime.fromDateTime(oldDate);

      expect(eventDateTime.getDateTime()).toEqual(oldDate);
    });

    it("should handle far future dates", () => {
      const futureDate = new Date("2099-12-31T23:59:59Z");
      const eventDateTime = EventDateTime.fromDateTime(futureDate);

      expect(eventDateTime.getDateTime()).toEqual(futureDate);
    });
  });
});
