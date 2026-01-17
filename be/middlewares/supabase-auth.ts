import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from "@/utils/auth/cookie-utils";
import type { NextFunction, Request, Response } from "express";
import { STATUS_RESPONSE, SUPABASE } from "@/config";
import { refreshSupabaseSession, validateSupabaseToken } from "@/utils/auth/supabase-token";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import type { User } from "@supabase/supabase-js";

const REFRESH_TOKEN_HEADER = "refresh_token";
const ACCESS_TOKEN_HEADER = "access_token";
const _USER_KEY = "user";

export type SupabaseAuthOptions = {
  autoRefresh?: boolean;
};

/**
 * Supabase Auth Middleware Factory
 *
 * Validates Supabase access token and optionally refreshes expired sessions.
 *
 * @param {SupabaseAuthOptions} options - Configuration options
 * @param {boolean} options.autoRefresh - Auto-refresh expired tokens if refresh token provided (default: true)
 *
 * @description
 * This middleware:
 * 1. Extracts Bearer token from Authorization header
 * 2. Validates token with Supabase
 * 3. If invalid and autoRefresh=true, attempts refresh using refresh_token header
 * 4. Attaches user to req.user
 * 5. Returns new access token in access_token header if refreshed
 *
 * @example
 * // With auto-refresh (default)
 * router.use(supabaseAuth());
 *
 * // Without auto-refresh
 * router.use(supabaseAuth({ autoRefresh: false }));
 */
export const supabaseAuth = (options: SupabaseAuthOptions = {}) => {
  const { autoRefresh = true } = options;

  return reqResAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Token extraction priority: Cookie first, then Authorization header
    const authHeader = req.headers.authorization;
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE] || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined);

    if (!accessToken) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Missing authorization header or cookie");
    }

    // Validate current token
    const validation = await validateSupabaseToken(accessToken);

    if (validation.user) {
      const { data: dbUser } = await SUPABASE.from("users").select("id, status").eq("id", validation.user.id).single();

      // If user exists in Supabase Auth but NOT in our database,
      // they likely deleted their account and are trying to access with stale tokens.
      // Do NOT auto-create them - require fresh OAuth registration.
      if (!dbUser) {
        // Clear stale cookies to prevent further issues
        clearAuthCookies(res);

        return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Account not found. Please sign up again to create a new account.", { code: "ACCOUNT_NOT_FOUND" });
      }

      if (dbUser.status !== "active") {
        return sendR(res, STATUS_RESPONSE.FORBIDDEN, "Your account has been deactivated.", { code: "ACCOUNT_DEACTIVATED" });
      }

      req.user = validation.user;
      return next();
    }

    // Token invalid - check if we should try refresh
    if (!(autoRefresh && validation.needsRefresh)) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Not authorized. Please login or register to continue.");
    }

    // Try to refresh using refresh token from cookie first, then header
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE] || (req.headers[REFRESH_TOKEN_HEADER] as string | undefined);

    if (!refreshToken) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Session expired. Please login again.", {
        code: "SESSION_EXPIRED",
      });
    }

    const userEmail = req.user?.email;

    try {
      // Refresh the session using the refresh token
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = await refreshSupabaseSession(refreshToken);

      // Validate that user and email are present after refresh
      if (!user) {
        console.error("[Supabase Auth] Refresh succeeded but no user returned");
        throw new Error("No user returned from refresh");
      }

      if (!user.email) {
        console.error(`[Supabase Auth] Refresh succeeded but user has no email. User ID: ${user.id}`);
        throw new Error("User email missing after refresh");
      }

      // Log successful refresh with email for debugging

      // Set user on request object for downstream middleware
      req.user = user;

      // Update current request for downstream use
      req.headers.authorization = `Bearer ${newAccessToken}`;

      // Set cookies for web browsers (this includes the new refresh token)
      setAuthCookies(res, newAccessToken, newRefreshToken, user);

      // Also send tokens in headers for API/mobile clients
      res.setHeader(ACCESS_TOKEN_HEADER, newAccessToken);
      res.setHeader(REFRESH_TOKEN_HEADER, newRefreshToken);

      next();
    } catch (error) {
      const err = error as Error;
      console.error(`[Supabase Auth] Session refresh failed for user: ${userEmail || "unknown"}`, err.message);
      console.error("[Supabase Auth] Refresh error details:", {
        message: err.message,
        stack: err.stack,
      });

      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Session expired. Please login again.", {
        code: "SESSION_REFRESH_FAILED",
      });
    }
  });
};
