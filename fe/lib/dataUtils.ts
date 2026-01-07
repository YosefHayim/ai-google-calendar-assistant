/**
 * Sums values of a specific property in an array of objects
 * @param data - Array of objects
 * @param key - Property key to sum
 * @returns The sum of all values for the specified key
 */
export const sumBy = <T extends Record<string, any>>(data: T[], key: keyof T): number => {
  return data.reduce((acc, item) => acc + (Number(item[key]) || 0), 0)
}

/**
 * Calculates percentage of a value against a total
 * @param value - The value to calculate percentage for
 * @param total - The total to calculate against
 * @param decimals - Number of decimal places (default 0)
 * @returns The percentage as a number
 */
export const calculatePercentage = (value: number, total: number, decimals: number = 0): number => {
  if (total === 0) return 0
  return Number(((value / total) * 100).toFixed(decimals))
}

/**
 * Joins non-empty string values with a separator
 * @param values - Array of string values (can include empty strings or undefined)
 * @param separator - Separator to join with (default ' ')
 * @returns Joined string of non-empty values
 */
export const joinNonEmpty = (values: (string | undefined | null)[], separator: string = ' '): string => {
  return values.filter(Boolean).join(separator)
}

/**
 * Calculates the average of values in an array
 * @param values - Array of numbers
 * @returns The average value, or 0 if array is empty
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0
  return values.reduce((acc, val) => acc + val, 0) / values.length
}

/**
 * Calculates the maximum value in an array
 * @param values - Array of numbers
 * @param defaultValue - Default value if array is empty (default 1)
 * @returns The maximum value or defaultValue
 */
export const calculateMax = (values: number[], defaultValue: number = 1): number => {
  if (values.length === 0) return defaultValue
  return values.reduce((max, val) => (val > max ? val : max), values[0])
}

/**
 * Calculates available hours left after subtracting used hours from total available
 * @param usedHours - Hours already used
 * @param totalAvailableHours - Total available hours (default 17 for 24h - 7h sleep)
 * @returns Available hours remaining (minimum 0)
 */
export const calculateAvailableHoursLeft = (usedHours: number, totalAvailableHours: number = 17): number => {
  return Math.max(0, totalAvailableHours - usedHours)
}

/**
 * Formats a number with locale-aware thousand separators
 * @param value - The number to format
 * @param decimals - Number of decimal places (optional, preserves original if not specified)
 * @returns Formatted string with commas as thousand separators
 * @example
 * formatNumber(1234) // "1,234"
 * formatNumber(1234.5) // "1,234.5"
 * formatNumber(1234.567, 1) // "1,234.6"
 */
export const formatNumber = (value: number, decimals?: number): string => {
  if (decimals !== undefined) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }
  return value.toLocaleString('en-US')
}
