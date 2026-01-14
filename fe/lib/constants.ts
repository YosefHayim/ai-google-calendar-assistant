/**
 * Global constants for the application
 */

// Production backend URL (hardcoded)
const PRODUCTION_BACKEND_URL = 'https://i3fzcpnmmk.eu-central-1.awsapprunner.com'
const LOCAL_BACKEND_URL = 'http://localhost:3000'

/**
 * Get the backend API base URL based on current host
 * - localhost/127.0.0.1 -> local backend (localhost:3000)
 * - any other host -> production backend (AWS App Runner)
 */
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return LOCAL_BACKEND_URL
    }
  }
  return PRODUCTION_BACKEND_URL
}

// Environment configuration
export const ENV = {
  get API_BASE_URL() {
    return getApiBaseUrl()
  },
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
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
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

// Calendar and time constants
export const CALENDAR_CONSTANTS = {
  /** Waking hours per day (assuming ~8 hours of sleep) */
  WAKING_HOURS_PER_DAY: 16,
  /** Sleep hours per day */
  SLEEP_HOURS: 7,
  /** Total available hours per day (24 - sleep) */
  TOTAL_AVAILABLE_HOURS: 17,
} as const

// Date formatting constants
export const DATE_CONSTANTS = {
  /** Month labels for calendar displays */
  MONTH_LABELS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  /** Week day labels */
  WEEK_DAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
} as const

// Social & Integration Links
export const SOCIAL_LINKS = {
  TELEGRAM_BOT: 'https://t.me/ai_schedule_event_server_bot',
  DISCORD: 'https://discord.gg/ally',
  WHATSAPP: 'https://wa.me/message/ally',
  EMAIL: 'mailto:hello@askally.io',
} as const

export const ASSETS = {
  S3_BASE_URL: 'https://ally-ai-google-calendar.s3.eu-north-1.amazonaws.com',
} as const
