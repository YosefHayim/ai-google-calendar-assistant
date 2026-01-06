import { OAUTH2CLIENT, REDIRECT_URI, SCOPES, SUPABASE, env } from "@/config"

import type { TokensProps } from "@/types"
import { google } from "googleapis"
import { logger } from "../logger"

/**
 * Create a fresh OAuth2Client instance for token refresh
 *
 * This avoids issues with singleton OAuth2Client caching stale token state.
 *
 * @returns {google.auth.OAuth2} A new OAuth2Client instance
 */
const createFreshOAuth2Client = () => {
  return new google.auth.OAuth2(env.googleClientId, env.googleClientSecret, REDIRECT_URI)
}

/**
 * Generate Google OAuth URL for calendar authorization
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.forceConsent - Force consent screen (default: false). Set to true for first-time auth or when refresh token is missing.
 * @returns {string} The OAuth URL for Google Calendar authorization
 * @description
 * Optimized to reduce redundant consent screens:
 * - Uses `prompt: "consent"` only when forceConsent=true (first-time auth)
 * - Otherwise relies on refresh tokens for silent re-authentication
 * - Always includes `access_type: "offline"` to ensure refresh_token is returned
 */
export const generateGoogleAuthUrl = (options: { forceConsent?: boolean } = {}): string => {
  const { forceConsent = false } = options

  const authUrlOptions: {
    access_type: string
    scope: string[]
    include_granted_scopes: boolean
    redirect_uri: string
    prompt?: string
  } = {
    access_type: "offline", // CRITICAL: Required to receive refresh_token
    scope: SCOPES,
    include_granted_scopes: true,
    redirect_uri: REDIRECT_URI,
  }

  // Only force consent screen on first-time auth or when explicitly requested
  // This prevents redundant redirects when user already has a valid refresh token
  if (forceConsent) {
    authUrlOptions.prompt = "consent"
  }

  return OAUTH2CLIENT.generateAuthUrl(authUrlOptions)
}

// Buffer time before expiry to consider token as "near expiry" (5 minutes)
export const NEAR_EXPIRY_BUFFER_MS = 5 * 60 * 1000

/**
 * Token expiry status
 */
export type TokenExpiryStatus = {
  isExpired: boolean
  isNearExpiry: boolean
  expiresInMs: number | null
}

/**
 * Refreshed token result
 */
export type RefreshedGoogleToken = {
  accessToken: string
  expiryDate: number
}

/**
 * Check if token is expired or near expiry
 *
 * @param {number | string | null | undefined} expiryDate - Token expiry timestamp (milliseconds or ISO string)
 * @returns {TokenExpiryStatus} Expiry status object
 */
export const checkTokenExpiry = (expiryDate: number | string | null | undefined): TokenExpiryStatus => {
  if (!expiryDate) {
    // No expiry date means we can't validate - treat as potentially expired
    return { isExpired: true, isNearExpiry: true, expiresInMs: null }
  }

  // Convert ISO string to milliseconds if needed
  const expiryMs = typeof expiryDate === "string" ? new Date(expiryDate).getTime() : expiryDate

  const now = Date.now()
  const expiresInMs = expiryMs - now
  return {
    isExpired: expiresInMs <= 0,
    isNearExpiry: expiresInMs > 0 && expiresInMs <= NEAR_EXPIRY_BUFFER_MS,
    expiresInMs: expiresInMs > 0 ? expiresInMs : null,
  }
}

/**
 * Convert ISO timestamp to milliseconds for backwards compatibility
 */
const isoToMs = (isoString: string | null | undefined): number | null => {
  if (!isoString) return null
  return new Date(isoString).getTime()
}

/**
 * Convert milliseconds to ISO timestamp for database storage
 */
const msToIso = (ms: number): string => {
  return new Date(ms).toISOString()
}

/**
 * Fetch Google Calendar tokens from database by email
 * Uses the new schema: users + oauth_tokens tables
 *
 * @param {string} email - User's email
 * @returns {Promise<TokensProps | null>} Tokens or null if not found
 */
export const fetchGoogleTokensByEmail = async (email: string): Promise<{ data: TokensProps | null; error: string | null }> => {
  const normalizedEmail = email.toLowerCase().trim()

  // First, find the user by email
  const { data: user, error: userError } = await SUPABASE.from("users")
    .select("id, email, timezone, display_name, first_name, last_name, avatar_url, status")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle()

  if (userError) {
    logger.error(`Auth: fetchGoogleTokensByEmail - user query error: ${JSON.stringify(userError, null, 2)}`)
    console.error(`[fetchGoogleTokensByEmail] Database error for ${normalizedEmail}:`, userError)
    return { data: null, error: userError.message }
  }

  if (!user) {
    return { data: null, error: null }
  }

  // Now fetch the OAuth tokens for this user (Google provider)
  const { data: oauthToken, error: tokenError } = await SUPABASE.from("oauth_tokens")
    .select("access_token, refresh_token, token_type, id_token, scope, expires_at, refresh_token_expires_at, is_valid, provider")
    .eq("user_id", user.id)
    .eq("provider", "google")
    .limit(1)
    .maybeSingle()

  if (tokenError) {
    logger.error(`Auth: fetchGoogleTokensByEmail - token query error: ${JSON.stringify(tokenError, null, 2)}`)
    console.error(`[fetchGoogleTokensByEmail] Token query error for ${normalizedEmail}:`, tokenError)
    return { data: null, error: tokenError.message }
  }

  if (!oauthToken) {
    // User exists but no Google OAuth token
    return { data: null, error: null }
  }

  // Combine user and token data into TokensProps format
  const tokensProps: TokensProps = {
    user_id: user.id,
    email: user.email,
    timezone: user.timezone,
    display_name: user.display_name,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar_url: user.avatar_url,
    access_token: oauthToken.access_token,
    refresh_token: oauthToken.refresh_token,
    token_type: oauthToken.token_type,
    id_token: oauthToken.id_token,
    scope: oauthToken.scope,
    expires_at: oauthToken.expires_at,
    expiry_date: isoToMs(oauthToken.expires_at), // Backwards compatibility
    refresh_token_expires_at: oauthToken.refresh_token_expires_at,
    is_valid: oauthToken.is_valid,
    is_active: oauthToken.is_valid, // Backwards compatibility
    provider: oauthToken.provider as TokensProps["provider"],
  }

  return { data: tokensProps, error: null }
}

/**
 * Refresh Google access token using OAuth2 client
 *
 * Creates a fresh OAuth2Client per call to avoid singleton caching issues
 * that cause "session expired" errors when the backend hasn't been restarted.
 *
 * @param {TokensProps} tokens - Current tokens with refresh_token
 * @returns {Promise<RefreshedGoogleToken>} New access token and expiry
 * @throws {Error} REAUTH_REQUIRED if refresh token is invalid/expired
 * @throws {Error} TOKEN_REFRESH_FAILED for other errors
 */
export const refreshGoogleAccessToken = async (tokens: TokensProps): Promise<RefreshedGoogleToken> => {
  if (!tokens.refresh_token) {
    throw new Error("REAUTH_REQUIRED: No refresh token available")
  }

  // Create fresh OAuth2Client per request to avoid stale cached token state
  const oauthClient = createFreshOAuth2Client()

  // Convert expires_at (ISO string) to expiry_date (ms) if needed
  const expiryDate = tokens.expiry_date ?? isoToMs(tokens.expires_at)

  oauthClient.setCredentials({
    expiry_date: expiryDate,
    token_type: tokens.token_type ?? undefined,
    scope: tokens.scope ?? undefined,
    id_token: tokens.id_token ?? undefined,
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token ?? undefined,
  })

  try {
    const { credentials } = await oauthClient.refreshAccessToken()

    if (!credentials.access_token) {
      throw new Error("No access token received from Google")
    }

    if (!credentials.expiry_date) {
      throw new Error("No expiry date received from Google")
    }

    return {
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date,
    }
  } catch (e) {
    const err = e as Error & { code?: string; response?: { data?: { error?: string; error_description?: string } } }

    // Check for invalid_grant error (refresh token invalid/expired/revoked)
    const errorCode = err.code || err.response?.data?.error
    const errorMessage = err.message || err.response?.data?.error_description || ""

    // Google OAuth errors that indicate refresh token is invalid
    const invalidGrantErrors = ["invalid_grant", "invalid_request", "unauthorized_client"]

    // Check if error indicates refresh token is invalid
    if (
      errorCode === "invalid_grant" ||
      invalidGrantErrors.some((code) => errorMessage.toLowerCase().includes(code)) ||
      errorMessage.toLowerCase().includes("token has been expired or revoked") ||
      errorMessage.toLowerCase().includes("invalid_grant") ||
      errorMessage.toLowerCase().includes("token was not found")
    ) {
      console.error("Google token refresh failed: Refresh token is invalid or expired", {
        code: errorCode,
        message: errorMessage,
      })
      throw new Error("REAUTH_REQUIRED: Refresh token is invalid, expired, or revoked. User must re-authenticate.")
    }

    // For other errors, log and re-throw with context
    console.error("Google token refresh failed:", {
      code: errorCode,
      message: errorMessage,
      error: err,
    })
    throw new Error(`TOKEN_REFRESH_FAILED: ${errorMessage || err.message || "Unknown error occurred"}`)
  }
}

/**
 * Persist refreshed Google tokens to database
 * Uses the new schema: oauth_tokens table
 *
 * @param {string} email - User's email
 * @param {RefreshedGoogleToken} refreshedTokens - New token data
 */
export const persistGoogleTokens = async (email: string, refreshedTokens: RefreshedGoogleToken): Promise<void> => {
  const normalizedEmail = email.toLowerCase().trim()

  // First, get the user ID by email
  const { data: user, error: userError } = await SUPABASE.from("users").select("id").ilike("email", normalizedEmail).limit(1).maybeSingle()

  if (userError || !user) {
    console.error("Failed to find user for token persistence:", userError?.message || "User not found")
    throw new Error(`Failed to find user: ${userError?.message || "User not found"}`)
  }

  // Update the OAuth token for this user
  const { error } = await SUPABASE.from("oauth_tokens")
    .update({
      access_token: refreshedTokens.accessToken,
      expires_at: msToIso(refreshedTokens.expiryDate),
      is_valid: true,
      last_refreshed_at: new Date().toISOString(),
      refresh_error_count: 0, // Reset error count on successful refresh
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("provider", "google")

  if (error) {
    console.error("Failed to persist Google tokens:", error.message)
    throw new Error(`Failed to save refreshed tokens: ${error.message}`)
  }
}

/**
 * Mark Google tokens as invalid in database
 * Uses the new schema: oauth_tokens table
 *
 * @param {string} email - User's email
 */
export const deactivateGoogleTokens = async (email: string): Promise<void> => {
  const normalizedEmail = email.toLowerCase().trim()

  // First, get the user ID by email
  const { data: user, error: userError } = await SUPABASE.from("users").select("id").ilike("email", normalizedEmail).limit(1).maybeSingle()

  if (userError || !user) {
    console.error("Failed to find user for token deactivation:", userError?.message || "User not found")
    throw new Error(`Failed to find user: ${userError?.message || "User not found"}`)
  }

  // Mark the OAuth token as invalid
  const { error } = await SUPABASE.from("oauth_tokens")
    .update({
      is_valid: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .eq("provider", "google")

  if (error) {
    console.error("Failed to deactivate Google tokens:", error.message)
    throw new Error(`Failed to deactivate tokens: ${error.message}`)
  }
}

/**
 * Get user ID by email
 * Helper function for other modules
 *
 * @param {string} email - User's email
 * @returns {Promise<string | null>} User ID or null if not found
 */
export const getUserIdByEmail = async (email: string): Promise<string | null> => {
  const normalizedEmail = email.toLowerCase().trim()

  const { data: user, error } = await SUPABASE.from("users").select("id").ilike("email", normalizedEmail).limit(1).maybeSingle()

  if (error || !user) {
    return null
  }

  return user.id
}
