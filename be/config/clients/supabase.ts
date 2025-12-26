import type { Database } from "@/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { env } from "../env";

export const SUPABASE = new SupabaseClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey);
