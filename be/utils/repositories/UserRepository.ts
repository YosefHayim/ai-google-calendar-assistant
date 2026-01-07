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

const normalizeEmail = (email: string): string => email.toLowerCase().trim()

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

export class UserRepository {
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
}

export const userRepository = new UserRepository()
