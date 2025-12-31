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
  USERS: "/api/users",

  /**
   * Google OAuth callback handler
   * Methods: GET
   */
  USERS_CALLBACK: "/api/users/callback",

  /**
   * Get authenticated user information
   * Methods: GET
   */
  USERS_GET_USER: "/api/users/get-user",

  /**
   * User sign in with email/password
   * Methods: POST
   */
  USERS_SIGNIN: "/api/users/signin",

  /**
   * User registration with email/password
   * Methods: POST
   */
  USERS_SIGNUP: "/api/users/signup",

  /**
   * Initiate Google OAuth sign-up/sign-in flow
   * Methods: GET
   */
  USERS_SIGNUP_GOOGLE: "/api/users/signup/google",

  /**
   * Initiate GitHub OAuth sign-up flow
   * Methods: GET
   */
  USERS_SIGNUP_GITHUB: "/api/users/signup/github",

  /**
   * Verify user email via OTP token
   * Methods: POST
   */
  USERS_VERIFY_OTP: "/api/users/verify-user-by-email-otp",

  // ============================================
  // CALENDAR ENDPOINTS
  // ============================================

  /**
   * Get all calendars for authenticated user
   * Methods: GET
   * Query params: customCalendars=true|false
   */
  CALENDARS: "/api/calendars",

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
  CALENDARS_SETTINGS: "/api/calendars/settings",

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
  CALENDARS_COLORS: "/api/calendars/colors",

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
  CALENDARS_TIMEZONES: "/api/calendars/timezones",

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
  CALENDARS_FREEBUSY: "/api/calendars/freebusy",

  // ============================================
  // EVENT ENDPOINTS
  // ============================================

  /**
   * Events collection endpoint
   * Methods: GET (list all), POST (create)
   */
  EVENTS: "/api/events",

  /**
   * Get filtered events based on query parameters
   * Methods: GET
   * Query params: calendarId, timeMin, timeMax, maxResults, etc.
   */
  EVENTS_FILTERED: "/api/events/filtered",

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
  EVENTS_ANALYTICS: "/api/events/analytics",

  /**
   * Quick add event from text
   * Methods: POST
   */
  EVENTS_QUICK_ADD: "/api/events/quick-add",

  /**
   * Watch events for changes
   * Methods: POST
   */
  EVENTS_WATCH: "/api/events/watch",

  /**
   * Move event between calendars
   * Methods: POST
   */
  EVENTS_MOVE: "/api/events/move",

  // ============================================
  // WHATSAPP ENDPOINTS
  // ============================================

  /**
   * WhatsApp webhook verification endpoint UNDER DEVELOPMENT
   * Methods: GET
   * Query params: hub.mode, hub.challenge, hub.verify_token
   */
  WHATSAPP: "/api/whatsapp",
} as const;

export type EndpointsType = typeof ENDPOINTS;
