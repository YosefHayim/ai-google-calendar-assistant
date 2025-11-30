import { SUPABASE } from "@/config/root-config";
import type { TokensProps } from "@/types";

/**
 * Stores or updates user calendar tokens in database
 */
export async function storeUserTokens(email: string, tokens: TokensProps) {
  const {
    id_token,
    refresh_token,
    refresh_token_expires_in,
    expiry_date,
    access_token,
    token_type,
    scope,
  } = tokens;

  const { data, error } = await SUPABASE.from("user_calendar_tokens")
    .update({
      refresh_token_expires_in,
      refresh_token,
      expiry_date,
      access_token,
      token_type,
      id_token,
      scope,
      is_active: true,
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("email", email)
    .select();

  return { data, error };
}
