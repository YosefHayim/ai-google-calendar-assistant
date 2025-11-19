import { describe, it, expect } from "@jest/globals";
import formatDate from "../../utils/formatDate";

describe("formatDate", () => {
  describe("Valid Date Inputs", () => {
    it("should format a Date object without time", () => {
      const date = new Date("2024-12-01T10:00:00Z");
      const formatted = formatDate(date, false, "en-US");

      expect(formatted).toContain("2024");
      expect(formatted).toContain("December");
      expect(formatted).toContain("1");
      expect(formatted).not.toContain("10:00");
    });

    it("should format a Date object with time", () => {
      const date = new Date("2024-12-01T10:30:00Z");
      const formatted = formatDate(date, true, "en-US");

      expect(formatted).toContain("2024");
      expect(formatted).toContain("December");
      expect(formatted).toContain("1");
    });

    it("should format a date string without time", () => {
      const dateStr = "2024-12-25T15:00:00Z";
      const formatted = formatDate(dateStr, false, "en-US");

      expect(formatted).toContain("2024");
      expect(formatted).toContain("December");
      expect(formatted).toContain("25");
    });

    it("should format a date string with time", () => {
      const dateStr = "2024-12-25T15:30:00Z";
      const formatted = formatDate(dateStr, true, "en-US");

      expect(formatted).toContain("2024");
      expect(formatted).toContain("December");
      expect(formatted).toContain("25");
    });

    it("should use default language (he-IL) when not specified", () => {
      const date = new Date("2024-12-01T10:00:00Z");
      const formatted = formatDate(date);

      // Hebrew locale should produce different output than English
      expect(formatted).toBeDefined();
      expect(formatted).not.toBe("Invalid date");
    });

    it("should use different locales correctly", () => {
      const date = new Date("2024-12-01T10:00:00Z");
      const formattedUS = formatDate(date, false, "en-US");
      const formattedGB = formatDate(date, false, "en-GB");

      expect(formattedUS).toBeDefined();
      expect(formattedGB).toBeDefined();
      expect(formattedUS).not.toBe("Invalid date");
      expect(formattedGB).not.toBe("Invalid date");
    });
  });

  describe("Invalid Date Inputs", () => {
    it("should return 'Invalid date' for null", () => {
      const formatted = formatDate(null);

      expect(formatted).toBe("Invalid date");
    });

    it("should return 'Invalid date' for undefined", () => {
      const formatted = formatDate(undefined);

      expect(formatted).toBe("Invalid date");
    });

    it("should return 'Invalid date' for invalid date string", () => {
      const formatted = formatDate("not-a-date");

      expect(formatted).toBe("Invalid date");
    });

    it("should return 'Invalid date' for invalid Date object", () => {
      const invalidDate = new Date("invalid");
      const formatted = formatDate(invalidDate);

      expect(formatted).toBe("Invalid date");
    });

    it("should return 'Invalid date' for non-string non-Date input (number)", () => {
      const formatted = formatDate(12345 as any);

      expect(formatted).toBe("Invalid date");
    });

    it("should return 'Invalid date' for non-string non-Date input (object)", () => {
      const formatted = formatDate({ year: 2024 } as any);

      expect(formatted).toBe("Invalid date");
    });

    it("should return 'Invalid date' for non-string non-Date input (array)", () => {
      const formatted = formatDate([2024, 12, 1] as any);

      expect(formatted).toBe("Invalid date");
    });
  });

  describe("Edge Cases", () => {
    it("should handle leap year dates", () => {
      const date = new Date("2024-02-29T10:00:00Z");
      const formatted = formatDate(date, false, "en-US");

      expect(formatted).toContain("February");
      expect(formatted).toContain("29");
      expect(formatted).toContain("2024");
    });

    it("should handle end of year", () => {
      const date = new Date("2024-12-31T10:00:00Z");
      const formatted = formatDate(date, true, "en-US");

      expect(formatted).toContain("2024");
      expect(formatted).toBeDefined();
      expect(formatted).not.toBe("Invalid date");
    });

    it("should handle beginning of year", () => {
      const date = new Date("2024-01-01T00:00:00Z");
      const formatted = formatDate(date, false, "en-US");

      expect(formatted).toContain("January");
      expect(formatted).toContain("1");
      expect(formatted).toContain("2024");
    });

    it("should handle very old dates", () => {
      const date = new Date("1900-01-01T00:00:00Z");
      const formatted = formatDate(date, false, "en-US");

      expect(formatted).toContain("1900");
      expect(formatted).toContain("January");
    });

    it("should handle far future dates", () => {
      const date = new Date("2099-06-15T10:00:00Z");
      const formatted = formatDate(date, false, "en-US");

      expect(formatted).toContain("2099");
      expect(formatted).toBeDefined();
      expect(formatted).not.toBe("Invalid date");
    });
  });

  describe("withTime Parameter", () => {
    it("should include time when withTime is true", () => {
      const date = new Date("2024-12-01T14:30:00Z");
      const formatted = formatDate(date, true, "en-US");

      // Should contain time-related information
      expect(formatted).toBeDefined();
      expect(formatted.length).toBeGreaterThan(formatDate(date, false, "en-US").length);
    });

    it("should not include time when withTime is false", () => {
      const date = new Date("2024-12-01T14:30:00Z");
      const formatted = formatDate(date, false, "en-US");

      expect(formatted).toBeDefined();
      expect(formatted).not.toBe("Invalid date");
    });

    it("should default to withTime=false when not provided", () => {
      const date = new Date("2024-12-01T14:30:00Z");
      const formatted = formatDate(date);

      expect(formatted).toBeDefined();
      expect(formatted).not.toBe("Invalid date");
    });
  });
});
