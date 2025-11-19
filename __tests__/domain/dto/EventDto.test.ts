import { describe, it, expect } from "@jest/globals";
import { isEventDto } from "@/domain/dto/EventDto";

describe("EventDto", () => {
  describe("isEventDto", () => {
    it("should return true for valid EventDto", () => {
      const validDto = {
        id: "event-123",
        summary: "Team Meeting",
        start: {
          dateTime: "2024-01-15T10:00:00Z",
          timeZone: "America/New_York",
        },
        end: {
          dateTime: "2024-01-15T11:00:00Z",
          timeZone: "America/New_York",
        },
        description: "Weekly team sync",
        location: "Conference Room A",
        status: "confirmed" as const,
        visibility: "default" as const,
      };

      expect(isEventDto(validDto)).toBe(true);
    });

    it("should return true for valid EventDto without optional fields", () => {
      const validDto = {
        id: "event-123",
        summary: "Team Meeting",
        start: {
          dateTime: "2024-01-15T10:00:00Z",
        },
        end: {
          dateTime: "2024-01-15T11:00:00Z",
        },
      };

      expect(isEventDto(validDto)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isEventDto(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isEventDto(undefined)).toBe(false);
    });

    it("should return false for non-object types", () => {
      expect(isEventDto("string")).toBe(false);
      expect(isEventDto(123)).toBe(false);
      expect(isEventDto(true)).toBe(false);
    });

    it("should return false when id is missing", () => {
      const invalidDto = {
        summary: "Team Meeting",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      expect(isEventDto(invalidDto)).toBe(false);
    });

    it("should return false when summary is missing", () => {
      const invalidDto = {
        id: "event-123",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      expect(isEventDto(invalidDto)).toBe(false);
    });

    it("should return false when start is missing", () => {
      const invalidDto = {
        id: "event-123",
        summary: "Team Meeting",
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      expect(isEventDto(invalidDto)).toBe(false);
    });

    it("should return false when end is missing", () => {
      const invalidDto = {
        id: "event-123",
        summary: "Team Meeting",
        start: { dateTime: "2024-01-15T10:00:00Z" },
      };

      expect(isEventDto(invalidDto)).toBe(false);
    });

    it("should return false when id is not a string", () => {
      const invalidDto = {
        id: 123,
        summary: "Team Meeting",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      expect(isEventDto(invalidDto)).toBe(false);
    });

    it("should return false when summary is not a string", () => {
      const invalidDto = {
        id: "event-123",
        summary: 123,
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      expect(isEventDto(invalidDto)).toBe(false);
    });

    it("should return false when start is not an object", () => {
      const invalidDto = {
        id: "event-123",
        summary: "Team Meeting",
        start: "2024-01-15T10:00:00Z",
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };

      expect(isEventDto(invalidDto)).toBe(false);
    });

    it("should return false when end is not an object", () => {
      const invalidDto = {
        id: "event-123",
        summary: "Team Meeting",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: "2024-01-15T11:00:00Z",
      };

      expect(isEventDto(invalidDto)).toBe(false);
    });
  });
});
