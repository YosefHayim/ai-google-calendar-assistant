import {
  differenceInCalendarDays,
  format,
  isThisWeek,
  isToday,
  isYesterday,
  subDays,
} from 'date-fns'

/**
 * Formats a date string to a relative date format
 * - Today: "Today, HH:MM"
 * - Yesterday: "Yesterday"
 * - Within a week: "Mon, Jan 3"
 * - Older: "Jan 3, 2026"
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString)

  if (isToday(date)) {
    return `Today, ${format(date, 'HH:mm')}`
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  if (isThisWeek(date)) {
    return format(date, 'EEE, MMM d')
  }

  return format(date, 'MMM d, yyyy')
}

/**
 * Calculates the number of days between two dates
 */
export const getDaysBetween = (from: Date, to: Date): number => {
  return differenceInCalendarDays(to, from)
}

/**
 * Generates an array of dates for the past N days
 * @param days - Number of days to generate (default 365)
 * @returns Array of Date objects from oldest to newest
 */
export const generateDateRange = (days: number = 365): Date[] => {
  const today = new Date()
  return Array.from({ length: days }, (_, i) => subDays(today, days - 1 - i))
}
