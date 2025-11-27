/**
 * Supabase Configuration
 * Centralized configuration for Supabase client initialization
 */

const getSupabaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }
  return url;
};

const getSupabaseAnonKey = (): string => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
  }
  return key;
};

export const SUPABASE_CONFIG = {
  url: getSupabaseUrl(),
  anonKey: getSupabaseAnonKey(),
} as const;

/**
 * Get OAuth redirect URL
 */
export const getOAuthRedirectUrl = (origin: string, next = "/dashboard"): string => {
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
};
