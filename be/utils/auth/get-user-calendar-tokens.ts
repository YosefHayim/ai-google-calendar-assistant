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
 *
 */
export const fetchCredentialsByEmail = asyncHandler(async (email: string): Promise<TokensProps> => {
  // Use ilike for safety, and maybeSingle to handle 0 or 1 result gracefully
  const { data, error } = await SUPABASE.from("user_calendar_tokens")
    .select(TOKEN_FIELDS)
    .ilike("email", email.trim()) // ilike ignores case distinctions
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`DB Error: ${error.message}`);
  }
  if (!data) {
    throw new Error(`No credentials found for ${email}`);
  }
  return data as TokensProps;
});
