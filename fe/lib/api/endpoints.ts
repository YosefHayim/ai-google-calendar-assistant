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
   * Get reschedule suggestions for an event
   * Methods: GET
   * Query params: calendarId, preferredTimeOfDay, daysToSearch, excludeWeekends
   * @param id - Event ID
   */
  EVENTS_RESCHEDULE_SUGGESTIONS: (id: string) => `/api/events/${id}/reschedule-suggestions`,

  /**
   * Apply reschedule to an event
   * Methods: POST
   * Body: { newStart, newEnd, calendarId }
   * @param id - Event ID
   */
  EVENTS_RESCHEDULE: (id: string) => `/api/events/${id}/reschedule`,

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

  /**
   * Get Slack integration status
   * Methods: GET
   * Returns: isConnected, slackUserId, slackTeamId, slackUsername, connectedAt, installUrl
   */
  INTEGRATIONS_SLACK: '/api/slack/status',

  // ============================================
  // PAYMENT ENDPOINTS
  // ============================================

  /**
   * Get payment provider configuration status
   * Methods: GET
   * Returns: enabled, provider, trialDays, moneyBackDays
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

  /**
   * Upgrade or downgrade subscription plan
   * Methods: POST
   * Body: { planSlug, interval }
   */
  PAYMENTS_UPGRADE: '/api/payments/upgrade',

  /**
   * Get billing overview (payment method, transactions)
   * Methods: GET
   * Returns: paymentMethod, transactions[]
   */
  PAYMENTS_BILLING: '/api/payments/billing',

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
   * Update daily_briefing preference
   * Methods: PUT
   */
  USER_PREFERENCES_DAILY_BRIEFING: '/api/users/preferences/daily_briefing',

  /**
   * Update cross_platform_sync preference
   * Methods: PUT
   */
  USER_PREFERENCES_CROSS_PLATFORM_SYNC: '/api/users/preferences/cross_platform_sync',

  /**
   * Update geo_location preference
   * Methods: PUT
   */
  USER_PREFERENCES_GEO_LOCATION: '/api/users/preferences/geo_location',

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

  AGENT_PROFILES: '/api/users/agent-profiles',
  AGENT_PROFILES_BY_ID: (id: string) => `/api/users/agent-profiles/${id}`,
  AGENT_PROFILES_SELECTED: '/api/users/agent-profiles/selected',

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Get admin dashboard stats
   * Methods: GET
   * Returns: KPI metrics (total users, revenue, etc.)
   */
  ADMIN_DASHBOARD_STATS: '/api/admin/dashboard/stats',

  /**
   * Get subscription distribution
   * Methods: GET
   * Returns: Breakdown of users by plan
   */
  ADMIN_DASHBOARD_DISTRIBUTION: '/api/admin/dashboard/distribution',

  /**
   * Get revenue trends for charts
   * Methods: GET
   * Query: months (default: 6)
   * Returns: Monthly revenue and subscription data
   */
  ADMIN_DASHBOARD_REVENUE_TRENDS: '/api/admin/dashboard/revenue-trends',

  /**
   * Get subscription trends for charts
   * Methods: GET
   * Query: days (default: 7)
   * Returns: Daily subscription trend data
   */
  ADMIN_DASHBOARD_SUBSCRIPTION_TRENDS: '/api/admin/dashboard/subscription-trends',

  /**
   * Get current admin user info
   * Methods: GET
   * Returns: Current admin user details
   */
  ADMIN_ME: '/api/admin/me',

  /**
   * List all users (admin)
   * Methods: GET
   * Query: page, limit, search, status, role, sortBy, sortOrder
   */
  ADMIN_USERS: '/api/admin/users',

  /**
   * Get user by ID (admin)
   * Methods: GET
   * @param id - User ID
   */
  ADMIN_USER_BY_ID: (id: string) => `/api/admin/users/${id}`,

  /**
   * Update user status (admin)
   * Methods: PATCH
   * @param id - User ID
   */
  ADMIN_USER_STATUS: (id: string) => `/api/admin/users/${id}/status`,

  /**
   * Update user role (admin)
   * Methods: PATCH
   * @param id - User ID
   */
  ADMIN_USER_ROLE: (id: string) => `/api/admin/users/${id}/role`,

  /**
   * Grant credits to user (admin)
   * Methods: POST
   * @param id - User ID
   */
  ADMIN_USER_CREDITS: (id: string) => `/api/admin/users/${id}/credits`,

  /**
   * Send password reset (admin)
   * Methods: POST
   * @param id - User ID
   */
  ADMIN_USER_PASSWORD_RESET: (id: string) => `/api/admin/users/${id}/password-reset`,

  /**
   * List all subscriptions (admin)
   * Methods: GET
   */
  ADMIN_SUBSCRIPTIONS: '/api/admin/subscriptions',

  /**
   * Get payment history (admin)
   * Methods: GET
   * Query: page, limit, userId, status
   */
  ADMIN_PAYMENTS: '/api/admin/payments',

  /**
   * Get audit logs (admin)
   * Methods: GET
   * Query: page, limit, adminUserId, actionType
   */
  ADMIN_AUDIT_LOGS: '/api/admin/audit-logs',
} as const

export type EndpointsType = typeof ENDPOINTS
