/**
 * Tests for natural language date parsing
 */

import { describe, it, expect } from "@jest/globals";
import { parseNaturalLanguageDate, extractDateRangeFromQuery } from "@/utils/parseNaturalLanguageDate";

describe("parseNaturalLanguageDate", () => {
  // Use a fixed date in local timezone to avoid timezone issues
  const referenceDate = new Date(2025, 0, 23, 12, 0, 0); // January 23, 2025, 12:00 PM local time

  describe("Basic date expressions", () => {
    it("should parse 'today'", () => {
      const result = parseNaturalLanguageDate("today", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        // Check that start and end are on the same day
        expect(result.start.getFullYear()).toBe(2025);
        expect(result.start.getMonth()).toBe(0); // January
        expect(result.start.getDate()).toBe(23);
        expect(result.end.getFullYear()).toBe(2025);
        expect(result.end.getMonth()).toBe(0);
        expect(result.end.getDate()).toBe(23);
      }
    });

    it("should parse 'yesterday'", () => {
      const result = parseNaturalLanguageDate("yesterday", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        // Check that it's the day before reference date
        expect(result.start.getFullYear()).toBe(2025);
        expect(result.start.getMonth()).toBe(0); // January
        expect(result.start.getDate()).toBe(22);
        expect(result.end.getDate()).toBe(22);
      }
    });

    it("should parse 'this week'", () => {
      const result = parseNaturalLanguageDate("this week", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        const daysDiff = Math.ceil((result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysDiff).toBeGreaterThanOrEqual(6); // Monday to Sunday = 6 or 7 days depending on calculation
        expect(daysDiff).toBeLessThanOrEqual(7);
      }
    });

    it("should parse 'last week'", () => {
      const result = parseNaturalLanguageDate("last week", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.end.getTime()).toBeLessThan(referenceDate.getTime());
      }
    });

    it("should parse 'next week'", () => {
      const result = parseNaturalLanguageDate("next week", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.start.getTime()).toBeGreaterThan(referenceDate.getTime());
      }
    });

    it("should parse 'this month'", () => {
      const result = parseNaturalLanguageDate("this month", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.start.getMonth()).toBe(0); // January
        expect(result.start.getDate()).toBe(1);
      }
    });

    it("should parse 'last month'", () => {
      const result = parseNaturalLanguageDate("last month", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.start.getMonth()).toBe(11); // December (month before January)
      }
    });

    it("should parse 'next month'", () => {
      const result = parseNaturalLanguageDate("next month", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.start.getMonth()).toBe(1); // February
      }
    });
  });

  describe("Numeric date expressions", () => {
    it("should parse 'last 7 days'", () => {
      const result = parseNaturalLanguageDate("last 7 days", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        const daysDiff = Math.ceil((result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysDiff).toBe(7);
      }
    });

    it("should parse 'last 30 days'", () => {
      const result = parseNaturalLanguageDate("last 30 days", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        const daysDiff = Math.ceil((result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysDiff).toBe(30);
      }
    });

    it("should parse 'last 2 weeks'", () => {
      const result = parseNaturalLanguageDate("last 2 weeks", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        const daysDiff = Math.ceil((result.end.getTime() - result.start.getTime()) / (1000 * 60 * 60 * 24));
        expect(daysDiff).toBe(14);
      }
    });

    it("should parse 'last 3 months'", () => {
      const result = parseNaturalLanguageDate("last 3 months", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.start.getTime()).toBeLessThan(referenceDate.getTime());
      }
    });
  });

  describe("ISO date strings", () => {
    it("should parse ISO date string", () => {
      const result = parseNaturalLanguageDate("2025-01-15", referenceDate);
      expect(result).not.toBeNull();
      if (result) {
        // Check date components (timezone-independent)
        expect(result.start.getFullYear()).toBe(2025);
        expect(result.start.getMonth()).toBe(0); // January
        expect(result.start.getDate()).toBe(15);
        expect(result.end.getDate()).toBe(15);
      }
    });
  });

  describe("Invalid expressions", () => {
    it("should return null for invalid expressions", () => {
      expect(parseNaturalLanguageDate("invalid expression", referenceDate)).toBeNull();
      expect(parseNaturalLanguageDate("", referenceDate)).toBeNull();
      expect(parseNaturalLanguageDate("random text", referenceDate)).toBeNull();
    });
  });
});

describe("extractDateRangeFromQuery", () => {
  // Use a fixed date in local timezone to avoid timezone issues
  const referenceDate = new Date(2025, 0, 23, 12, 0, 0); // January 23, 2025, 12:00 PM local time

  it("should extract 'this week' from query", () => {
    const result = extractDateRangeFromQuery("Show me statistics for this week", referenceDate);
    expect(result).not.toBeNull();
  });

  it("should extract 'last month' from query", () => {
    const result = extractDateRangeFromQuery("Get stats for last month", referenceDate);
    expect(result).not.toBeNull();
  });

  it("should extract 'from X to Y' pattern", () => {
    const result = extractDateRangeFromQuery("from 2025-01-01 to 2025-01-31", referenceDate);
    expect(result).not.toBeNull();
    if (result) {
      // Check date components (timezone-independent)
      expect(result.start.getFullYear()).toBe(2025);
      expect(result.start.getMonth()).toBe(0); // January
      expect(result.start.getDate()).toBe(1);
      expect(result.end.getDate()).toBe(31);
    }
  });

  it("should return null for queries without dates", () => {
    expect(extractDateRangeFromQuery("Show me statistics", referenceDate)).toBeNull();
    expect(extractDateRangeFromQuery("", referenceDate)).toBeNull();
  });
});

