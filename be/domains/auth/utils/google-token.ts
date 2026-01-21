import { REDIRECT_URI, env } from "@/config/env"

import { OAUTH2CLIENT } from "@/infrastructure/google/google-oauth"
import { SCOPES } from "@/config/constants/google"
import type { TokensProps } from "@/types"
import { google } from "googleapis"
import { isoToMs } from "@/lib/date/timestamp-utils"
import { userRepository } from "@/lib/repositories/UserRepository"

const SECONDS_PER_MINUTE = 60
const MS_PER_SECOND = 1000
const NEAR_EXPIRY_MINUTES = 5
const MINUTES_TO_MS = SECONDS_PER_MINUTE * MS_PER_SECOND

/**
 * @description Creates a new OAuth2 client instance configured with the application's
 * Google OAuth credentials. This client is used for token refresh operations where
 * a fresh client instance is required to avoid credential conflicts.
 *
 * @returns {google.auth.OAuth2} A new Google OAuth2 client instance configured with
 *   the application's client ID, client secret, and redirect URI.
 *
 * @example
 * const oauthClient = createFreshOAuth2Client();
 * oauthClient.setCredentials({ refresh_token: "..." });
 */
const createFreshOAuth2Client = () =>
  new google.auth.OAuth2(
    env.googleClientId,
    env.googleClientSecret,
    REDIRECT_URI
  )

/**
 * @description Generates a Google OAuth2 authorization URL for user authentication.
 * The URL directs users to Google's consent screen where they can grant the application
 * access to their Google Calendar and other requested scopes.
 *
 * @param {Object} [options={}] - Configuration options for the auth URL.
 * @param {boolean} [options.forceConsent=false] - When true, forces the consent screen
 *   to appear even if the user has previously granted permissions. Useful for obtaining
 *   a new refresh token.
 * @returns {string} The Google OAuth2 authorization URL that the user should be redirected to.
 *
 * @example
 * // Generate a standard auth URL
 * const authUrl = generateGoogleAuthUrl();
 *
 * @example
 * // Force consent to get a new refresh token
 * const authUrl = generateGoogleAuthUrl({ forceConsent: true });
 */
export const generateGoogleAuthUrl = (
  options: { forceConsent?: boolean } = {}
): string => {
  const { forceConsent = false } = options

  const authUrlOptions: {
    access_type: string
    scope: string[]
    include_granted_scopes: boolean
    redirect_uri: string
    prompt?: string
  } = {
    access_type: "offline",
    scope: SCOPES,
    include_granted_scopes: true,
    redirect_uri: REDIRECT_URI,
  }

  if (forceConsent) {
    authUrlOptions.prompt = "consent"
  }

  return OAUTH2CLIENT.generateAuthUrl(authUrlOptions)
}

/** Buffer time in milliseconds before token expiry to trigger proactive refresh */
export const NEAR_EXPIRY_BUFFER_MS = NEAR_EXPIRY_MINUTES * MINUTES_TO_MS

/**
 * @description Represents the expiry status of an OAuth token.
 * @property {boolean} isExpired - Whether the token has already expired.
 * @property {boolean} isNearExpiry - Whether the token will expire within the buffer period.
 * @property {number | null} expiresInMs - Time until expiry in milliseconds, or null if expired.
 */
export type TokenExpiryStatus = {
  isExpired: boolean
  isNearExpiry: boolean
  expiresInMs: number | null
}

/**
 * @description Represents a refreshed Google OAuth token with new credentials.
 * @property {string} accessToken - The new access token.
 * @property {number} expiryDate - The expiry timestamp in milliseconds since epoch.
 */
export type RefreshedGoogleToken = {
  accessToken: string
  expiryDate: number
}

/**
 * @description Checks the expiry status of an OAuth token. Determines whether the token
 * is expired, near expiry (within 5 minutes), or still valid. This function handles
 * both numeric timestamps (milliseconds since epoch) and ISO date strings.
 *
 * @param {number | string | null | undefined} expiryDate - The token's expiry date,
 *   either as milliseconds since epoch, an ISO date string, or null/undefined.
 * @returns {TokenExpiryStatus} An object containing:
 *   - isExpired: true if the token has expired
 *   - isNearExpiry: true if the token will expire within 5 minutes
 *   - expiresInMs: milliseconds until expiry, or null if expired
 *
 * @example
 * // Check a token expiring in 10 minutes
 * const status = checkTokenExpiry(Date.now() + 600000);
 * console.log(status.isExpired); // false
 * console.log(status.isNearExpiry); // false
 *
 * @example
 * // Check an expired token
 * const status = checkTokenExpiry(Date.now() - 1000);
 * console.log(status.isExpired); // true
 */
export const checkTokenExpiry = (
  expiryDate: number | string | null | undefined
): TokenExpiryStatus => {
  if (!expiryDate) {
    return { isExpired: true, isNearExpiry: true, expiresInMs: null }
  }

  const expiryMs =
    typeof expiryDate === "string" ? new Date(expiryDate).getTime() : expiryDate

  const now = Date.now()
  const expiresInMs = expiryMs - now
  return {
    isExpired: expiresInMs <= 0,
    isNearExpiry: expiresInMs > 0 && expiresInMs <= NEAR_EXPIRY_BUFFER_MS,
    expiresInMs: expiresInMs > 0 ? expiresInMs : null,
  }
}

/**
 * @description Fetches the Google OAuth tokens for a user by their email address.
 * Unlike fetchCredentialsByEmail, this function returns a result object with
 * data and error fields instead of throwing on failure, making it suitable
 * for cases where missing tokens should be handled gracefully.
 *
 * @param {string} email - The email address of the user whose tokens should be fetched.
 * @returns {Promise<{ data: TokensProps | null; error: string | null }>} A promise
 *   resolving to an object containing either the user's tokens or an error message.
 *
 * @example
 * const { data: tokens, error } = await fetchGoogleTokensByEmail("user@example.com");
 * if (error) {
 *   console.error("Failed to fetch tokens:", error);
 * } else if (tokens) {
 *   console.log("Access token:", tokens.access_token);
 * }
 */
export const fetchGoogleTokensByEmail = (
  email: string
): Promise<{ data: TokensProps | null; error: string | null }> =>
  userRepository.findUserWithGoogleTokens(email)

/**
 * @description Refreshes an expired or near-expiry Google OAuth access token using
 * the stored refresh token. Creates a fresh OAuth2 client, sets the existing credentials,
 * and requests a new access token from Google's OAuth servers.
 *
 * @param {TokensProps} tokens - The current token object containing at minimum
 *   the refresh_token. May also include access_token, expiry_date, token_type,
 *   scope, and id_token for proper credential configuration.
 * @returns {Promise<RefreshedGoogleToken>} A promise resolving to an object with
 *   the new accessToken and its expiryDate (in milliseconds since epoch).
 * @throws {Error} "REAUTH_REQUIRED: No refresh token available" - If no refresh token exists.
 * @throws {Error} "REAUTH_REQUIRED: Refresh token is invalid, expired, or revoked" -
 *   If Google rejects the refresh token (user must re-authenticate).
 * @throws {Error} "TOKEN_REFRESH_FAILED: {message}" - For other refresh failures.
 *
 * @example
 * try {
 *   const { accessToken, expiryDate } = await refreshGoogleAccessToken(userTokens);
 *   console.log("New access token obtained, expires:", new Date(expiryDate));
 * } catch (error) {
 *   if (error.message.includes("REAUTH_REQUIRED")) {
 *     // Redirect user to re-authenticate
 *   }
 * }
 */
export const refreshGoogleAccessToken = async (
  tokens: TokensProps
): Promise<RefreshedGoogleToken> => {
  if (!tokens.refresh_token) {
    throw new Error("REAUTH_REQUIRED: No refresh token available")
  }

  const oauthClient = createFreshOAuth2Client()

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
    const err = e as Error & {
      code?: string
      response?: { data?: { error?: string; error_description?: string } }
    }

    const errorCode = err.code || err.response?.data?.error
    const errorMessage =
      err.message || err.response?.data?.error_description || ""

    const invalidGrantErrors = [
      "invalid_grant",
      "invalid_request",
      "unauthorized_client",
    ]

    if (
      errorCode === "invalid_grant" ||
      invalidGrantErrors.some((code) =>
        errorMessage.toLowerCase().includes(code)
      ) ||
      errorMessage
        .toLowerCase()
        .includes("token has been expired or revoked") ||
      errorMessage.toLowerCase().includes("invalid_grant") ||
      errorMessage.toLowerCase().includes("token was not found")
    ) {
      console.error(
        "Google token refresh failed: Refresh token is invalid or expired",
        { code: errorCode, message: errorMessage }
      )
      throw new Error(
        "REAUTH_REQUIRED: Refresh token is invalid, expired, or revoked. User must re-authenticate."
      )
    }

    console.error("Google token refresh failed:", {
      code: errorCode,
      message: errorMessage,
      error: err,
    })
    throw new Error(
      `TOKEN_REFRESH_FAILED: ${errorMessage || err.message || "Unknown error occurred"}`
    )
  }
}

/**
 * @description Persists refreshed Google OAuth tokens to the database for a user.
 * Looks up the user by email and updates their stored access token and expiry date.
 * This should be called after successfully refreshing tokens to ensure the new
 * credentials are available for future API calls.
 *
 * @param {string} email - The email address of the user whose tokens should be updated.
 * @param {RefreshedGoogleToken} refreshedTokens - The new token data containing
 *   accessToken and expiryDate.
 * @returns {Promise<void>} A promise that resolves when the tokens are persisted.
 * @throws {Error} "Failed to find user: User not found" - If no user exists with the given email.
 *
 * @example
 * const refreshedTokens = await refreshGoogleAccessToken(currentTokens);
 * await persistGoogleTokens("user@example.com", refreshedTokens);
 */
export const persistGoogleTokens = async (
  email: string,
  refreshedTokens: RefreshedGoogleToken
): Promise<void> => {
  const userId = await userRepository.findUserIdByEmail(email)

  if (!userId) {
    console.error("Failed to find user for token persistence: User not found")
    throw new Error("Failed to find user: User not found")
  }

  await userRepository.updateGoogleTokens(
    userId,
    refreshedTokens.accessToken,
    refreshedTokens.expiryDate
  )
}

/**
 * @description Deactivates a user's Google OAuth tokens, marking them as invalid
 * in the database. This is typically called when a token refresh fails due to
 * revocation or when the user disconnects their Google account. The user will
 * need to re-authenticate to obtain new tokens.
 *
 * @param {string} email - The email address of the user whose tokens should be deactivated.
 * @returns {Promise<void>} A promise that resolves when the tokens are deactivated.
 * @throws {Error} "Failed to find user: User not found" - If no user exists with the given email.
 *
 * @example
 * // Deactivate tokens after detecting revocation
 * try {
 *   await refreshGoogleAccessToken(tokens);
 * } catch (error) {
 *   if (error.message.includes("REAUTH_REQUIRED")) {
 *     await deactivateGoogleTokens(userEmail);
 *   }
 * }
 */
export const deactivateGoogleTokens = async (email: string): Promise<void> => {
  const userId = await userRepository.findUserIdByEmail(email)

  if (!userId) {
    console.error("Failed to find user for token deactivation: User not found")
    throw new Error("Failed to find user: User not found")
  }

  await userRepository.deactivateGoogleTokens(userId)
}

/**
 * @description Retrieves the internal user ID for a given email address.
 * This is a utility function used when you need to perform operations that
 * require the user's database ID rather than their email.
 *
 * @param {string} email - The email address of the user to look up.
 * @returns {Promise<string | null>} A promise resolving to the user's ID if found,
 *   or null if no user exists with the given email.
 *
 * @example
 * const userId = await getUserIdByEmail("user@example.com");
 * if (userId) {
 *   console.log("Found user with ID:", userId);
 * } else {
 *   console.log("User not found");
 * }
 */
export const getUserIdByEmail = (email: string): Promise<string | null> =>
  userRepository.findUserIdByEmail(email)
