import { SUPABASE } from "@/config"
import type { TokensProps } from "@/types"
import { asyncHandler } from "../http/async-handlers"
import { logger } from "../logger"

/**
 * Convert milliseconds to ISO timestamp for database storage
 */
const msToIso = (ms: number | null | undefined): string | null => {
  if (!ms) return null
  return new Date(ms).toISOString()
}

/**
 * Update tokens of user in Supabase
 * Uses the new schema: oauth_tokens table
 *
 * @param {TokensProps} oldTokens - The old tokens of the user.
 * @param {TokensProps & { token?: string | null }} newTokens - The new tokens of the user.
 * @returns {Promise<TokensProps>} The updated tokens of the user in Supabase.
 * @description Updates the tokens of the user in Supabase and sends the response.
 */
export const updateUserSupabaseTokens = asyncHandler(
  async (oldTokens: TokensProps, newTokens: TokensProps & { token?: string | null }): Promise<TokensProps> => {
    const email = oldTokens.email
    const userId = oldTokens.user_id

    if (!email && !userId) {
      logger.error("Auth: updateUserSupabaseTokens called: no email or user_id provided")
      throw new Error("No email or user_id provided for token update")
    }

    // If we have user_id, use it directly
    let targetUserId = userId

    // If we don't have user_id, look it up by email
    if (!targetUserId && email) {
      const { data: user, error: userError } = await SUPABASE.from("users")
        .select("id")
        .ilike("email", email.toLowerCase().trim())
        .limit(1)
        .maybeSingle()

      if (userError || !user) {
        logger.error(`Auth: updateUserSupabaseTokens - failed to find user by email: ${email}`)
        throw new Error(`Failed to find user: ${userError?.message || "User not found"}`)
      }

      targetUserId = user.id
    }

    // Prepare the update payload
    const updatePayload: {
      access_token?: string
      expires_at?: string | null
      is_valid?: boolean
      last_refreshed_at?: string
      updated_at?: string
    } = {
      updated_at: new Date().toISOString(),
    }

    // Update access token if provided
    if (newTokens.token) {
      updatePayload.access_token = newTokens.token
    } else if (newTokens.access_token) {
      updatePayload.access_token = newTokens.access_token
    }

    // Update expiry date if provided
    if (newTokens.expiry_date) {
      updatePayload.expires_at = msToIso(newTokens.expiry_date)
    } else if (newTokens.expires_at) {
      updatePayload.expires_at = newTokens.expires_at
    }

    // Set token as valid and record refresh time
    updatePayload.is_valid = true
    updatePayload.last_refreshed_at = new Date().toISOString()

    // Update the OAuth token
    const { error } = await SUPABASE.from("oauth_tokens")
      .update(updatePayload)
      .eq("user_id", targetUserId!)
      .eq("provider", "google")

    if (error) {
      logger.error(`Auth: updateUserSupabaseTokens called: error: ${error.message}`)
      throw new Error(`Failed to update user calendar tokens in supabase: ${error.message}`)
    }

    // Return the updated tokens
    const updatedTokens: TokensProps = {
      ...oldTokens,
      access_token: updatePayload.access_token || oldTokens.access_token,
      expires_at: updatePayload.expires_at || oldTokens.expires_at,
      expiry_date: newTokens.expiry_date || oldTokens.expiry_date,
      is_valid: true,
      is_active: true, // Backwards compatibility
    }

    return updatedTokens
  }
)
