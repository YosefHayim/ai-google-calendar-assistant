import { describe, expect, it } from "@jest/globals";

import formatDate from "@/lib/date/format-date";

describe("formatDate", () => {
  describe("with valid inputs", () => {
    it("should format a valid Date object without time", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const result = formatDate(date, false, "en-US");
      expect(result).toContain("2024");
      expect(result).toContain("January");
      expect(result).toContain("15");
    });

    it("should format a valid Date object with time", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const result = formatDate(date, true, "en-US");
      expect(result).toContain("2024");
      expect(result).toContain("January");
      expect(result).toContain("15");
      expect(result).toMatch(/\d{1,2}:\d{2}/); // Contains time
    });

    it("should format a valid date string without time", () => {
      const dateStr = "2024-01-15T10:30:00Z";
      const result = formatDate(dateStr, false, "en-US");
      expect(result).toContain("2024");
      expect(result).toContain("January");
    });

    it("should format a valid date string with time", () => {
      const dateStr = "2024-01-15T10:30:00Z";
      const result = formatDate(dateStr, true, "en-US");
      expect(result).toContain("2024");
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });

    it("should use Hebrew locale by default", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const result = formatDate(date);
      // Hebrew locale should be applied (default is "he-IL")
      expect(result).toBeTruthy();
      expect(result).not.toBe("Invalid date");
    });

    it("should use specified locale", () => {
      const date = new Date("2024-01-15T10:30:00Z");
      const resultEN = formatDate(date, false, "en-US");
      const resultHE = formatDate(date, false, "he-IL");
      // Different locales produce different formats
      expect(resultEN).toBeTruthy();
      expect(resultHE).toBeTruthy();
    });
  });

  describe("with invalid inputs", () => {
    it("should return 'Invalid date' for null", () => {
      const result = formatDate(null);
      expect(result).toBe("Invalid date");
    });

    it("should return 'Invalid date' for undefined", () => {
      const result = formatDate(undefined);
      expect(result).toBe("Invalid date");
    });

    it("should return 'Invalid date' for invalid date string", () => {
      const result = formatDate("not a date");
      expect(result).toBe("Invalid date");
    });

    it("should return 'Invalid date' for invalid Date object", () => {
      const result = formatDate(new Date("invalid"));
      expect(result).toBe("Invalid date");
    });

    it("should return 'Invalid date' for empty string", () => {
      const result = formatDate("");
      expect(result).toBe("Invalid date");
    });
  });

  describe("edge cases", () => {
    it("should handle leap year dates", () => {
      const leapDate = new Date("2024-02-29T12:00:00Z");
      const result = formatDate(leapDate, false, "en-US");
      expect(result).toContain("February");
      expect(result).toContain("29");
    });

    it("should handle year boundaries", () => {
      const newYear = new Date("2024-01-01T00:00:00Z");
      const result = formatDate(newYear, true, "en-US");
      expect(result).toContain("2024");
      expect(result).toContain("January");
    });

    it("should handle different time zones", () => {
      const date = new Date("2024-06-15T23:30:00+05:00");
      const result = formatDate(date, true, "en-US");
      expect(result).toBeTruthy();
      expect(result).not.toBe("Invalid date");
    });
  });
});
