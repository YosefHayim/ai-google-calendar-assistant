import { isToday as dateFnsIsToday, parseISO, startOfDay } from "date-fns";

/**
 * @description Returns a new Date object set to the start of the day (00:00:00.000) for the given date.
 * If no date is provided, uses the current date.
 * @param {Date} [date=new Date()] - The date to get the start of day for. Defaults to current date.
 * @returns {Date} A new Date object representing the start of the given day (midnight).
 * @example
 * // Get start of today
 * const todayStart = getStartOfDay()
 * // Returns: 2026-01-12T00:00:00.000Z (midnight of current day)
 *
 * @example
 * // Get start of a specific date
 * const specificDate = new Date('2026-03-15T14:30:00')
 * const dayStart = getStartOfDay(specificDate)
 * // Returns: 2026-03-15T00:00:00.000Z
 */
export const getStartOfDay = (date: Date = new Date()): Date =>
  startOfDay(date);

/**
 * @description Checks if the given ISO date string represents today's date.
 * Parses the ISO string and compares it against the current date.
 * @param {string} dateString - An ISO 8601 formatted date string to check.
 * @returns {boolean} True if the date string represents today, false otherwise.
 * @example
 * // Check if an ISO date string is today
 * const result = isToday('2026-01-12T10:30:00Z')
 * // Returns: true (if today is 2026-01-12)
 *
 * @example
 * // Check a past date
 * const result = isToday('2025-12-25T00:00:00Z')
 * // Returns: false
 */
export const isToday = (dateString: string): boolean =>
  dateFnsIsToday(parseISO(dateString));
