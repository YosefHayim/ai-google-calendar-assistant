/**
 * Global constants for the application
 */

// Time constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

// React Query configuration
export const QUERY_CONFIG = {
  /** Default stale time for queries (1 minute) */
  DEFAULT_STALE_TIME: TIME.MINUTE,
  /** Stale time for calendar data (5 minutes) */
  CALENDARS_STALE_TIME: 5 * TIME.MINUTE,
} as const;
