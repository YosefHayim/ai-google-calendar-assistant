/**
 * @description Timezone-aware date and time formatting utilities for consistent formatting across the application.
 * These utilities handle timezone-specific formatting that the standard formatDate doesn't support.
 */

/**
 * @description Formats a date in a specific timezone with full date information (weekday, month, day, year).
 * @param {Date} date - The date to format
 * @param {string} timezone - The IANA timezone identifier (e.g., "America/New_York")
 * @param {string} [locale="en-US"] - The locale for formatting
 * @returns {string} Formatted date string (e.g., "Monday, January 15, 2026")
 * @example
 * formatDateInTimezone(new Date(), "America/New_York")
 * // Returns: "Monday, January 15, 2026"
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  locale = "en-US"
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatter.format(date);
}

/**
 * @description Formats a time in a specific timezone with hour and minute in 12-hour format.
 * @param {Date} date - The date/time to format
 * @param {string} timezone - The IANA timezone identifier (e.g., "America/New_York")
 * @param {string} [locale="en-US"] - The locale for formatting
 * @returns {string} Formatted time string (e.g., "02:30 PM")
 * @example
 * formatTimeInTimezone(new Date(), "America/New_York")
 * // Returns: "02:30 PM"
 */
export function formatTimeInTimezone(
  date: Date,
  timezone: string,
  locale = "en-US"
): string {
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return timeFormatter.format(date);
}

/**
 * @description Extracts the day of the week from a formatted date string.
 * @param {Date} date - The date to extract day from
 * @param {string} timezone - The IANA timezone identifier
 * @param {string} [locale="en-US"] - The locale for formatting
 * @returns {string} The day of the week (e.g., "Monday")
 * @example
 * getDayOfWeekInTimezone(new Date(), "America/New_York")
 * // Returns: "Monday"
 */
export function getDayOfWeekInTimezone(
  date: Date,
  timezone: string,
  locale = "en-US"
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    weekday: "long",
  });
  const parts = formatter.formatToParts(date);
  return parts.find((p) => p.type === "weekday")?.value || "Unknown";
}

/**
 * @description Formats a date in YYYY-MM-DD format for a specific timezone.
 * @param {Date} date - The date to format
 * @param {string} timezone - The IANA timezone identifier
 * @param {string} [locale="en-CA"] - The locale for formatting (en-CA gives YYYY-MM-DD)
 * @returns {string} Formatted date string (e.g., "2026-01-15")
 * @example
 * formatDateISOInTimezone(new Date(), "America/New_York")
 * // Returns: "2026-01-15"
 */
export function formatDateISOInTimezone(
  date: Date,
  timezone: string,
  locale = "en-CA"
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}