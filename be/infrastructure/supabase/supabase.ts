import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/database.types"
import { env } from "@/config/env"

/**
 * Supabase client with service role privileges
 *
 * @description Creates a Supabase client with service role key that bypasses RLS.
 * The auth.persistSession and auth.autoRefreshToken are disabled since this is
 * a server-side client that doesn't need session management.
 */
export const SUPABASE = createClient<Database>(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
