import { SUPABASE } from "@/config";
import type { User } from "@supabase/supabase-js";

/**
 * Supabase session validation result
 */
export type SupabaseSessionResult = {
  user: User | null;
  accessToken: string | null;
  error: string | null;
  needsRefresh: boolean;
};

/**
 * Refreshed Supabase session result
 */
export type RefreshedSupabaseSession = {
  user: User;
  accessToken: string;
};

/**
 * Validate Supabase access token and get user
 *
 * @param {string} token - Bearer token from request
 * @returns {Promise<SupabaseSessionResult>} User data or error
 */
export const validateSupabaseToken = async (token: string): Promise<SupabaseSessionResult> => {
  try {
    const { data, error } = await SUPABASE.auth.getUser(token);

    if (error) {
      // Check if error indicates token needs refresh
      const needsRefresh = error.message.includes("expired") || error.message.includes("invalid") || error.status === 401;

      return {
        user: null,
        accessToken: null,
        error: error.message,
        needsRefresh,
      };
    }

    return {
      user: data.user,
      accessToken: token,
      error: null,
      needsRefresh: false,
    };
  } catch (e) {
    const err = e as Error;
    return {
      user: null,
      accessToken: null,
      error: err.message || "Token validation failed",
      needsRefresh: true,
    };
  }
};

/**
 * Refresh Supabase session using refresh token
 *
 * @param {string} refreshToken - Refresh token from client
 * @returns {Promise<RefreshedSupabaseSession>} New session data
 * @throws {Error} If refresh fails
 */
export const refreshSupabaseSession = async (refreshToken: string): Promise<RefreshedSupabaseSession> => {
  const { data, error } = await SUPABASE.auth.refreshSession({ refresh_token: refreshToken });

  if (error) {
    console.error("Supabase session refresh failed:", error.message);
    throw new Error(`SESSION_REFRESH_FAILED: ${error.message}`);
  }

  if (!data.session || !data.user) {
    throw new Error("SESSION_REFRESH_FAILED: No session returned");
  }

  return {
    user: data.user,
    accessToken: data.session.access_token,
  };
};

/**
 * Set Supabase session from tokens
 * Used when client provides both access and refresh tokens
 *
 * @param {string} accessToken - Current access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<RefreshedSupabaseSession>} Session data
 */
export const setSupabaseSession = async (accessToken: string, refreshToken: string): Promise<RefreshedSupabaseSession> => {
  const { data, error } = await SUPABASE.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    console.error("Supabase set session failed:", error.message);
    throw new Error(`SESSION_SET_FAILED: ${error.message}`);
  }

  if (!data.session || !data.user) {
    throw new Error("SESSION_SET_FAILED: No session returned");
  }

  return {
    user: data.user,
    accessToken: data.session.access_token,
  };
};
