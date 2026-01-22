import { isValid, parseISO } from "date-fns"
import { logger } from "@/lib/logger"

/**
 * @description Formats a date into a human-readable localized string.
 * Handles Date objects, ISO strings, and other string date formats.
 * Returns a formatted string with weekday, day, month, and year.
 * Optionally includes time (hour and minute) when specified.
 * @param {Date | string | null | undefined} date - The date to format. Can be a Date object,
 *   an ISO 8601 string, or other parseable date string. Returns "Invalid date" if null/undefined.
 * @param {boolean} [withTime=false] - Whether to include time (hour and minute) in the output.
 * @param {string} [desiredLanguage] - The locale to use for formatting (BCP 47 language tag).
 *   If not provided, defaults to the user's language preference.
 * @returns {string} A localized date string, or "Invalid date" if the input cannot be parsed.
 * @example
 * // Format a Date object in Hebrew (default)
 * formatDate(new Date('2026-01-12'))
 * // Returns: "יום שני, 12 בינואר 2026"
 *
 * @example
 * // Format an ISO string with time
 * formatDate('2026-01-12T14:30:00Z', true)
 * // Returns: "יום שני, 12 בינואר 2026 בשעה 14:30"
 *
 * @example
 * // Format in English (US)
 * formatDate('2026-01-12', false, 'en-US')
 * // Returns: "Monday, January 12, 2026"
 *
 * @example
 * // Handle invalid input
 * formatDate(null)
 * // Returns: "Invalid date"
 */
const formatDate = (
  date: Date | string | null | undefined,
  withTime = false,
  desiredLanguage?: string
): string => {
  if (!date) {
    logger.error("Date: formatDate called: date not found")
    return "Invalid date"
  }

  let parsed: Date
  if (typeof date === "string") {
    parsed = parseISO(date)
    if (!isValid(parsed)) {
      parsed = new Date(date)
    }
  } else if (date instanceof Date) {
    parsed = date
  } else {
    logger.error("Date: formatDate called: invalid date")
    return "Invalid date"
  }

  if (!isValid(parsed)) {
    logger.error("Date: formatDate called: invalid date")
    return "Invalid date"
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  if (withTime) {
    options.hour = "numeric"
    options.minute = "numeric"
  }

  return parsed.toLocaleDateString(desiredLanguage, options)
}

export default formatDate
