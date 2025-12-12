/**
 * Supabase Middleware Utilities
 * Helper functions for Next.js middleware integration
 */

import { AUTH_HEADERS } from "@/lib/constants";
import type { Database } from "@/lib/supabase/database.types";
import { SUPABASE_CONFIG } from "./config";
import { createClient } from "@supabase/supabase-js";

/**
 * Create Supabase client for middleware
 * Middleware runs on edge runtime, so we use a simpler client setup
 */
export function createMiddlewareClient(request: Request) {
  const requestUrl = new URL(request.url);
  const accessToken = request.headers.get("authorization")?.replace(AUTH_HEADERS.BEARER_PREFIX, "");

  return createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    global: {
      headers: accessToken ? { Authorization: `${AUTH_HEADERS.BEARER_PREFIX}${accessToken}` } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
