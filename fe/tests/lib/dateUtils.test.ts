import { describe, expect, it, beforeEach, afterEach, mock } from "bun:test";
import { formatRelativeDate, getDaysBetween, generateDateRange } from "../../lib/dateUtils";

describe("dateUtils", () => {
  // Store original Date for restoration
  const RealDate = Date;

  describe("formatRelativeDate", () => {
    it("should format today's date with time", () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      const result = formatRelativeDate(now.toISOString());

      expect(result).toContain("Today");
      expect(result).toContain(`${hours}:${minutes}`);
    });

    it("should format yesterday as 'Yesterday'", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const result = formatRelativeDate(yesterday.toISOString());

      expect(result).toBe("Yesterday");
    });

    it("should format dates within the week with day name", () => {
      // Get a date that's 2-3 days ago but still within this week
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Only test if it's still within this week
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek >= 3) { // If it's Wednesday or later
        const result = formatRelativeDate(threeDaysAgo.toISOString());

        // Should be formatted as "EEE, MMM d" (e.g., "Mon, Jan 6")
        expect(result).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), [A-Z][a-z]{2} \d{1,2}$/);
      }
    });

    it("should format older dates with full date", () => {
      const oldDate = new Date("2023-05-15");

      const result = formatRelativeDate(oldDate.toISOString());

      expect(result).toBe("May 15, 2023");
    });

    it("should handle ISO date strings correctly", () => {
      const isoDate = "2023-12-25T10:30:00.000Z";

      const result = formatRelativeDate(isoDate);

      expect(result).toBe("Dec 25, 2023");
    });
  });

  describe("getDaysBetween", () => {
    it("should return 0 for same day", () => {
      const date = new Date("2024-01-15");

      const result = getDaysBetween(date, date);

      expect(result).toBe(0);
    });

    it("should return positive number for future dates", () => {
      const from = new Date("2024-01-01");
      const to = new Date("2024-01-10");

      const result = getDaysBetween(from, to);

      expect(result).toBe(9);
    });

    it("should return negative number for past dates", () => {
      const from = new Date("2024-01-10");
      const to = new Date("2024-01-01");

      const result = getDaysBetween(from, to);

      expect(result).toBe(-9);
    });

    it("should handle dates across months", () => {
      const from = new Date("2024-01-30");
      const to = new Date("2024-02-05");

      const result = getDaysBetween(from, to);

      expect(result).toBe(6);
    });

    it("should handle dates across years", () => {
      const from = new Date("2023-12-30");
      const to = new Date("2024-01-05");

      const result = getDaysBetween(from, to);

      expect(result).toBe(6);
    });

    it("should handle leap year dates", () => {
      const from = new Date("2024-02-28");
      const to = new Date("2024-03-01");

      const result = getDaysBetween(from, to);

      expect(result).toBe(2); // 2024 is a leap year, so Feb has 29 days
    });
  });

  describe("generateDateRange", () => {
    it("should generate array of dates with default length", () => {
      const result = generateDateRange();

      expect(result).toHaveLength(365);
    });

    it("should generate array of specified length", () => {
      const result = generateDateRange(7);

      expect(result).toHaveLength(7);
    });

    it("should generate dates from oldest to newest", () => {
      const result = generateDateRange(3);

      // First date should be oldest
      expect(result[0].getTime()).toBeLessThan(result[1].getTime());
      expect(result[1].getTime()).toBeLessThan(result[2].getTime());
    });

    it("should end with today's date", () => {
      const result = generateDateRange(5);
      const today = new Date();
      const lastDate = result[result.length - 1];

      expect(lastDate.getDate()).toBe(today.getDate());
      expect(lastDate.getMonth()).toBe(today.getMonth());
      expect(lastDate.getFullYear()).toBe(today.getFullYear());
    });

    it("should generate all Date objects", () => {
      const result = generateDateRange(10);

      result.forEach(date => {
        expect(date).toBeInstanceOf(Date);
        expect(isNaN(date.getTime())).toBe(false);
      });
    });

    it("should handle single day range", () => {
      const result = generateDateRange(1);

      expect(result).toHaveLength(1);
      const today = new Date();
      expect(result[0].getDate()).toBe(today.getDate());
    });

    it("should handle large range", () => {
      const result = generateDateRange(730); // 2 years

      expect(result).toHaveLength(730);
    });
  });
});
