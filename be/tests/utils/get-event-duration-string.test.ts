import { describe, expect, it } from "@jest/globals";

import { getEventDurationString } from "../../utils/calendar/duration";

describe("getEventDurationString", () => {
  describe("valid durations", () => {
    it("should return seconds for duration < 60 seconds", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T10:00:30Z";
      expect(getEventDurationString(start, end)).toBe("30s");
    });

    it("should return 1s for 1 second duration", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T10:00:01Z";
      expect(getEventDurationString(start, end)).toBe("1s");
    });

    it("should return 59s for 59 seconds", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T10:00:59Z";
      expect(getEventDurationString(start, end)).toBe("59s");
    });

    it("should return minutes for duration >= 60 seconds and < 60 minutes", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T10:15:00Z";
      expect(getEventDurationString(start, end)).toBe("15m");
    });

    it("should return 1m for 1 minute", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T10:01:00Z";
      expect(getEventDurationString(start, end)).toBe("1m");
    });

    it("should return 59m for 59 minutes", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T10:59:00Z";
      expect(getEventDurationString(start, end)).toBe("59m");
    });

    it("should return hours only for exact hour durations", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T12:00:00Z";
      expect(getEventDurationString(start, end)).toBe("2h");
    });

    it("should return 1h for 1 hour", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T11:00:00Z";
      expect(getEventDurationString(start, end)).toBe("1h");
    });

    it("should return hours and minutes for mixed durations", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T12:30:00Z";
      expect(getEventDurationString(start, end)).toBe("2h 30m");
    });

    it("should return hours and minutes for 1h 15m", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T11:15:00Z";
      expect(getEventDurationString(start, end)).toBe("1h 15m");
    });

    it("should handle long durations", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T18:45:00Z";
      expect(getEventDurationString(start, end)).toBe("8h 45m");
    });

    it("should handle full day duration", () => {
      const start = "2024-01-01T00:00:00Z";
      const end = "2024-01-02T00:00:00Z";
      expect(getEventDurationString(start, end)).toBe("24h");
    });
  });

  describe("rounding behavior", () => {
    it("should round seconds to nearest second", () => {
      const start = "2024-01-01T10:00:00.000Z";
      const end = "2024-01-01T10:00:45.600Z";
      expect(getEventDurationString(start, end)).toBe("46s");
    });

    it("should round minutes when seconds are present", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T10:15:30Z";
      // 15.5 minutes rounds to 16m
      expect(getEventDurationString(start, end)).toBe("16m");
    });

    it("should round down when < 30 seconds", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T10:15:25Z";
      // 15m 25s rounds to 15m
      expect(getEventDurationString(start, end)).toBe("15m");
    });
  });

  describe("invalid inputs", () => {
    it("should return null when start is null", () => {
      const end = "2024-01-01T10:00:00Z";
      expect(getEventDurationString(null, end)).toBeNull();
    });

    it("should return null when end is null", () => {
      const start = "2024-01-01T10:00:00Z";
      expect(getEventDurationString(start, null)).toBeNull();
    });

    it("should return null when both are null", () => {
      expect(getEventDurationString(null, null)).toBeNull();
    });

    it("should return null when start is undefined", () => {
      const end = "2024-01-01T10:00:00Z";
      expect(getEventDurationString(undefined, end)).toBeNull();
    });

    it("should return null when end is undefined", () => {
      const start = "2024-01-01T10:00:00Z";
      expect(getEventDurationString(start, undefined)).toBeNull();
    });

    it("should return null for invalid start date", () => {
      expect(
        getEventDurationString("invalid", "2024-01-01T10:00:00Z")
      ).toBeNull();
    });

    it("should return null for invalid end date", () => {
      expect(
        getEventDurationString("2024-01-01T10:00:00Z", "invalid")
      ).toBeNull();
    });

    it("should return null when end is before start", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-01T09:00:00Z";
      expect(getEventDurationString(start, end)).toBeNull();
    });

    it("should return null when end equals start", () => {
      const time = "2024-01-01T10:00:00Z";
      expect(getEventDurationString(time, time)).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("should handle very short duration (milliseconds)", () => {
      const start = "2024-01-01T10:00:00.000Z";
      const end = "2024-01-01T10:00:00.500Z";
      // 500ms rounds to 1s
      expect(getEventDurationString(start, end)).toBe("1s");
    });

    it("should handle duration across day boundaries", () => {
      const start = "2024-01-01T23:00:00Z";
      const end = "2024-01-02T01:30:00Z";
      expect(getEventDurationString(start, end)).toBe("2h 30m");
    });

    it("should handle duration across month boundaries", () => {
      const start = "2024-01-31T22:00:00Z";
      const end = "2024-02-01T02:00:00Z";
      expect(getEventDurationString(start, end)).toBe("4h");
    });

    it("should handle very long duration (multiple days)", () => {
      const start = "2024-01-01T10:00:00Z";
      const end = "2024-01-03T14:30:00Z";
      // 52.5 hours
      expect(getEventDurationString(start, end)).toBe("52h 30m");
    });
  });
});
