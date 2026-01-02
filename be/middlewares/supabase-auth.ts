import type { NextFunction, Request, Response } from "express";
import { asyncHandler, sendR } from "@/utils/http";
import { refreshSupabaseSession, validateSupabaseToken } from "@/utils/auth/supabase-token";

import { STATUS_RESPONSE } from "@/config";
import type { User } from "@supabase/supabase-js";

const REFRESH_TOKEN_HEADER = "refresh_token";
const ACCESS_TOKEN_HEADER = "access_token";
const USER_KEY = "user";

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

  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    if (!accessToken) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Missing authorization header");
    }

    // Validate current token
    const validation = await validateSupabaseToken(accessToken);

    // Token is valid - attach user and continue
    if (validation.user) {
      req.user = validation.user;
      return next();
    }

    // Token invalid - check if we should try refresh
    if (!autoRefresh || !validation.needsRefresh) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Not authorized. Please login or register to continue.");
    }

    // Try to refresh using refresh token from header
    const refreshToken = req.headers[REFRESH_TOKEN_HEADER] as string | undefined;

    if (!refreshToken) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Session expired. Please login again.", {
        code: "SESSION_EXPIRED",
      });
    }

    console.log("Supabase token expired, attempting refresh...");

    try {
      // inside try block
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = await refreshSupabaseSession(refreshToken); // passing the OLD one

      req.user = user;

      // Update current request for downstream use
      req.headers.authorization = `Bearer ${newAccessToken}`;

      // Send NEW tokens to client
      res.setHeader(ACCESS_TOKEN_HEADER, newAccessToken);
      res.setHeader(REFRESH_TOKEN_HEADER, newRefreshToken);

      next();
    } catch (error) {
      const err = error as Error;
      console.error("Supabase session refresh failed:", err.message);

      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Session expired. Please login again.", {
        code: "SESSION_REFRESH_FAILED",
      });
    }
  });
};

// Extend Express Request type (User is already declared in auth-handler, keeping for clarity)
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
