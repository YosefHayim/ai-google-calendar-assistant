import { formatISO, parseISO } from "date-fns";

/**
 * @description Converts an ISO 8601 date string to Unix timestamp in milliseconds.
 * Returns null if the input is null, undefined, or empty.
 * @param {string | null | undefined} isoString - An ISO 8601 formatted date string to convert.
 * @returns {number | null} The Unix timestamp in milliseconds, or null if input is falsy.
 * @example
 * // Convert an ISO string to milliseconds
 * const ms = isoToMs('2026-01-12T14:30:00Z')
 * // Returns: 1768245000000
 *
 * @example
 * // Handle null input
 * const result = isoToMs(null)
 * // Returns: null
 */
export const isoToMs = (
  isoString: string | null | undefined
): number | null => {
  if (!isoString) {
    return null;
  }
  return parseISO(isoString).getTime();
};

/**
 * @description Converts a Unix timestamp in milliseconds to an ISO 8601 formatted string.
 * @param {number} ms - The Unix timestamp in milliseconds to convert.
 * @returns {string} An ISO 8601 formatted date string.
 * @example
 * // Convert milliseconds to ISO string
 * const iso = msToIso(1768245000000)
 * // Returns: "2026-01-12T14:30:00+00:00"
 */
export const msToIso = (ms: number): string => formatISO(new Date(ms));

/**
 * @description Returns the current date and time as an ISO 8601 formatted string.
 * @returns {string} The current timestamp as an ISO 8601 string.
 * @example
 * // Get current time as ISO string
 * const currentIso = nowIso()
 * // Returns: "2026-01-12T10:15:30+00:00" (example output)
 */
export const nowIso = (): string => formatISO(new Date());

/**
 * @description Returns the current Unix timestamp in milliseconds.
 * Equivalent to Date.now().
 * @returns {number} The current Unix timestamp in milliseconds.
 * @example
 * // Get current time in milliseconds
 * const currentMs = nowMs()
 * // Returns: 1736676930000 (example output)
 */
export const nowMs = (): number => Date.now();
