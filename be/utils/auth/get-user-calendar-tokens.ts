import { SUPABASE } from "@/config";
import { TOKEN_FIELDS } from "./constants";
import type { TokensProps } from "@/types";
import { asyncHandler } from "../http/async-handlers";

export const fetchCredentialsByEmail = asyncHandler(async (email: string): Promise<TokensProps> => {
  const { data, error } = await SUPABASE.from("user_calendar_tokens")
    .select(TOKEN_FIELDS)
    .eq("email", email.trim().toLowerCase())
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not fetch credentials for ${email}: ${error.message}`);
  }
  if (!data) {
    throw new Error(`No credentials found for ${email}`);
  }
  return data as TokensProps;
});
