import { format } from 'date-fns'

// ============================================
// DATE FORMAT CONSTANTS
// ============================================

/**
 * Standardized date format strings for consistent formatting across the app.
 * Use these with date-fns format() function.
 */
export const DATE_FORMATS = {
  /** "Jan 15, 2026" - Full date with year */
  FULL: 'MMM d, yyyy',
  /** "January 15, 2026" - Full date with long month */
  FULL_LONG: 'MMMM d, yyyy',
  /** "Jan 15" - Short date without year */
  SHORT: 'MMM d',
  /** "Mon, Jan 15" - Weekday with short date */
  WEEKDAY_SHORT: 'EEE, MMM d',
  /** "Monday, January 15, 2026" - Full weekday with full date */
  WEEKDAY_FULL: 'EEEE, MMMM d, yyyy',
  /** "3:30 PM" - 12-hour time format */
  TIME_12H: 'h:mm a',
  /** "15:30" - 24-hour time format */
  TIME_24H: 'HH:mm',
  /** "Jan 15, 2026 at 3:30 PM" - Date with time */
  DATE_TIME: "MMM d, yyyy 'at' h:mm a",
  /** "2026-01-15" - ISO date format */
  ISO_DATE: 'yyyy-MM-dd',
  /** "Monday" - Full weekday name */
  WEEKDAY_NAME: 'EEEE',
  /** "Mon" - Short weekday name */
  WEEKDAY_NAME_SHORT: 'EEE',
} as const

export type DateFormatKey = keyof typeof DATE_FORMATS

// ============================================
// DATE FORMATTING UTILITIES
// ============================================

/**
 * Formats a date string using predefined format constants.
 *
 * @param dateInput - Date string, Date object, or timestamp
 * @param formatKey - Key from DATE_FORMATS or custom format string
 * @returns Formatted date string
 *
 * @example
 * formatDate('2026-01-15', 'FULL') // "Jan 15, 2026"
 * formatDate(new Date(), 'TIME_12H') // "3:30 PM"
 * formatDate('2026-01-15T15:30:00', 'DATE_TIME') // "Jan 15, 2026 at 3:30 PM"
 */
export function formatDate(dateInput: string | Date | number, formatKey: DateFormatKey | string): string {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput
  const formatString = DATE_FORMATS[formatKey as DateFormatKey] || formatKey
  return format(date, formatString)
}

/**
 * Formats a date for blog posts and articles.
 * Uses long month format: "January 15, 2026"
 *
 * @param dateString - ISO date string
 * @returns Formatted date string
 *
 * @example
 * formatBlogDate('2026-01-15') // "January 15, 2026"
 */
export function formatBlogDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formats a time range between two dates.
 *
 * @param startTime - Start time string or Date
 * @param endTime - End time string or Date
 * @returns Formatted time range (e.g., "3:30 PM - 4:30 PM")
 *
 * @example
 * formatTimeRange('2026-01-15T15:30:00', '2026-01-15T16:30:00') // "3:30 PM - 4:30 PM"
 */
export function formatTimeRange(startTime: string | Date, endTime: string | Date): string {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime
  return `${format(start, DATE_FORMATS.TIME_12H)} - ${format(end, DATE_FORMATS.TIME_12H)}`
}

// ============================================
// DURATION FORMATTING UTILITIES
// ============================================

/**
 * Formats a duration in minutes to a human-readable string.
 *
 * @param minutes - Duration in minutes
 * @param options - Formatting options
 * @returns Formatted duration string
 *
 * @example
 * formatDuration(45) // "45m"
 * formatDuration(90) // "1h 30m"
 * formatDuration(120) // "2h"
 * formatDuration(90, { style: 'long' }) // "1 hour 30 minutes"
 */
export function formatDuration(
  minutes: number,
  options: { style?: 'short' | 'long' } = {}
): string {
  const { style = 'short' } = options

  if (minutes < 60) {
    const roundedMinutes = Math.round(minutes)
    return style === 'long' ? `${roundedMinutes} minute${roundedMinutes !== 1 ? 's' : ''}` : `${roundedMinutes}m`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)

  if (style === 'long') {
    const hourPart = `${hours} hour${hours !== 1 ? 's' : ''}`
    const minutePart = remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''
    return `${hourPart}${minutePart}`
  }

  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Formats a duration in milliseconds to a human-readable string.
 *
 * @param durationMs - Duration in milliseconds
 * @param options - Formatting options
 * @returns Formatted duration string
 *
 * @example
 * formatDurationMs(5400000) // "1h 30m"
 * formatDurationMs(1800000) // "30m"
 */
export function formatDurationMs(
  durationMs: number,
  options: { style?: 'short' | 'long' } = {}
): string {
  const minutes = durationMs / (1000 * 60)
  return formatDuration(minutes, options)
}

/**
 * Formats hours with a specified number of decimal places.
 *
 * @param hours - Number of hours
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted hours string (e.g., "2.5h")
 *
 * @example
 * formatHours(2.567) // "2.6h"
 * formatHours(2.567, 2) // "2.57h"
 * formatHours(3) // "3.0h"
 */
export function formatHours(hours: number, decimals: number = 1): string {
  return `${hours.toFixed(decimals)}h`
}

/**
 * Formats minutes as hours with decimal places.
 *
 * @param minutes - Number of minutes
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted hours string (e.g., "2.5h")
 *
 * @example
 * formatMinutesAsHours(150) // "2.5h"
 * formatMinutesAsHours(45) // "0.8h"
 */
export function formatMinutesAsHours(minutes: number, decimals: number = 1): string {
  return formatHours(minutes / 60, decimals)
}

// ============================================
// NUMBER FORMATTING UTILITIES
// ============================================

/**
 * Formats a number with locale-aware thousand separators.
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (optional)
 * @returns Formatted string with commas as thousand separators
 *
 * @example
 * formatNumber(1234) // "1,234"
 * formatNumber(1234.567, 2) // "1,234.57"
 */
export function formatNumber(value: number, decimals?: number): string {
  if (decimals !== undefined) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }
  return value.toLocaleString('en-US')
}

/**
 * Rounds a number to the specified decimal places.
 *
 * @param value - Number to round
 * @param decimals - Number of decimal places (default: 1)
 * @returns Rounded number
 *
 * @example
 * roundToDecimals(2.567) // 2.6
 * roundToDecimals(2.567, 2) // 2.57
 * roundToDecimals(2.5, 0) // 3
 */
export function roundToDecimals(value: number, decimals: number = 1): number {
  const multiplier = Math.pow(10, decimals)
  return Math.round(value * multiplier) / multiplier
}

// ============================================
// PERCENTAGE FORMATTING UTILITIES
// ============================================

/**
 * Calculates and formats a percentage.
 *
 * @param value - The value to calculate percentage for
 * @param total - The total to calculate against
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string (e.g., "75%")
 *
 * @example
 * formatPercentage(3, 4) // "75%"
 * formatPercentage(1, 3, 1) // "33.3%"
 */
export function formatPercentage(value: number, total: number, decimals: number = 0): string {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Calculates percentage as a number (not string).
 *
 * @param value - The value to calculate percentage for
 * @param total - The total to calculate against
 * @param decimals - Number of decimal places (default: 0)
 * @returns Percentage as a number
 *
 * @example
 * calculatePercentage(3, 4) // 75
 * calculatePercentage(1, 3, 1) // 33.3
 */
export function calculatePercentage(value: number, total: number, decimals: number = 0): number {
  if (total === 0) return 0
  return Number(((value / total) * 100).toFixed(decimals))
}

// ============================================
// CURRENCY FORMATTING UTILITIES
// ============================================

export interface CurrencyFormatOptions {
  /** Currency code (default: 'USD') */
  currency?: string
  /** Minimum fraction digits (default: 2) */
  minimumFractionDigits?: number
  /** Maximum fraction digits (default: 2) */
  maximumFractionDigits?: number
  /** Whether the input is in cents (default: true for formatCurrency) */
  fromCents?: boolean
}

/**
 * Formats a monetary value in cents to a currency string.
 *
 * @param cents - Amount in cents (e.g., 1999 for $19.99)
 * @param options - Formatting options
 * @returns Formatted currency string (e.g., "$19.99")
 *
 * @example
 * formatCurrency(1999) // "$19.99"
 * formatCurrency(1999, { currency: 'EUR' }) // "€19.99"
 * formatCurrency(1000, { minimumFractionDigits: 0 }) // "$10"
 */
export function formatCurrency(cents: number, options: CurrencyFormatOptions = {}): string {
  const {
    currency = 'USD',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(cents / 100)
}

/**
 * Formats a monetary value (already in dollars/euros) to a currency string.
 *
 * @param amount - Amount in main currency unit (e.g., 19.99 for $19.99)
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * formatMoney(19.99) // "$19.99"
 * formatMoney(19.99, { currency: 'EUR' }) // "€19.99"
 */
export function formatMoney(amount: number, options: CurrencyFormatOptions = {}): string {
  const {
    currency = 'USD',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

// ============================================
// UTILITY HELPERS
// ============================================

/**
 * Joins non-empty string values with a separator.
 *
 * @param values - Array of string values (can include empty strings or undefined)
 * @param separator - Separator to join with (default: ' ')
 * @returns Joined string of non-empty values
 *
 * @example
 * joinNonEmpty(['Hello', '', 'World', undefined]) // "Hello World"
 * joinNonEmpty(['a', 'b', 'c'], ', ') // "a, b, c"
 */
export function joinNonEmpty(values: (string | undefined | null)[], separator: string = ' '): string {
  return values.filter(Boolean).join(separator)
}
