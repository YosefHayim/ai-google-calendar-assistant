/**
 * Supabase Middleware Utilities
 * Helper functions for Next.js middleware integration
 */

import type { Database } from "@/lib/supabase/database.types";
import { SUPABASE_CONFIG } from "./config";
import { createClient } from "@supabase/supabase-js";

/**
 * Create Supabase client for middleware
 * Middleware runs on edge runtime, so we use a simpler client setup
 */
export function createMiddlewareClient(request: Request) {
  const requestUrl = new URL(request.url);
  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

  return createClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
