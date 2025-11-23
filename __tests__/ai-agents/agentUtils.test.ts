import { formatEventData, coerceArgs, safeParse, getCalendarCategoriesByEmail } from "@/ai-agents/agentUtils";
import { SUPABASE } from "@/config/root-config";
import type { calendar_v3 } from "googleapis";

jest.mock("@/config/root-config", () => ({
  SUPABASE: {
    from: jest.fn(),
  },
}));

describe("Agent Utils", () => {
  describe("safeParse", () => {
    it("should parse valid JSON string", () => {
      const result = safeParse('{"test": "value"}');
      expect(result).toEqual({ test: "value" });
    });

    it("should parse array JSON string", () => {
      const result = safeParse('[1, 2, 3]');
      expect(result).toEqual([1, 2, 3]);
    });

    it("should throw on invalid JSON", () => {
      expect(() => safeParse("invalid json")).toThrow();
    });
  });

  describe("coerceArgs", () => {
    it("should extract email and event-like from simple object", () => {
      const input = {
        email: "test@example.com",
        summary: "Test Event",
        start: { dateTime: "2025-01-01T10:00:00Z" },
        end: { dateTime: "2025-01-01T11:00:00Z" },
      };

      const result = coerceArgs(input);

      expect(result.email).toBe("test@example.com");
      expect(result.eventLike.summary).toBe("Test Event");
      expect(result.eventLike.start).toEqual({ dateTime: "2025-01-01T10:00:00Z" });
      expect(result.eventLike.end).toEqual({ dateTime: "2025-01-01T11:00:00Z" });
    });

    it("should extract calendarId when present", () => {
      const input = {
        email: "test@example.com",
        calendarId: "calendar123",
        summary: "Test Event",
        start: { dateTime: "2025-01-01T10:00:00Z" },
        end: { dateTime: "2025-01-01T11:00:00Z" },
      };

      const result = coerceArgs(input);

      expect(result.calendarId).toBe("calendar123");
    });

    it("should extract eventId when present", () => {
      const input = {
        email: "test@example.com",
        eventId: "event123",
        summary: "Test Event",
        start: { dateTime: "2025-01-01T10:00:00Z" },
        end: { dateTime: "2025-01-01T11:00:00Z" },
      };

      const result = coerceArgs(input);

      expect(result.eventId).toBe("event123");
    });

    it("should handle nested eventParameters", () => {
      const input = {
        email: "test@example.com",
        eventParameters: {
          summary: "Test Event",
          start: { dateTime: "2025-01-01T10:00:00Z" },
          end: { dateTime: "2025-01-01T11:00:00Z" },
        },
      };

      const result = coerceArgs(input);

      expect(result.email).toBe("test@example.com");
      expect(result.eventLike.summary).toBe("Test Event");
    });

    it("should handle fullEventParameters nesting", () => {
      const input = {
        fullEventParameters: {
          email: "test@example.com",
          summary: "Test Event",
          start: { dateTime: "2025-01-01T10:00:00Z" },
          end: { dateTime: "2025-01-01T11:00:00Z" },
        },
      };

      const result = coerceArgs(input);

      expect(result.email).toBe("test@example.com");
      expect(result.eventLike.summary).toBe("Test Event");
    });

    it("should remove null and empty string values", () => {
      const input = {
        email: "test@example.com",
        summary: "Test Event",
        description: null,
        location: "",
        start: { dateTime: "2025-01-01T10:00:00Z" },
        end: { dateTime: "2025-01-01T11:00:00Z" },
      };

      const result = coerceArgs(input);

      expect(result.eventLike.description).toBeUndefined();
      expect(result.eventLike.location).toBeUndefined();
      expect(result.eventLike.summary).toBe("Test Event");
    });

    it("should parse stringified JSON input", () => {
      const input = {
        input: JSON.stringify({
          email: "test@example.com",
          summary: "Test Event",
          start: { dateTime: "2025-01-01T10:00:00Z" },
          end: { dateTime: "2025-01-01T11:00:00Z" },
        }),
      };

      const result = coerceArgs(input);

      expect(result.email).toBe("test@example.com");
      expect(result.eventLike.summary).toBe("Test Event");
    });
  });

  describe("formatEventData", () => {
    describe("Timed Events", () => {
      it("should format valid timed event", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          summary: "Test Event",
          description: "Test Description",
          location: "Test Location",
          start: {
            dateTime: "2025-01-01T10:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
          end: {
            dateTime: "2025-01-01T11:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
        };

        const result = formatEventData(input);

        expect(result.summary).toBe("Test Event");
        expect(result.description).toBe("Test Description");
        expect(result.location).toBe("Test Location");
        expect(result.start?.dateTime).toBe("2025-01-01T10:00:00Z");
        expect(result.start?.timeZone).toBe("Asia/Jerusalem");
        expect(result.end?.dateTime).toBe("2025-01-01T11:00:00Z");
        expect(result.end?.timeZone).toBe("Asia/Jerusalem");
      });

      it("should infer end timezone from start timezone", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          summary: "Test Event",
          start: {
            dateTime: "2025-01-01T10:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
          end: {
            dateTime: "2025-01-01T11:00:00Z",
          },
        };

        const result = formatEventData(input);

        expect(result.start?.timeZone).toBe("Asia/Jerusalem");
        expect(result.end?.timeZone).toBe("Asia/Jerusalem");
      });

      it("should throw error if summary is missing", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          start: {
            dateTime: "2025-01-01T10:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
          end: {
            dateTime: "2025-01-01T11:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
        };

        expect(() => formatEventData(input)).toThrow("Event summary is required");
      });

      it("should throw error if start is missing", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          summary: "Test Event",
          end: {
            dateTime: "2025-01-01T11:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
        };

        expect(() => formatEventData(input)).toThrow("Event start is required");
      });

      it("should throw error if end is missing", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          summary: "Test Event",
          start: {
            dateTime: "2025-01-01T10:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
        };

        expect(() => formatEventData(input)).toThrow("Event end is required");
      });

      it("should throw error if timezone is missing for timed events", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          summary: "Test Event",
          start: {
            dateTime: "2025-01-01T10:00:00Z",
          },
          end: {
            dateTime: "2025-01-01T11:00:00Z",
          },
        };

        expect(() => formatEventData(input)).toThrow("Event timeZone is required for timed events");
      });

      it("should throw error if start and end timezones differ", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          summary: "Test Event",
          start: {
            dateTime: "2025-01-01T10:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
          end: {
            dateTime: "2025-01-01T11:00:00Z",
            timeZone: "America/New_York",
          },
        };

        expect(() => formatEventData(input)).toThrow("Start and end time zones must match");
      });

      it("should throw error if timezone is invalid", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          summary: "Test Event",
          start: {
            dateTime: "2025-01-01T10:00:00Z",
            timeZone: "Invalid/Timezone",
          },
          end: {
            dateTime: "2025-01-01T11:00:00Z",
            timeZone: "Invalid/Timezone",
          },
        };

        expect(() => formatEventData(input)).toThrow("Invalid timeZone");
      });
    });

    describe("All-Day Events", () => {
      it("should format valid all-day event", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          summary: "All Day Event",
          start: {
            date: "2025-01-01",
          },
          end: {
            date: "2025-01-02",
          },
        };

        const result = formatEventData(input);

        expect(result.summary).toBe("All Day Event");
        expect(result.start?.date).toBe("2025-01-01");
        expect(result.end?.date).toBe("2025-01-02");
        expect(result.start?.dateTime).toBeUndefined();
        expect(result.start?.timeZone).toBeUndefined();
        expect(result.end?.dateTime).toBeUndefined();
        expect(result.end?.timeZone).toBeUndefined();
      });

      it("should prioritize dateTime over date if both present", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          summary: "Test Event",
          start: {
            dateTime: "2025-01-01T10:00:00Z",
            date: "2025-01-01",
            timeZone: "Asia/Jerusalem",
          },
          end: {
            dateTime: "2025-01-01T11:00:00Z",
            date: "2025-01-01",
            timeZone: "Asia/Jerusalem",
          },
        };

        const result = formatEventData(input);

        expect(result.start?.dateTime).toBe("2025-01-01T10:00:00Z");
        expect(result.start?.date).toBeUndefined();
        expect(result.end?.dateTime).toBe("2025-01-01T11:00:00Z");
        expect(result.end?.date).toBeUndefined();
      });
    });

    describe("Optional Fields", () => {
      it("should include all optional fields when provided", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          summary: "Test Event",
          description: "Test Description",
          location: "Test Location",
          attendees: [{ email: "attendee@example.com" }],
          reminders: { useDefault: false },
          recurrence: ["RRULE:FREQ=DAILY"],
          colorId: "1",
          conferenceData: { conferenceId: "test" },
          transparency: "opaque",
          visibility: "public",
          start: {
            dateTime: "2025-01-01T10:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
          end: {
            dateTime: "2025-01-01T11:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
        };

        const result = formatEventData(input);

        expect(result.description).toBe("Test Description");
        expect(result.location).toBe("Test Location");
        expect(result.attendees).toEqual([{ email: "attendee@example.com" }]);
        expect(result.reminders).toEqual({ useDefault: false });
        expect(result.recurrence).toEqual(["RRULE:FREQ=DAILY"]);
        expect(result.colorId).toBe("1");
        expect(result.conferenceData).toEqual({ conferenceId: "test" });
        expect(result.transparency).toBe("opaque");
        expect(result.visibility).toBe("public");
      });

      it("should remove empty string and null optional fields", () => {
        const input: Partial<calendar_v3.Schema$Event> = {
          summary: "Test Event",
          description: "",
          location: null,
          start: {
            dateTime: "2025-01-01T10:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
          end: {
            dateTime: "2025-01-01T11:00:00Z",
            timeZone: "Asia/Jerusalem",
          },
        };

        const result = formatEventData(input);

        expect(result.description).toBeUndefined();
        expect(result.location).toBeUndefined();
      });
    });
  });

  describe("getCalendarCategoriesByEmail", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fetch calendar categories successfully", async () => {
      const mockData = [
        { calendar_id: "cal1", calendar_name: "Work", email: "test@example.com" },
        { calendar_id: "cal2", calendar_name: "Personal", email: "test@example.com" },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ data: mockData, error: null });

      (SUPABASE.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      const result = await getCalendarCategoriesByEmail("test@example.com");

      expect(SUPABASE.from).toHaveBeenCalledWith("calendar_categories");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("email", "test@example.com");
      expect(result).toEqual(mockData);
    });

    it("should throw error if database query fails", async () => {
      const mockError = new Error("Database error");

      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ data: null, error: mockError });

      (SUPABASE.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      await expect(getCalendarCategoriesByEmail("test@example.com")).rejects.toThrow("Database error");
    });

    it("should return empty array if no categories found", async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ data: [], error: null });

      (SUPABASE.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      mockSelect.mockReturnValue({
        eq: mockEq,
      });

      const result = await getCalendarCategoriesByEmail("test@example.com");

      expect(result).toEqual([]);
    });
  });
});
