import {
  isToday as dateFnsIsToday,
  getYear,
  isValid,
  parseISO,
  startOfDay,
} from "date-fns"

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
export const getStartOfDay = (date: Date = new Date()): Date => startOfDay(date)

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
  dateFnsIsToday(parseISO(dateString))

const MIN_VALID_YEAR = 2020
const MAX_VALID_YEAR = 2100

/**
 * @description Validates if a string represents a valid date/time within an acceptable range.
 * Checks for non-empty strings, valid ISO parsing, and reasonable year bounds (2020-2100).
 * @param {string} dt - The date/time string to validate (expected ISO format).
 * @returns {boolean} True if the string is a valid date/time within acceptable bounds, false otherwise.
 * @example
 * // Valid ISO datetime
 * const result = isValidDateTime('2026-01-15T10:30:00Z')
 * // Returns: true
 *
 * @example
 * // Invalid or out-of-range date
 * const result = isValidDateTime('1999-01-01T00:00:00Z')
 * // Returns: false (year too old)
 */
export const isValidDateTime = (dt: string): boolean => {
  if (!dt || dt.trim() === "") {
    return false
  }
  const parsed = parseISO(dt)
  if (!isValid(parsed)) {
    return false
  }
  const year = getYear(parsed)
  return year >= MIN_VALID_YEAR && year <= MAX_VALID_YEAR
}
