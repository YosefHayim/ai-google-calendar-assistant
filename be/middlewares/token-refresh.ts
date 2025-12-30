import type { NextFunction, Request, Response } from "express";
import { OAUTH2CLIENT, STATUS_RESPONSE, SUPABASE } from "@/config";
import { asyncHandler, sendR } from "@/utils/http";

import type { TokensProps } from "@/types";

/**
 * Refreshed token result
 */
type RefreshedTokenResult = {
  accessToken: string;
  expiryDate: number;
};

/**
 * Refresh access token using Google OAuth2 client
 *
 * @param {TokensProps} tokens - The user's current tokens
 * @returns {Promise<RefreshedTokenResult>} The refreshed token data
 * @throws {Error} If refresh fails (e.g., invalid_grant - refresh token expired)
 */
const refreshGoogleAccessToken = async (tokens: TokensProps): Promise<RefreshedTokenResult> => {
  // Set credentials on OAuth client
  OAUTH2CLIENT.setCredentials({
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token,
  });

  try {
    // Force token refresh
    const { credentials } = await OAUTH2CLIENT.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error("No access token received from Google");
    }

    return {
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date ?? Date.now() + 3600 * 1000, // Default to 1 hour if not provided
    };
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: string; error_description?: string } }; message?: string };
    const data = err?.response?.data;
    const errorType = data?.error || "unknown_error";
    const errorDesc = data?.error_description || err?.message || "Token refresh failed";

    // Log the error for debugging
    console.error("Google token refresh failed:", { errorType, errorDesc, email: tokens.email });

    // Check if it's an invalid_grant error (refresh token expired/revoked)
    if (errorType === "invalid_grant") {
      throw new Error(`REAUTH_REQUIRED: ${errorDesc}`);
    }

    throw new Error(`TOKEN_REFRESH_FAILED: ${errorDesc}`);
  }
};

/**
 * Persist refreshed tokens to database
 *
 * @param {string} email - User's email
 * @param {RefreshedTokenResult} refreshedTokens - The new token data
 * @returns {Promise<void>}
 */
const persistRefreshedTokens = async (email: string, refreshedTokens: RefreshedTokenResult): Promise<void> => {
  const { error } = await SUPABASE.from("user_calendar_tokens")
    .update({
      access_token: refreshedTokens.accessToken,
      expiry_date: refreshedTokens.expiryDate,
      updated_at: new Date().toISOString(),
    })
    .ilike("email", email.trim());

  if (error) {
    console.error("Failed to persist refreshed tokens:", error.message);
    throw new Error(`Failed to save refreshed tokens: ${error.message}`);
  }
};

/**
 * Token Refresh Middleware Factory
 *
 * Creates middleware that refreshes Google Calendar access tokens.
 * Must be used after tokenValidation middleware which attaches token validation result.
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.force - Always refresh token regardless of expiry status (default: false)
 * @returns {Function} Express middleware function
 *
 * @description
 * This middleware:
 * 1. Checks if token refresh is needed (expired, near expiry, or force=true)
 * 2. Refreshes tokens using Google OAuth2 client
 * 3. Persists new tokens to database
 * 4. Updates req.tokenValidation with fresh tokens
 *
 * Error handling:
 * - REAUTH_REQUIRED: Refresh token expired/revoked - user must re-authenticate
 * - TOKEN_REFRESH_FAILED: Transient error - can retry
 *
 * @example
 * // Conditional refresh (only when expired or near expiry)
 * router.get('/calendar', authHandler, tokenValidation, tokenRefresh(), calendarHandler);
 *
 * // Force refresh (always get fresh token)
 * router.get('/calendar', authHandler, tokenValidation, tokenRefresh({ force: true }), calendarHandler);
 */
export const tokenRefresh = (options: { force?: boolean } = {}) => {
  const { force = false } = options;

  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const validation = req.tokenValidation;

    // Ensure tokenValidation middleware ran first
    if (!validation) {
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Token validation required before refresh. Ensure tokenValidation middleware runs first.");
    }

    const { tokens, isExpired, isNearExpiry } = validation;

    // Skip refresh only if token is valid, not near expiry, AND force is false
    if (!force && !isExpired && !isNearExpiry) {
      return next();
    }

    const email = tokens.email;
    if (!email) {
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "User email missing from tokens");
    }

    console.log(`Token refresh triggered for ${email} - force: ${force}, expired: ${isExpired}, nearExpiry: ${isNearExpiry}`);

    try {
      // Refresh the access token
      const refreshedTokens = await refreshGoogleAccessToken(tokens);

      // Persist to database
      await persistRefreshedTokens(email, refreshedTokens);

      // Update the request with new token data
      req.tokenValidation = {
        tokens: {
          ...tokens,
          access_token: refreshedTokens.accessToken,
          expiry_date: refreshedTokens.expiryDate,
        },
        isExpired: false,
        isNearExpiry: false,
        expiresInMs: refreshedTokens.expiryDate - Date.now(),
      };

      console.log(`Token refreshed successfully for ${email}, expires in ${Math.round((refreshedTokens.expiryDate - Date.now()) / 1000 / 60)} minutes`);

      next();
    } catch (error) {
      const err = error as Error;
      const message = err.message || "Token refresh failed";

      // Handle re-authentication required
      if (message.startsWith("REAUTH_REQUIRED:")) {
        // Mark tokens as inactive in database
        await SUPABASE.from("user_calendar_tokens").update({ is_active: false, updated_at: new Date().toISOString() }).ilike("email", email.trim());

        return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Google Calendar session expired. Please reconnect your calendar.", { code: "REAUTH_REQUIRED" });
      }

      // Handle other refresh failures
      console.error("Token refresh middleware error:", message);
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, `Token refresh failed: ${message}`);
    }
  });
};
