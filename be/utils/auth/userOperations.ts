import { SUPABASE } from "@/config/root-config";

/**
 * Finds user by email
 */
export async function findUserByEmail(email: string) {
  return await SUPABASE.from("user_calendar_tokens").select("email").eq("email", email);
}

/**
 * Deactivates user by email
 */
export async function deactivateUserByEmail(email: string) {
  return await SUPABASE.from("user_calendar_tokens")
    .update({ is_active: false })
    .eq("email", email);
}
