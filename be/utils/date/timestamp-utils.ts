/**
 * Timestamp conversion utilities for OAuth token expiry, database timestamps, and API responses.
 * @module utils/date/timestamp-utils
 */

/**
 * Convert ISO 8601 timestamp to milliseconds. Part of: OAuth token flow, DB timestamp conversions.
 */
export const isoToMs = (isoString: string | null | undefined): number | null => {
  if (!isoString) {
    return null
  }
  return new Date(isoString).getTime()
}

/**
 * Convert milliseconds to ISO 8601 timestamp. Part of: OAuth token persistence, DB writes.
 */
export const msToIso = (ms: number): string => new Date(ms).toISOString()

/**
 * Get current timestamp as ISO 8601 string. Convenience for DB writes.
 */
export const nowIso = (): string => new Date().toISOString()

/**
 * Get current timestamp in milliseconds. Convenience for token expiry calculations.
 */
export const nowMs = (): number => Date.now()
