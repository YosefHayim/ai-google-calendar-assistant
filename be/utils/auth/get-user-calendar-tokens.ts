import { SUPABASE } from "@/config"
import type { TokensProps } from "@/types"
import { asyncHandler } from "../http/async-handlers"
import { logger } from "../logger"

/**
 * Convert ISO timestamp to milliseconds for backwards compatibility
 */
const isoToMs = (isoString: string | null | undefined): number | null => {
  if (!isoString) return null
  return new Date(isoString).getTime()
}

/**
 * Fetch credentials by email
 * Uses the new schema: users + oauth_tokens tables
 *
 * @param {string} email - The email of the user.
 * @returns {Promise<TokensProps>} The credentials of the user.
 * @description Fetches the credentials of the user by email and sends the response.
 * @example
 * const data = await fetchCredentialsByEmail(email);
 *
 */
export const fetchCredentialsByEmail = asyncHandler(async (email: string): Promise<TokensProps> => {
  const normalizedEmail = email.toLowerCase().trim()

  // First, find the user by email
  const { data: user, error: userError } = await SUPABASE.from("users")
    .select("id, email, timezone, display_name, first_name, last_name, avatar_url, status")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle()

  if (userError) {
    logger.error(`Auth: fetchCredentialsByEmail - user query error: ${userError.message}`)
    throw new Error(`DB Error: ${userError.message}`)
  }

  if (!user) {
    logger.error(`Auth: fetchCredentialsByEmail called: no user found for email: ${email}`)
    throw new Error(`No credentials found for ${email}`)
  }

  // Now fetch the OAuth tokens for this user (Google provider)
  const { data: oauthToken, error: tokenError } = await SUPABASE.from("oauth_tokens")
    .select("access_token, refresh_token, token_type, id_token, scope, expires_at, refresh_token_expires_at, is_valid, provider")
    .eq("user_id", user.id)
    .eq("provider", "google")
    .limit(1)
    .maybeSingle()

  if (tokenError) {
    logger.error(`Auth: fetchCredentialsByEmail - token query error: ${tokenError.message}`)
    throw new Error(`DB Error: ${tokenError.message}`)
  }

  if (!oauthToken) {
    logger.error(`Auth: fetchCredentialsByEmail called: no Google OAuth token found for email: ${email}`)
    throw new Error(`No Google Calendar credentials found for ${email}`)
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

  return tokensProps
})
