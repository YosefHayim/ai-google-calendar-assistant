import type { NextFunction, Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import {
  deactivateGoogleTokens,
  persistGoogleTokens,
  refreshGoogleAccessToken,
} from "@/utils/auth/google-token";
import { reqResAsyncHandler, sendR } from "@/utils/http";

export type GoogleTokenRefreshOptions = {
  force?: boolean;
};

/**
 * Google Token Refresh Middleware Factory
 *
 * Creates middleware that refreshes Google Calendar access tokens.
 * Must be used after googleTokenValidation middleware.
 *
 * @param {GoogleTokenRefreshOptions} options - Configuration options
 * @param {boolean} options.force - Always refresh token regardless of expiry status (default: false)
 *
 * @description
 * This middleware:
 * 1. Checks if token refresh is needed (expired, near expiry, or force=true)
 * 2. Refreshes tokens using Google OAuth2 client
 * 3. Persists new tokens to database
 * 4. Updates req.googleTokenValidation with fresh tokens
 *
 * @example
 * // Conditional refresh (only when expired or near expiry)
 * router.get('/calendar', supabaseAuth(), googleTokenValidation, googleTokenRefresh(), handler);
 *
 * // Force refresh (always get fresh token)
 * router.get('/calendar', supabaseAuth(), googleTokenValidation, googleTokenRefresh({ force: true }), handler);
 */
export const googleTokenRefresh = (options: GoogleTokenRefreshOptions = {}) => {
  const { force = false } = options;

  return reqResAsyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const validation = req.googleTokenValidation;

      if (!validation) {
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Google token validation required before refresh. Ensure googleTokenValidation middleware runs first."
        );
      }

      const { tokens, isExpired, isNearExpiry } = validation;

      // Skip refresh if token is valid, not near expiry, AND force is false
      if (!(force || isExpired || isNearExpiry)) {
        return next();
      }

      const email = tokens.email;
      if (!email) {
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "User email missing from tokens"
        );
      }

      try {
        const refreshedTokens = await refreshGoogleAccessToken(tokens);
        await persistGoogleTokens(email, refreshedTokens);

        req.googleTokenValidation = {
          tokens: {
            ...tokens,
            access_token: refreshedTokens.accessToken,
            expiry_date: refreshedTokens.expiryDate,
          },
          isExpired: false,
          isNearExpiry: false,
          expiresInMs: refreshedTokens.expiryDate - Date.now(),
        };

        next();
      } catch (error) {
        const err = error as Error;
        const message = err.message || "Token refresh failed";

        if (message.startsWith("REAUTH_REQUIRED:")) {
          await deactivateGoogleTokens(email);
          return sendR(
            res,
            STATUS_RESPONSE.UNAUTHORIZED,
            "Google Calendar session expired. Please reconnect your calendar.",
            {
              code: "GOOGLE_REAUTH_REQUIRED",
            }
          );
        }

        console.error("Google token refresh error:", message);
        await deactivateGoogleTokens(email);
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          `Google token refresh failed: ${message}`,
          {
            code: "GOOGLE_TOKEN_REFRESH_FAILED",
          }
        );
      }
    }
  );
};
