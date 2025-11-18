import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { formatEventData, coerceArgs, safeParse } from "./agent-utils";
import { TIMEZONE } from "@/types";

// Mock the Supabase client
jest.mock("@/config/root-config", () => ({
  SUPABASE: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    })),
  },
}));

describe("agent-utils", () => {
  describe("safeParse", () => {
    it("should parse valid JSON string", () => {
      const result = safeParse('{"key": "value"}');
      expect(result).toEqual({ key: "value" });
    });

    it("should parse array JSON", () => {
      const result = safeParse('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it("should parse nested objects", () => {
      const result = safeParse('{"nested": {"key": "value"}}');
      expect(result).toEqual({ nested: { key: "value" } });
    });

    it("should throw on invalid JSON", () => {
      expect(() => safeParse("invalid json")).toThrow();
    });

    it("should parse null", () => {
      const result = safeParse("null");
      expect(result).toBeNull();
    });

    it("should parse boolean", () => {
      expect(safeParse("true")).toBe(true);
      expect(safeParse("false")).toBe(false);
    });
  });

  describe("coerceArgs", () => {
    it("should extract email from base level", () => {
      const input = { email: "test@example.com" };
      const result = coerceArgs(input);
      expect(result.email).toBe("test@example.com");
    });

    it("should extract calendarId from outer level", () => {
      const input = { calendarId: "primary" };
      const result = coerceArgs(input);
      expect(result.calendarId).toBe("primary");
    });

    it("should extract eventId from base level", () => {
      const input = { eventId: "event123" };
      const result = coerceArgs(input);
      expect(result.eventId).toBe("event123");
    });

    it("should extract event fields from nested structure", () => {
      const input = {
        eventParameters: {
          summary: "Meeting",
          description: "Team meeting",
        },
      };
      const result = coerceArgs(input);
      expect(result.eventLike.summary).toBe("Meeting");
      expect(result.eventLike.description).toBe("Team meeting");
    });

    it("should handle fullEventParameters nesting", () => {
      const input = {
        fullEventParameters: {
          eventParameters: {
            summary: "Event",
          },
        },
      };
      const result = coerceArgs(input);
      expect(result.eventLike.summary).toBe("Event");
    });

    it("should handle stringified input", () => {
      const input = {
        input: '{"summary": "Parsed Event"}',
      };
      const result = coerceArgs(input);
      expect(result.eventLike.summary).toBe("Parsed Event");
    });

    it("should clean null and empty string values", () => {
      const input = {
        eventParameters: {
          summary: "Event",
          description: null,
          location: "",
        },
      };
      const result = coerceArgs(input);
      expect(result.eventLike.summary).toBe("Event");
      expect(result.eventLike.description).toBeUndefined();
      expect(result.eventLike.location).toBeUndefined();
    });

    it("should preserve attendees array", () => {
      const attendees = [{ email: "user@example.com" }];
      const input = {
        eventParameters: {
          summary: "Meeting",
          attendees,
        },
      };
      const result = coerceArgs(input);
      expect(result.eventLike.attendees).toEqual(attendees);
    });

    it("should handle complex nested structure", () => {
      const input = {
        fullEventParameters: {
          calendarId: "primary",
          email: "test@example.com",
          eventParameters: {
            summary: "Event",
            start: { dateTime: "2024-01-01T10:00:00Z" },
            end: { dateTime: "2024-01-01T11:00:00Z" },
          },
        },
      };
      const result = coerceArgs(input);
      expect(result.email).toBe("test@example.com");
      expect(result.calendarId).toBe("primary");
      expect(result.eventLike.summary).toBe("Event");
    });
  });

  describe("formatEventData", () => {
    const validTimezone = TIMEZONE.DEFAULT;

    describe("valid timed events", () => {
      it("should format valid timed event", () => {
        const params = {
          summary: "Meeting",
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        const result = formatEventData(params);
        expect(result.summary).toBe("Meeting");
        expect(result.start?.dateTime).toBe("2024-01-01T10:00:00Z");
        expect(result.start?.timeZone).toBe(validTimezone);
      });

      it("should include optional fields when provided", () => {
        const params = {
          summary: "Meeting",
          description: "Team sync",
          location: "Conference Room A",
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        const result = formatEventData(params);
        expect(result.description).toBe("Team sync");
        expect(result.location).toBe("Conference Room A");
      });

      it("should handle attendees", () => {
        const attendees = [{ email: "user@example.com" }];
        const params = {
          summary: "Meeting",
          attendees,
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        const result = formatEventData(params);
        expect(result.attendees).toEqual(attendees);
      });

      it("should use start timezone for end if not specified", () => {
        const params = {
          summary: "Meeting",
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
          },
        };
        const result = formatEventData(params);
        expect(result.end?.timeZone).toBe(validTimezone);
      });
    });

    describe("valid all-day events", () => {
      it("should format valid all-day event", () => {
        const params = {
          summary: "All Day Event",
          start: {
            date: "2024-01-01",
          },
          end: {
            date: "2024-01-02",
          },
        };
        const result = formatEventData(params);
        expect(result.summary).toBe("All Day Event");
        expect(result.start?.date).toBe("2024-01-01");
        expect(result.start?.timeZone).toBeUndefined();
        expect(result.end?.date).toBe("2024-01-02");
      });

      it("should remove timeZone from all-day events", () => {
        const params = {
          summary: "All Day Event",
          start: {
            date: "2024-01-01",
            timeZone: validTimezone,
          },
          end: {
            date: "2024-01-02",
          },
        };
        const result = formatEventData(params);
        expect(result.start?.timeZone).toBeUndefined();
      });
    });

    describe("error cases", () => {
      it("should throw when summary is missing", () => {
        const params = {
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        expect(() => formatEventData(params)).toThrow("Event summary is required");
      });

      it("should throw when start is missing", () => {
        const params = {
          summary: "Meeting",
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        expect(() => formatEventData(params)).toThrow("Event start is required");
      });

      it("should throw when end is missing", () => {
        const params = {
          summary: "Meeting",
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
        };
        expect(() => formatEventData(params)).toThrow("Event end is required");
      });

      it("should throw when timezone is missing for timed event", () => {
        const params = {
          summary: "Meeting",
          start: {
            dateTime: "2024-01-01T10:00:00Z",
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
          },
        };
        expect(() => formatEventData(params)).toThrow("Event timeZone is required for timed events");
      });

      it("should throw for invalid timezone", () => {
        const params = {
          summary: "Meeting",
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: "Invalid/Timezone",
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: "Invalid/Timezone",
          },
        };
        expect(() => formatEventData(params)).toThrow("Invalid timeZone");
      });

      it("should throw when start and end timezones don't match", () => {
        const params = {
          summary: "Meeting",
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: TIMEZONE.AMERICA_NEW_YORK,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: TIMEZONE.AMERICA_LOS_ANGELES,
          },
        };
        expect(() => formatEventData(params)).toThrow("Start and end time zones must match");
      });
    });

    describe("data cleaning", () => {
      it("should remove empty string values", () => {
        const params = {
          summary: "Meeting",
          description: "",
          location: "",
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        const result = formatEventData(params);
        expect(result.description).toBeUndefined();
        expect(result.location).toBeUndefined();
      });

      it("should remove null values", () => {
        const params = {
          summary: "Meeting",
          description: null,
          location: null,
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        const result = formatEventData(params);
        expect(result.description).toBeUndefined();
        expect(result.location).toBeUndefined();
      });

      it("should remove undefined values", () => {
        const params = {
          summary: "Meeting",
          description: undefined,
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        const result = formatEventData(params);
        expect(result.description).toBeUndefined();
      });

      it("should remove empty nested objects", () => {
        const params = {
          summary: "Meeting",
          reminders: { useDefault: undefined },
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        const result = formatEventData(params);
        expect(result.reminders).toBeUndefined();
      });
    });

    describe("edge cases", () => {
      it("should handle empty summary string after trim", () => {
        const params = {
          summary: "",
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        expect(() => formatEventData(params)).toThrow("Event summary is required");
      });

      it("should handle multiple attendees", () => {
        const attendees = [
          { email: "user1@example.com" },
          { email: "user2@example.com" },
          { email: "user3@example.com" },
        ];
        const params = {
          summary: "Meeting",
          attendees,
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        const result = formatEventData(params);
        expect(result.attendees).toHaveLength(3);
      });

      it("should handle recurrence rules", () => {
        const params = {
          summary: "Recurring Meeting",
          recurrence: ["RRULE:FREQ=WEEKLY;COUNT=10"],
          start: {
            dateTime: "2024-01-01T10:00:00Z",
            timeZone: validTimezone,
          },
          end: {
            dateTime: "2024-01-01T11:00:00Z",
            timeZone: validTimezone,
          },
        };
        const result = formatEventData(params);
        expect(result.recurrence).toEqual(["RRULE:FREQ=WEEKLY;COUNT=10"]);
      });
    });
  });
});
