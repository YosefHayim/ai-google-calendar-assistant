/**
 * Google RISC (Cross-Account Protection) Event Types
 * @see https://developers.google.com/identity/protocols/risc
 */

/**
 * RISC Security Event Token (SET) structure
 */
export type RiscSecurityEventToken = {
  /** Issuer - must be "https://accounts.google.com/" */
  iss: string
  /** Audience - must match your OAuth Client ID */
  aud: string
  /** Issued at timestamp */
  iat: number
  /** JWT ID - unique identifier for this token */
  jti: string
  /** Events map containing the security event(s) */
  events: RiscEvents
}

/**
 * RISC Events container - maps event URIs to event data
 */
export type RiscEvents = {
  [eventType: string]: RiscEventData
}

/**
 * Base event data structure
 */
export type RiscEventData = {
  /** Google subject ID of the affected user */
  subject?: {
    subject_type: "iss-sub"
    iss: string
    sub: string
  }
  /** Reason for the event (optional) */
  reason?: string
  /** For token-revoked events: algorithm used to hash the token */
  token_identifier_alg?: string
  /** For token-revoked events: hash of the revoked token */
  token_identifier?: string
  /** Timestamp when the event occurred */
  event_timestamp?: number
}

/**
 * Known RISC event types
 */
export const RISC_EVENT_TYPES = {
  /** All OAuth tokens for the user have been revoked */
  TOKENS_REVOKED:
    "https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked",
  /** A specific OAuth token has been revoked */
  TOKEN_REVOKED:
    "https://schemas.openid.net/secevent/oauth/event-type/token-revoked",
  /** All user sessions have been revoked */
  SESSIONS_REVOKED:
    "https://schemas.openid.net/secevent/risc/event-type/sessions-revoked",
  /** User account has been disabled */
  ACCOUNT_DISABLED:
    "https://schemas.openid.net/secevent/risc/event-type/account-disabled",
  /** User account has been enabled */
  ACCOUNT_ENABLED:
    "https://schemas.openid.net/secevent/risc/event-type/account-enabled",
  /** Account credentials have changed */
  ACCOUNT_CREDENTIAL_CHANGE_REQUIRED:
    "https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required",
  /** Account purged/deleted */
  ACCOUNT_PURGED:
    "https://schemas.openid.net/secevent/risc/event-type/account-purged",
  /** Verification event for testing the endpoint */
  VERIFICATION:
    "https://schemas.openid.net/secevent/risc/event-type/verification",
} as const

export type RiscEventType =
  (typeof RISC_EVENT_TYPES)[keyof typeof RISC_EVENT_TYPES]

/**
 * Result of processing a RISC event
 */
export type RiscEventResult = {
  success: boolean
  eventType: string
  googleSubjectId?: string
  action: string
  error?: string
}

/**
 * Google's JWKS (JSON Web Key Set) response
 */
export type GoogleJwks = {
  keys: GoogleJwk[]
}

/**
 * Individual Google JSON Web Key
 */
export type GoogleJwk = {
  kty: string
  alg: string
  use: string
  kid: string
  n: string
  e: string
}

/**
 * Decoded JWT header
 */
export type JwtHeader = {
  alg: string
  typ: string
  kid: string
}
