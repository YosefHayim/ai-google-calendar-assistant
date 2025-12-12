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

import { ROUTES } from "@/lib/constants";

/**
 * Get OAuth redirect URL
 */
export const getOAuthRedirectUrl = (origin: string, next?: string): string => {
  const nextPath = next || ROUTES.DASHBOARD;
  return `${origin}${ROUTES.AUTH.CALLBACK}?next=${encodeURIComponent(nextPath)}`;
};
