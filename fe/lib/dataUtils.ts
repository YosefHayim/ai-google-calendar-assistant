/**
 * Sums values of a specific property in an array of objects
 * @param data - Array of objects
 * @param key - Property key to sum
 * @returns The sum of all values for the specified key
 */
export const sumBy = <T extends Record<string, any>>(
  data: T[],
  key: keyof T
): number => {
  return data.reduce((acc, item) => acc + (Number(item[key]) || 0), 0)
}

/**
 * Calculates percentage of a value against a total
 * @param value - The value to calculate percentage for
 * @param total - The total to calculate against
 * @param decimals - Number of decimal places (default 0)
 * @returns The percentage as a number
 */
export const calculatePercentage = (
  value: number,
  total: number,
  decimals: number = 0
): number => {
  if (total === 0) return 0
  return Number(((value / total) * 100).toFixed(decimals))
}

/**
 * Joins non-empty string values with a separator
 * @param values - Array of string values (can include empty strings or undefined)
 * @param separator - Separator to join with (default ' ')
 * @returns Joined string of non-empty values
 */
export const joinNonEmpty = (
  values: (string | undefined | null)[],
  separator: string = ' '
): string => {
  return values.filter(Boolean).join(separator)
}
