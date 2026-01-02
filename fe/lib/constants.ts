/**
 * Global constants for the application
 */

// Environment configuration
export const ENV = {
  API_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const

// Time constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ally_access_token',
  REFRESH_TOKEN: 'ally_refresh_token',
  USER: 'ally_user',
} as const

// React Query configuration
export const QUERY_CONFIG = {
  /** Default stale time for queries (1 minute) */
  DEFAULT_STALE_TIME: TIME.MINUTE,
  /** Stale time for calendar data (5 minutes) */
  CALENDARS_STALE_TIME: 5 * TIME.MINUTE,
  /** Stale time for events (30 seconds - more dynamic) */
  EVENTS_STALE_TIME: 30 * TIME.SECOND,
  /** Stale time for user data (10 minutes - rarely changes) */
  USER_STALE_TIME: 10 * TIME.MINUTE,
  /** Default retry count */
  DEFAULT_RETRY: 3,
  /** Retry delay base (exponential backoff) */
  RETRY_DELAY: TIME.SECOND,
  /** GC time for inactive queries (5 minutes) */
  GC_TIME: 5 * TIME.MINUTE,
} as const
