import { SUPABASE } from "@/config/root-config";
import { TOKEN_FIELDS } from "./storage";
import type { TokensProps } from "@/types";
import { asyncHandler } from "./asyncHandlers";

export const fetchCredentialsByEmail = asyncHandler(async (email: string): Promise<TokensProps & { created_at?: string | null }> => {
  const { data, error } = await SUPABASE.from("user_calendar_tokens")
    .select(`${TOKEN_FIELDS}, created_at`)
    .eq("email", email.trim().toLowerCase())
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Could not fetch credentials for ${email}: ${error.message}`);
  }
  if (!data || data.length === 0) {
    throw new Error(`No credentials found for ${email}`);
  }

  // Return the most recent token record (first after ordering by updated_at desc)
  return data[0] as TokensProps & { created_at?: string | null };
});
