import type { TokensProps } from "@/types"
import { asyncHandler } from "@/lib/http/async-handlers"
import { userRepository } from "@/lib/repositories/UserRepository"

/**
 * @description Fetches the Google Calendar OAuth credentials for a user by their email address.
 * This function retrieves the stored OAuth tokens required to access the user's Google Calendar.
 * Throws an error if the user is not found or has no associated tokens.
 *
 * @param {string} email - The email address of the user whose credentials should be fetched.
 * @returns {Promise<TokensProps>} A promise that resolves to the user's OAuth tokens including
 *   access_token, refresh_token, expiry_date, and other token metadata.
 * @throws {Error} If the user is not found or has no valid Google tokens.
 *
 * @example
 * // Fetch tokens for a user
 * const tokens = await fetchCredentialsByEmail("user@example.com");
 * console.log(tokens.access_token);
 */
export const fetchCredentialsByEmail = asyncHandler(
  (email: string): Promise<TokensProps> =>
    userRepository.findUserWithGoogleTokensOrThrow(email)
)
