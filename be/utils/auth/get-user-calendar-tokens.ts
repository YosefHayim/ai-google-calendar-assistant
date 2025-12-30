import { SUPABASE } from "@/config";
import { TOKEN_FIELDS } from "@/config/constants/sql";
import type { TokensProps } from "@/types";
import { asyncHandler } from "../http/async-handlers";

/**
 * Fetch credentials by email
 *
 * @param {string} email - The email of the user.
 * @returns {Promise<TokensProps>} The credentials of the user.
 * @description Fetches the credentials of the user by email and sends the response.
 * @example
 * const data = await fetchCredentialsByEmail(email);
 * console.log(data);
 */
export const fetchCredentialsByEmail = asyncHandler(async (email: string): Promise<TokensProps> => {
  const { data, error } = await SUPABASE.from("user_calendar_tokens").select(TOKEN_FIELDS).eq("email", email.trim().toLowerCase()).maybeSingle();

  if (error !== null) {
    throw new Error(`Could not fetch credentials for ${email}: ${error.message}`);
  }
  if (data === null) {
    throw new Error(`No credentials found for ${email}`);
  }
  return data as TokensProps;
});
