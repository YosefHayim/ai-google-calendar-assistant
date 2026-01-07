/**
 * Date comparison utilities. Part of: Conversation history management (telegram, web).
 */

/**
 * Get start of day (midnight) for a given date. Part of: Daily conversation reset flow.
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

/**
 * Check if a date string represents today. Part of: Conversation history daily reset.
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString)
  const today = getStartOfDay()
  const dateStart = getStartOfDay(date)
  return dateStart.getTime() === today.getTime()
}
