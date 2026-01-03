import { SUPABASE } from "@/config";
import type { TokensProps } from "@/types";
import { asyncHandler } from "../http/async-handlers";
import { logger } from "../logger";

/**
 * Update tokens of user in Supabase
 *
 * @param {TokensProps} oldTokens - The old tokens of the user.
 * @param {TokensProps & { token?: string | null }} newTokens - The new tokens of the user.
 * @returns {Promise<TokensProps>} The updated tokens of the user in Supabase.
 * @description Updates the tokens of the user in Supabase and sends the response.
 */
export const updateUserSupabaseTokens = asyncHandler(
  async (oldTokens: TokensProps, newTokens: TokensProps & { token?: string | null }): Promise<TokensProps> => {
    logger.info(`Auth: updateUserSupabaseTokens called: oldTokens: ${oldTokens}`);
    logger.info(`Auth: updateUserSupabaseTokens called: newTokens: ${newTokens}`);
    const updatedTokens = {
      ...oldTokens,
      access_token: newTokens.token,
      expiry_date: newTokens.expiry_date,
    };
    const { error } = await SUPABASE.from("user_calendar_tokens").update(updatedTokens).eq("email", oldTokens.email!);
    logger.info(`Auth: updateUserSupabaseTokens called: error: ${error}`);
    if (error) {
      logger.error(`Auth: updateUserSupabaseTokens called: error: ${error.message}`);
      throw new Error(`Failed to update user calendar tokens in supabase: ${error.message}`);
    }
    logger.info(`Auth: updateUserSupabaseTokens called: updatedTokens: ${updatedTokens}`);
    return updatedTokens;
  }
);
