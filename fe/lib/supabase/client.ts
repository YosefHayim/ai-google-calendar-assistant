/**
 * Supabase Client for Browser
 * Creates a singleton Supabase client for use in Client Components
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { SUPABASE_CONFIG } from "./config";

let client: ReturnType<typeof createSupabaseClient<Database>> | null = null;

/**
 * Get or create Supabase client instance
 * Uses singleton pattern to ensure only one client instance exists
 */
export function createClient() {
  if (!client) {
    client = createSupabaseClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return client;
}
