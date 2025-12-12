/**
 * Application Constants
 * Centralized location for all hardcoded values, strings, and configuration
 */

// ============================================================================
// Routes & Paths
// ============================================================================

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PRICING: "/pricing",
  TERMS: "/terms",
  PRIVACY: "/privacy",
  CONTACT: "/contact",
  AUTH: {
    CALLBACK: "/auth/callback",
    GOOGLE: "/api/auth/google",
    GITHUB: "/api/auth/github",
  },
} as const;

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: "cal-ai-onboarding-completed",
} as const;

// Storage values
export const STORAGE_VALUES = {
  TRUE: "true",
} as const;

// ============================================================================
// User Metadata Keys
// ============================================================================

export const USER_METADATA_KEYS = {
  ONBOARDING_COMPLETED: "onboarding_completed",
} as const;

// ============================================================================
// Cookie Names
// ============================================================================

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "sb-access-token",
  REFRESH_TOKEN: "sb-refresh-token",
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  AUTH_FAILED: "auth_failed",
  AUTHENTICATION_FAILED: "authentication_failed",
  NO_SESSION: "no_session",
  MISSING_CODE: "missing_code",
  FAILED_TO_EXCHANGE_CODE: "Failed to exchange code for session",
  AUTHENTICATION_FAILED_GENERIC: "Authentication failed",
  NO_SESSION_FOUND: "No session found",
  FAILED_TO_INITIATE_OAUTH: "Failed to initiate OAuth",
  UNKNOWN_ERROR: "Unknown error",
  AN_ERROR_OCCURRED: "An error occurred",
  EMAIL_CONFIRMATION_REQUIRED: "Please check your email to confirm your account.",
} as const;

// ============================================================================
// Timeouts & Delays (in milliseconds)
// ============================================================================

export const TIMEOUTS = {
  // Auth callback delays
  ERROR_REDIRECT_DELAY: 2000,
  AUTH_STATE_CHANGE_FALLBACK: 2000,

  // Onboarding confetti
  CONFETTI_DURATION: 3000,
  CONFETTI_INTERVAL: 250,

  // UI animations
  DOM_READY_DELAY: 100,
  ONBOARDING_FINISH_DELAY: 100,
  ONBOARDING_HIGHLIGHT_DELAY: 100,
  VOICE_ANIMATION_DELAY: 1000,
  VOICE_ANIMATION_INITIAL_DELAY: 100,

  // Confetti delays
  CONFETTI_POPUP_DELAY: 200,
} as const;

// ============================================================================
// Animation & UI Constants
// ============================================================================

export const ANIMATIONS = {
  CONFETTI: {
    DURATION: 3000,
    INTERVAL: 250,
    PARTICLE_COUNT: 50, // Particle count per confetti burst
    MAX_POPUPS: 3, // Maximum number of confetti popups (2-3 recommended)
    DEFAULTS: {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    },
    ORIGIN_RANGES: {
      LEFT: { min: 0.1, max: 0.3 },
      RIGHT: { min: 0.7, max: 0.9 },
      Y_OFFSET: -0.2,
    },
  },
} as const;

// ============================================================================
// User Detection Constants
// ============================================================================

export const USER_DETECTION = {
  // Minutes since account creation to consider user as "new"
  NEW_USER_THRESHOLD_MINUTES: 5,
} as const;

// ============================================================================
// OAuth Constants
// ============================================================================

export const OAUTH = {
  PROVIDERS: {
    GOOGLE: "google",
    GITHUB: "github",
  } as const,
  QUERY_PARAMS: {
    ACCESS_TYPE: "offline",
    PROMPT: "consent",
  },
} as const;

// ============================================================================
// Cookie Options
// ============================================================================

export const COOKIE_OPTIONS = {
  HTTP_ONLY: true,
  SECURE: process.env.NODE_ENV === "production",
  SAME_SITE: "lax" as const,
  PATH: "/",
  MAX_AGE: {
    ACCESS_TOKEN: 60 * 60 * 24 * 7, // 7 days
    REFRESH_TOKEN: 60 * 60 * 24 * 30, // 30 days
  },
} as const;

// ============================================================================
// Authorization Header
// ============================================================================

export const AUTH_HEADERS = {
  BEARER_PREFIX: "Bearer ",
} as const;
