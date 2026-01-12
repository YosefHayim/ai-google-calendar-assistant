import { SUPABASE } from "@/config/clients/supabase"
import type { TokensProps } from "@/types"
import { logger } from "@/utils/logger"
import { isoToMs, msToIso } from "@/utils/date/timestamp-utils"

const USER_BASE_FIELDS =
  "id, email, timezone, display_name, first_name, last_name, avatar_url, status"

const OAUTH_FIELDS =
  "access_token, refresh_token, token_type, id_token, scope, expires_at, refresh_token_expires_at, is_valid, provider"

type UserRow = {
  id: string
  email: string
  timezone: string | null
  display_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  status: string | null
}

type OAuthRow = {
  access_token: string
  refresh_token: string | null
  token_type: string | null
  id_token: string | null
  scope: string | null
  expires_at: string | null
  refresh_token_expires_at: string | null
  is_valid: boolean | null
  provider: string
}

/**
 * @description Normalizes an email address by converting to lowercase and trimming whitespace.
 * Used internally to ensure consistent email comparisons and database queries.
 *
 * @param {string} email - The email address to normalize
 * @returns {string} The normalized email in lowercase with no leading/trailing whitespace
 *
 * @example
 * normalizeEmail('  John.Doe@Example.COM  ')  // 'john.doe@example.com'
 *
 * @private
 */
const normalizeEmail = (email: string): string => email.toLowerCase().trim()

/**
 * @description Combines user record and OAuth token record into a unified TokensProps object.
 * Merges user profile information with authentication tokens, converting timestamp formats
 * and mapping field names to the expected TokensProps interface.
 *
 * @param {UserRow} user - The user record from the users table
 * @param {OAuthRow} oauthToken - The OAuth token record from the oauth_tokens table
 * @returns {TokensProps} A combined object containing user profile and authentication data
 *
 * @example
 * const tokens = combineUserAndOAuthToTokensProps(
 *   { id: 'user-123', email: 'john@example.com', timezone: 'America/New_York', ... },
 *   { access_token: 'ya29...', refresh_token: '1//...', expires_at: '2024-01-01T00:00:00Z', ... }
 * );
 * // Result: { user_id: 'user-123', email: 'john@example.com', access_token: 'ya29...', ... }
 *
 * @private
 */
const combineUserAndOAuthToTokensProps = (
  user: UserRow,
  oauthToken: OAuthRow
): TokensProps => ({
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
  expiry_date: isoToMs(oauthToken.expires_at),
  refresh_token_expires_at: oauthToken.refresh_token_expires_at,
  is_valid: oauthToken.is_valid,
  is_active: oauthToken.is_valid,
  provider: oauthToken.provider as TokensProps["provider"],
})

/**
 * @description Repository class for user-related database operations. Provides methods for
 * finding users, managing OAuth tokens, and updating user preferences. All email lookups
 * are case-insensitive.
 */
export class UserRepository {
  /**
   * @description Finds a user by their email address. Performs case-insensitive lookup
   * and returns core user profile fields. Returns null if no user is found or on error.
   *
   * @param {string} email - The email address to search for (case-insensitive)
   * @returns {Promise<UserRow | null>} The user record or null if not found
   *
   * @example
   * const user = await userRepository.findUserByEmail('john@example.com');
   * if (user) {
   *   console.log(`Found user: ${user.display_name}`);
   * }
   */
  async findUserByEmail(email: string): Promise<UserRow | null> {
    const { data, error } = await SUPABASE.from("users")
      .select(USER_BASE_FIELDS)
      .ilike("email", normalizeEmail(email))
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error(`UserRepository: findUserByEmail error: ${error.message}`)
      return null
    }

    return data as UserRow | null
  }

  /**
   * @description Finds only the user ID by email address. More efficient than findUserByEmail
   * when you only need the ID for subsequent queries. Case-insensitive lookup.
   *
   * @param {string} email - The email address to search for (case-insensitive)
   * @returns {Promise<string | null>} The user's UUID or null if not found
   *
   * @example
   * const userId = await userRepository.findUserIdByEmail('john@example.com');
   * if (userId) {
   *   await someOperation(userId);
   * }
   */
  async findUserIdByEmail(email: string): Promise<string | null> {
    const { data, error } = await SUPABASE.from("users")
      .select("id")
      .ilike("email", normalizeEmail(email))
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return data.id
  }

  /**
   * @description Retrieves Google OAuth tokens for a specific user. Returns the access token,
   * refresh token, and related metadata needed for Google API authentication.
   *
   * @param {string} userId - The user's UUID
   * @returns {Promise<OAuthRow | null>} The OAuth token record or null if not found/error
   *
   * @example
   * const tokens = await userRepository.findGoogleOAuthToken(user.id);
   * if (tokens && tokens.is_valid) {
   *   // Use tokens.access_token for Google API calls
   * }
   */
  async findGoogleOAuthToken(userId: string): Promise<OAuthRow | null> {
    const { data, error } = await SUPABASE.from("oauth_tokens")
      .select(OAUTH_FIELDS)
      .eq("user_id", userId)
      .eq("provider", "google")
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error(`UserRepository: findGoogleOAuthToken error: ${error.message}`)
      return null
    }

    return data as OAuthRow | null
  }

  /**
   * @description Finds a user and their Google OAuth tokens in a single operation.
   * Returns combined user profile and token data. Does not throw on missing data,
   * instead returns { data: null, error: null }.
   *
   * @param {string} email - The email address to search for (case-insensitive)
   * @returns {Promise<{data: TokensProps | null, error: string | null}>}
   *   - data: Combined user and token properties, or null if user/tokens not found
   *   - error: Error message string, or null if operation succeeded (even if no data)
   *
   * @example
   * const { data, error } = await userRepository.findUserWithGoogleTokens('john@example.com');
   * if (data) {
   *   // Use data.access_token, data.user_id, etc.
   * } else if (error) {
   *   console.error('Lookup failed:', error);
   * } else {
   *   console.log('User or tokens not found');
   * }
   */
  async findUserWithGoogleTokens(
    email: string
  ): Promise<{ data: TokensProps | null; error: string | null }> {
    const user = await this.findUserByEmail(email)

    if (!user) {
      return { data: null, error: null }
    }

    const oauthToken = await this.findGoogleOAuthToken(user.id)

    if (!oauthToken) {
      return { data: null, error: null }
    }

    return {
      data: combineUserAndOAuthToTokensProps(user, oauthToken),
      error: null,
    }
  }

  /**
   * @description Finds a user and their Google OAuth tokens, throwing an error if either
   * is not found. Use this when authentication is required and missing credentials should
   * halt execution.
   *
   * @param {string} email - The email address to search for (case-insensitive)
   * @returns {Promise<TokensProps>} Combined user and token properties
   * @throws {Error} 'No credentials found for {email}' if user doesn't exist
   * @throws {Error} 'No Google Calendar credentials found for {email}' if tokens don't exist
   *
   * @example
   * try {
   *   const tokens = await userRepository.findUserWithGoogleTokensOrThrow('john@example.com');
   *   await googleCalendarAPI.authenticate(tokens);
   * } catch (error) {
   *   // Handle missing credentials
   *   return res.status(401).json({ error: error.message });
   * }
   */
  async findUserWithGoogleTokensOrThrow(email: string): Promise<TokensProps> {
    const user = await this.findUserByEmail(email)

    if (!user) {
      logger.error(`UserRepository: no user found for email: ${email}`)
      throw new Error(`No credentials found for ${email}`)
    }

    const oauthToken = await this.findGoogleOAuthToken(user.id)

    if (!oauthToken) {
      logger.error(`UserRepository: no Google OAuth token found for email: ${email}`)
      throw new Error(`No Google Calendar credentials found for ${email}`)
    }

    return combineUserAndOAuthToTokensProps(user, oauthToken)
  }

  /**
   * @description Validates that a user exists and has valid Google OAuth credentials.
   * Performs comprehensive checks: user existence, token existence, and token validity.
   * Useful for pre-flight validation before operations that require authentication.
   *
   * @param {string} email - The email address to validate (case-insensitive)
   * @returns {Promise<{exists: boolean, user?: Record<string, unknown>, error?: string}>}
   *   - exists: true if user has valid credentials
   *   - user: the user record if exists is true
   *   - error: descriptive error message if exists is false
   *
   * @example
   * const validation = await userRepository.validateUserExists('john@example.com');
   * if (!validation.exists) {
   *   return res.status(401).json({ error: validation.error });
   *   // Possible errors:
   *   // - "No credentials found - authorization required."
   *   // - "Token expired - authorization required."
   * }
   * // Proceed with valid user
   */
  async validateUserExists(email: string): Promise<{
    exists: boolean
    user?: Record<string, unknown>
    error?: string
  }> {
    const user = await this.findUserByEmail(email)

    if (!user) {
      return { exists: false, error: "No credentials found - authorization required." }
    }

    const { data: tokenData, error: tokenError } = await SUPABASE.from(
      "oauth_tokens"
    )
      .select("id, is_valid, provider")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .single()

    if (tokenError || !tokenData) {
      return { exists: false, error: "No credentials found - authorization required." }
    }

    if (!tokenData.is_valid) {
      return { exists: false, error: "Token expired - authorization required." }
    }

    return { exists: true, user: user as unknown as Record<string, unknown> }
  }

  /**
   * @description Updates Google OAuth tokens after a successful token refresh. Sets the new
   * access token, expiry date, resets error counters, and marks tokens as valid.
   *
   * @param {string} userId - The user's UUID
   * @param {string} accessToken - The new access token from Google
   * @param {number} expiryDate - Token expiry timestamp in milliseconds since epoch
   * @returns {Promise<void>}
   * @throws {Error} 'Failed to save refreshed tokens: {message}' on database error
   *
   * @example
   * // After receiving new tokens from Google OAuth refresh
   * const { access_token, expiry_date } = googleAuthResponse;
   * await userRepository.updateGoogleTokens(
   *   user.id,
   *   access_token,
   *   expiry_date
   * );
   */
  async updateGoogleTokens(
    userId: string,
    accessToken: string,
    expiryDate: number
  ): Promise<void> {
    const { error } = await SUPABASE.from("oauth_tokens")
      .update({
        access_token: accessToken,
        expires_at: msToIso(expiryDate),
        is_valid: true,
        last_refreshed_at: new Date().toISOString(),
        refresh_error_count: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("provider", "google")

    if (error) {
      logger.error(`UserRepository: updateGoogleTokens error: ${error.message}`)
      throw new Error(`Failed to save refreshed tokens: ${error.message}`)
    }
  }

  /**
   * @description Marks a user's Google OAuth tokens as invalid/inactive. Call this when
   * tokens are revoked, refresh fails permanently, or user disconnects their Google account.
   *
   * @param {string} userId - The user's UUID
   * @returns {Promise<void>}
   * @throws {Error} 'Failed to deactivate tokens: {message}' on database error
   *
   * @example
   * // When Google returns a permanent auth error
   * if (error.code === 'invalid_grant') {
   *   await userRepository.deactivateGoogleTokens(user.id);
   *   // Prompt user to re-authorize
   * }
   */
  async deactivateGoogleTokens(userId: string): Promise<void> {
    const { error } = await SUPABASE.from("oauth_tokens")
      .update({
        is_valid: false,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("provider", "google")

    if (error) {
      logger.error(`UserRepository: deactivateGoogleTokens error: ${error.message}`)
      throw new Error(`Failed to deactivate tokens: ${error.message}`)
    }
  }

  /**
   * @description Updates the user's preferred timezone. Used for localizing event times
   * and scheduling operations. Errors are logged but not thrown.
   *
   * @param {string} email - The user's email address (case-insensitive)
   * @param {string} timezone - The IANA timezone identifier (e.g., 'America/New_York')
   * @returns {Promise<void>}
   *
   * @example
   * // Update user's timezone preference
   * await userRepository.updateUserTimezone('john@example.com', 'Europe/London');
   *
   * @example
   * // Common timezone identifiers
   * 'America/New_York'    // Eastern Time
   * 'America/Los_Angeles' // Pacific Time
   * 'Europe/London'       // GMT/BST
   * 'Asia/Tokyo'          // Japan Standard Time
   */
  async updateUserTimezone(email: string, timezone: string): Promise<void> {
    const { error } = await SUPABASE.from("users")
      .update({
        timezone,
        updated_at: new Date().toISOString(),
      })
      .ilike("email", normalizeEmail(email))

    if (error) {
      logger.error(`UserRepository: updateUserTimezone error: ${error.message}`)
    }
  }

  // ==========================================================================
  // RISC (Cross-Account Protection) Methods
  // ==========================================================================

  /**
   * @description Finds a user by their Google subject ID (sub claim from ID token).
   * Used for RISC event processing where we receive the Google sub instead of email.
   *
   * @param {string} googleSubjectId - The Google subject ID (sub claim)
   * @returns {Promise<{ userId: string; email: string } | null>} User info or null if not found
   */
  async findUserByGoogleSubjectId(
    googleSubjectId: string
  ): Promise<{ userId: string; email: string } | null> {
    const { data, error } = await SUPABASE.from("oauth_tokens")
      .select("user_id, users!inner(email)")
      .eq("provider", "google")
      .eq("provider_user_id", googleSubjectId)
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error(
        `UserRepository: findUserByGoogleSubjectId error: ${error.message}`
      )
      return null
    }

    if (!data) {
      return null
    }

    // Type assertion for the joined data
    const userData = data as unknown as {
      user_id: string
      users: { email: string }
    }

    return {
      userId: userData.user_id,
      email: userData.users.email,
    }
  }

  /**
   * @description Revokes all Google OAuth tokens for a user identified by Google subject ID.
   * Sets is_valid to false and clears sensitive token data. Used for RISC tokens-revoked events.
   *
   * @param {string} googleSubjectId - The Google subject ID (sub claim)
   * @returns {Promise<{ success: boolean; userId?: string; email?: string }>}
   */
  async revokeTokensByGoogleSubjectId(
    googleSubjectId: string
  ): Promise<{ success: boolean; userId?: string; email?: string }> {
    // First find the user
    const userInfo = await this.findUserByGoogleSubjectId(googleSubjectId)

    if (!userInfo) {
      logger.warn(
        `UserRepository: No user found for Google subject ID: ${googleSubjectId}`
      )
      return { success: false }
    }

    // Revoke the tokens - set is_valid to false and clear tokens
    const { error } = await SUPABASE.from("oauth_tokens")
      .update({
        is_valid: false,
        access_token: "[REVOKED]",
        refresh_token: null,
        id_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userInfo.userId)
      .eq("provider", "google")

    if (error) {
      logger.error(
        `UserRepository: revokeTokensByGoogleSubjectId error: ${error.message}`
      )
      return { success: false }
    }

    logger.info(
      `UserRepository: Revoked Google tokens for user ${userInfo.email} (Google sub: ${googleSubjectId})`
    )

    return {
      success: true,
      userId: userInfo.userId,
      email: userInfo.email,
    }
  }

  /**
   * @description Stores the Google subject ID for a user's OAuth tokens.
   * Should be called during OAuth flow to enable RISC event processing.
   *
   * @param {string} userId - The user's internal ID
   * @param {string} googleSubjectId - The Google subject ID (sub claim from ID token)
   * @returns {Promise<void>}
   */
  async setGoogleSubjectId(
    userId: string,
    googleSubjectId: string
  ): Promise<void> {
    const { error } = await SUPABASE.from("oauth_tokens")
      .update({
        provider_user_id: googleSubjectId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("provider", "google")

    if (error) {
      logger.error(
        `UserRepository: setGoogleSubjectId error: ${error.message}`
      )
    }
  }

  /**
   * @description Suspends a user account. Used for RISC account-disabled events.
   *
   * @param {string} googleSubjectId - The Google subject ID
   * @returns {Promise<{ success: boolean; userId?: string; email?: string }>}
   */
  async suspendUserByGoogleSubjectId(
    googleSubjectId: string
  ): Promise<{ success: boolean; userId?: string; email?: string }> {
    const userInfo = await this.findUserByGoogleSubjectId(googleSubjectId)

    if (!userInfo) {
      return { success: false }
    }

    // Update user status to suspended
    const { error } = await SUPABASE.from("users")
      .update({
        status: "suspended",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userInfo.userId)

    if (error) {
      logger.error(
        `UserRepository: suspendUserByGoogleSubjectId error: ${error.message}`
      )
      return { success: false }
    }

    // Also revoke tokens
    await this.revokeTokensByGoogleSubjectId(googleSubjectId)

    logger.info(
      `UserRepository: Suspended user ${userInfo.email} (Google sub: ${googleSubjectId})`
    )

    return {
      success: true,
      userId: userInfo.userId,
      email: userInfo.email,
    }
  }
}

export const userRepository = new UserRepository()
