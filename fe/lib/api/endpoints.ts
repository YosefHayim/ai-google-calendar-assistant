/**
 * API Endpoints Configuration
 *
 * This file contains all backend API endpoint paths.
 * Each endpoint is documented with the HTTP methods it supports.
 */

export const ENDPOINTS = {
  // ============================================
  // USER ENDPOINTS
  // ============================================

  /**
   * User account management
   * Methods: DELETE
   */
  USERS: '/api/users',

  /**
   * Google OAuth callback handler
   * Methods: GET
   */
  USERS_CALLBACK: '/api/users/callback',

  /**
   * Get authenticated user information
   * Methods: GET
   */
  USERS_GET_USER: '/api/users/get-user',

  /**
   * User sign in with email/password
   * Methods: POST
   */
  USERS_SIGNIN: '/api/users/signin',

  /**
   * User registration with email/password
   * Methods: POST
   */
  USERS_SIGNUP: '/api/users/signup',

  /**
   * Initiate Google OAuth sign-up/sign-in flow
   * Methods: GET
   */
  USERS_SIGNUP_GOOGLE: '/api/users/signup/google',

  /**
   * Initiate GitHub OAuth sign-up flow
   * Methods: GET
   */
  USERS_SIGNUP_GITHUB: '/api/users/signup/github',

  /**
   * Verify user email via OTP token
   * Methods: POST
   */
  USERS_VERIFY_OTP: '/api/users/verify-user-by-email-otp',

  // ============================================
  // CALENDAR ENDPOINTS
  // ============================================

  /**
   * Get all calendars for authenticated user
   * Methods: GET
   * Query params: customCalendars=true|false
   */
  CALENDARS: '/api/calendars',

  /**
   * Get calendar by ID
   * Methods: GET
   * @param id - Calendar ID
   */
  CALENDARS_BY_ID: (id: string) => `/api/calendars/${id}`,

  /**
   * Get general calendar settings (timezone)
   * Methods: GET
   */
  CALENDARS_SETTINGS: '/api/calendars/settings',

  /**
   * Get calendar-specific settings by ID
   * Methods: GET
   * @param id - Calendar ID
   */
  CALENDARS_SETTINGS_BY_ID: (id: string) => `/api/calendars/settings/${id}`,

  /**
   * Get available calendar colors
   * Methods: GET
   */
  CALENDARS_COLORS: '/api/calendars/colors',

  /**
   * Get specific color information by ID
   * Methods: GET
   * @param id - Color ID
   */
  CALENDARS_COLORS_BY_ID: (id: string) => `/api/calendars/colors/${id}`,

  /**
   * Get calendar timezone information
   * Methods: GET
   */
  CALENDARS_TIMEZONES: '/api/calendars/timezones',

  /**
   * Get timezone for specific calendar
   * Methods: GET
   * @param id - Calendar ID
   */
  CALENDARS_TIMEZONES_BY_ID: (id: string) => `/api/calendars/timezones/${id}`,

  /**
   * Query free/busy information for next 24 hours
   * Methods: GET
   */
  CALENDARS_FREEBUSY: '/api/calendars/freebusy',

  /**
   * List all calendars on user's calendar list
   * Methods: GET
   * Query params: minAccessRole, showDeleted, showHidden
   */
  CALENDARS_LIST: '/api/calendars/list',

  // ============================================
  // EVENT ENDPOINTS
  // ============================================

  /**
   * Events collection endpoint
   * Methods: GET (list all), POST (create)
   */
  EVENTS: '/api/events',

  /**
   * Single event operations by ID
   * Methods: GET (read), PATCH (update), DELETE (remove)
   * @param id - Event ID
   */
  EVENTS_BY_ID: (id: string) => `/api/events/${id}`,

  /**
   * Get event analytics by date range
   * Methods: GET
   * Query params: startDate, endDate
   */
  EVENTS_ANALYTICS: '/api/events/analytics',

  /**
   * Get AI-powered insights for calendar events
   * Methods: GET
   * Query params: timeMin, timeMax
   */
  EVENTS_INSIGHTS: '/api/events/insights',

  /**
   * Quick add event from text
   * Methods: POST
   */
  EVENTS_QUICK_ADD: '/api/events/quick-add',

  /**
   * Watch events for changes
   * Methods: POST
   */
  EVENTS_WATCH: '/api/events/watch',

  /**
   * Move event between calendars
   * Methods: POST
   */
  EVENTS_MOVE: '/api/events/move',

  // ============================================
  // WHATSAPP ENDPOINTS
  // ============================================

  /**
   * WhatsApp webhook verification endpoint UNDER DEVELOPMENT
   * Methods: GET
   * Query params: hub.mode, hub.challenge, hub.verify_token
   */
  WHATSAPP: '/api/whatsapp',

  // ============================================
  // INTEGRATIONS ENDPOINTS
  // ============================================

  /**
   * Get Google Calendar integration status
   * Methods: GET
   * Returns: isSynced, isActive, isExpired, syncedAt, authUrl
   */
  INTEGRATIONS_GOOGLE_CALENDAR: '/api/users/integrations/google-calendar',

  /**
   * Disconnect Google Calendar integration
   * Methods: POST
   * Sets is_active to false
   */
  INTEGRATIONS_GOOGLE_CALENDAR_DISCONNECT: '/api/users/integrations/google-calendar/disconnect',

  // ============================================
  // PAYMENT ENDPOINTS
  // ============================================

  /**
   * Get Stripe configuration status
   * Methods: GET
   * Returns: enabled, publishableKey, trialDays, moneyBackDays
   */
  PAYMENTS_STATUS: '/api/payments/status',

  /**
   * Get available subscription plans
   * Methods: GET
   * Returns: plans[]
   */
  PAYMENTS_PLANS: '/api/payments/plans',

  /**
   * Get current user's subscription
   * Methods: GET
   * Returns: subscription status, access details
   */
  PAYMENTS_SUBSCRIPTION: '/api/payments/subscription',

  /**
   * Initialize free starter plan
   * Methods: POST
   */
  PAYMENTS_INITIALIZE_FREE: '/api/payments/initialize-free',

  /**
   * Create checkout session for subscription
   * Methods: POST
   * Body: { planSlug, interval, successUrl?, cancelUrl? }
   */
  PAYMENTS_CHECKOUT: '/api/payments/checkout',

  /**
   * Create checkout session for credit pack
   * Methods: POST
   * Body: { credits, planSlug, successUrl?, cancelUrl? }
   */
  PAYMENTS_CHECKOUT_CREDITS: '/api/payments/checkout/credits',

  /**
   * Create billing portal session
   * Methods: POST
   * Body: { returnUrl? }
   */
  PAYMENTS_PORTAL: '/api/payments/portal',

  /**
   * Cancel subscription
   * Methods: POST
   * Body: { reason?, immediate? }
   */
  PAYMENTS_CANCEL: '/api/payments/cancel',

  /**
   * Request money-back refund
   * Methods: POST
   * Body: { reason? }
   */
  PAYMENTS_REFUND: '/api/payments/refund',

  // ============================================
  // GAP RECOVERY ENDPOINTS
  // ============================================

  /**
   * Analyze calendar and get gaps
   * Methods: GET
   * Query params: startDate, endDate, calendarId, lookbackDays, limit
   */
  GAPS: '/api/gaps',

  /**
   * Get gaps formatted for chat display
   * Methods: GET
   */
  GAPS_FORMATTED: '/api/gaps/formatted',

  /**
   * Fill a gap with a new event
   * Methods: POST
   * @param gapId - Gap ID
   */
  GAPS_FILL: (gapId: string) => `/api/gaps/${gapId}/fill`,

  /**
   * Skip a specific gap
   * Methods: POST
   * @param gapId - Gap ID
   */
  GAPS_SKIP: (gapId: string) => `/api/gaps/${gapId}/skip`,

  /**
   * Dismiss all pending gaps
   * Methods: POST
   */
  GAPS_DISMISS_ALL: '/api/gaps/dismiss-all',

  /**
   * Get gap recovery settings
   * Methods: GET
   */
  GAPS_SETTINGS: '/api/gaps/settings',

  /**
   * Update gap recovery settings
   * Methods: PATCH
   */
  GAPS_SETTINGS_UPDATE: '/api/gaps/settings',

  /**
   * Disable gap analysis feature
   * Methods: POST
   */
  GAPS_DISABLE: '/api/gaps/disable',

  // ============================================
  // USER PREFERENCES ENDPOINTS
  // ============================================

  /**
   * Get all assistant preferences
   * Methods: GET
   */
  USER_PREFERENCES: '/api/users/preferences',

  /**
   * Get specific preference by key
   * Methods: GET
   * @param key - Preference key (ally_brain, contextual_scheduling)
   */
  USER_PREFERENCES_BY_KEY: (key: string) => `/api/users/preferences/${key}`,

  /**
   * Update ally_brain preference
   * Methods: PUT
   */
  USER_PREFERENCES_ALLY_BRAIN: '/api/users/preferences/ally_brain',

  /**
   * Update contextual_scheduling preference
   * Methods: PUT
   */
  USER_PREFERENCES_CONTEXTUAL_SCHEDULING: '/api/users/preferences/contextual_scheduling',

  USER_PREFERENCES_REMINDER_DEFAULTS: '/api/users/preferences/reminder_defaults',

  USER_PREFERENCES_VOICE: '/api/users/preferences/voice_preference',

  /**
   * Submit contact form
   * Methods: POST
   * Body: multipart/form-data with name, email, subject, message, attachments[]
   */
  CONTACT: '/api/contact',

  // ============================================
  // VOICE ENDPOINTS
  // ============================================

  /**
   * Transcribe audio to text
   * Methods: POST
   * Body: multipart/form-data with audio file
   */
  VOICE_TRANSCRIBE: '/api/voice/transcribe',

  VOICE_SYNTHESIZE: '/api/voice/synthesize',

  VOICE_LIVEKIT_TOKEN: '/api/voice/livekit/token',

  VOICE_AGENT_PROFILES: '/api/voice/agents/profiles',
} as const

export type EndpointsType = typeof ENDPOINTS
