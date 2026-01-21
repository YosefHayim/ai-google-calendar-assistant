import { SUPABASE } from "@/config"
import type { TokensProps } from "@/types"
import { asyncHandler } from "@/lib/http/async-handlers"
import { logger } from "@/lib/logger"

/**
 * @description Converts a timestamp in milliseconds (since Unix epoch) to an ISO 8601
 * formatted string suitable for database storage. Returns null if the input is
 * null, undefined, or zero.
 *
 * @param {number | null | undefined} ms - The timestamp in milliseconds since epoch,
 *   or null/undefined.
 * @returns {string | null} The ISO 8601 formatted timestamp string (e.g., "2024-01-15T10:30:00.000Z"),
 *   or null if the input is falsy.
 *
 * @example
 * const isoDate = msToIso(1705312200000);
 * console.log(isoDate); // "2024-01-15T10:30:00.000Z"
 *
 * @example
 * const nullResult = msToIso(null);
 * console.log(nullResult); // null
 */
const msToIso = (ms: number | null | undefined): string | null => {
  if (!ms) {
    return null
  }
  return new Date(ms).toISOString()
}

/**
 * @description Updates a user's Google OAuth tokens in Supabase after a token refresh.
 * This function handles the persistence of new access tokens and expiry dates to the
 * oauth_tokens table. It can identify the user by either their user_id (preferred)
 * or email address, and updates the token validity status and refresh timestamp.
 *
 * The function merges the old and new token data, preserving fields that weren't
 * updated while applying new values for access_token and expires_at. It also sets
 * is_valid to true and records the last_refreshed_at timestamp.
 *
 * @param {TokensProps} oldTokens - The existing token object, must contain either
 *   email or user_id for user identification. Other fields are preserved if not
 *   overwritten by newTokens.
 * @param {TokensProps & { token?: string | null }} newTokens - The new token values
 *   to persist. Accepts either:
 *   - token: Alternative field for access_token (for backwards compatibility)
 *   - access_token: The new access token string
 *   - expiry_date: Token expiry as milliseconds since epoch
 *   - expires_at: Token expiry as ISO string
 * @returns {Promise<TokensProps>} A promise resolving to the merged token object
 *   with updated values, including is_valid: true and is_active: true.
 * @throws {Error} "No email or user_id provided for token update" - If oldTokens
 *   lacks both email and user_id.
 * @throws {Error} "Failed to find user: {message}" - If user lookup by email fails.
 * @throws {Error} "Failed to update user calendar tokens in supabase: {message}" -
 *   If the database update operation fails.
 *
 * @example
 * const updatedTokens = await updateUserSupabaseTokens(
 *   existingTokens,
 *   { access_token: "new_token_value", expiry_date: Date.now() + 3600000 }
 * );
 * console.log(updatedTokens.access_token); // "new_token_value"
 * console.log(updatedTokens.is_valid); // true
 */
export const updateUserSupabaseTokens = asyncHandler(
  async (
    oldTokens: TokensProps,
    newTokens: TokensProps & { token?: string | null }
  ): Promise<TokensProps> => {
    const email = oldTokens.email
    const userId = oldTokens.user_id

    if (!(email || userId)) {
      logger.error(
        "Auth: updateUserSupabaseTokens called: no email or user_id provided"
      )
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
        logger.error(
          `Auth: updateUserSupabaseTokens - failed to find user by email: ${email}`
        )
        throw new Error(
          `Failed to find user: ${userError?.message || "User not found"}`
        )
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
      logger.error(
        `Auth: updateUserSupabaseTokens called: error: ${error.message}`
      )
      throw new Error(
        `Failed to update user calendar tokens in supabase: ${error.message}`
      )
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
