const MS_IN_SEC = 1000;
const SECS_IN_MIN = 60;

/**
 * @description Calculates and formats the duration between two ISO 8601 timestamps into a human-readable string.
 * Returns the duration in the most appropriate unit (seconds, minutes, hours, or hours and minutes).
 * @param {string | null | undefined} startISO - The start time in ISO 8601 format.
 * @param {string | null | undefined} endISO - The end time in ISO 8601 format.
 * @returns {string | null} A formatted duration string (e.g., "30s", "45m", "2h", "1h 30m") or null if inputs are invalid.
 * @example
 * getEventDurationString("2025-01-15T10:00:00Z", "2025-01-15T10:30:00Z"); // Returns "30m"
 * getEventDurationString("2025-01-15T10:00:00Z", "2025-01-15T12:30:00Z"); // Returns "2h 30m"
 * getEventDurationString("2025-01-15T10:00:00Z", "2025-01-15T10:00:45Z"); // Returns "45s"
 * getEventDurationString(null, "2025-01-15T10:00:00Z"); // Returns null
 */
export function getEventDurationString(startISO?: string | null, endISO?: string | null): string | null {
  if (!(startISO && endISO)) {
    return null;
  }

  const start = new Date(startISO);
  const end = new Date(endISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return null;
  }

  const diffMs = end.getTime() - start.getTime();

  // Round to nearest second
  const totalSeconds = Math.round(diffMs / MS_IN_SEC);

  // Sub-minute durations (<60s) → show seconds
  if (totalSeconds < SECS_IN_MIN) {
    return `${totalSeconds}s`;
  }

  // Round to nearest minute
  const totalMinutes = Math.round(totalSeconds / SECS_IN_MIN);

  if (totalMinutes < SECS_IN_MIN) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / SECS_IN_MIN);
  const minutes = totalMinutes % SECS_IN_MIN;

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}
