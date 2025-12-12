/**
 * Supabase Client for Server
 * Creates a Supabase client for use in Server Components and Route Handlers
 */

import { COOKIE_NAMES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/database.types";
import { SUPABASE_CONFIG } from "./config";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Get or create Supabase client for server-side usage
 * Handles session management via cookies
 */
export async function createClient() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  const refreshToken = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;

  const client = createSupabaseClient<Database>(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: (key: string) => {
          if (key.includes("access-token")) return accessToken || null;
          if (key.includes("refresh-token")) return refreshToken || null;
          return null;
        },
        setItem: () => {
          // Server-side: cookies are set via NextResponse
        },
        removeItem: () => {
          // Server-side: cookies are removed via NextResponse
        },
      },
    },
  });

  return client;
}
