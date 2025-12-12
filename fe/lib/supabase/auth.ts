/**
 * Supabase Auth Utilities
 * Helper functions for authentication operations
 */

import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getOAuthRedirectUrl } from "./config";

export type OAuthProvider = "google" | "github";

/**
 * Initiate OAuth sign-in flow
 */
export async function signInWithOAuth(
  supabase: SupabaseClient<Database>,
  provider: OAuthProvider,
  options?: {
    redirectTo?: string;
    next?: string;
    origin?: string;
  }
) {
  // For server-side, use provided redirectTo or construct from origin
  // For client-side, use window.location.origin
  const origin = options?.origin || (typeof window !== "undefined" ? window.location.origin : "");
  const redirectTo = options?.redirectTo || getOAuthRedirectUrl(origin, options?.next);

  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });
}

/**
 * Sign in with email and password
 */
export async function signInWithPassword(supabase: SupabaseClient<Database>, email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Sign up with email and password
 */
export async function signUp(supabase: SupabaseClient<Database>, email: string, password: string, metadata?: Record<string, unknown>) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
}

/**
 * Sign out current user
 */
export async function signOut(supabase: SupabaseClient<Database>) {
  return supabase.auth.signOut();
}

/**
 * Get current session
 */
export async function getSession(supabase: SupabaseClient<Database>) {
  return supabase.auth.getSession();
}

/**
 * Get current user
 */
export async function getUser(supabase: SupabaseClient<Database>) {
  return supabase.auth.getUser();
}
