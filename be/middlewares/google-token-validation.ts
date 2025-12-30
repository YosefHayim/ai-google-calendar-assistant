import type { NextFunction, Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import { asyncHandler, sendR } from "@/utils/http";
import { checkTokenExpiry, fetchGoogleTokensByEmail, type TokenExpiryStatus } from "@/utils/auth/google-token";
import type { TokensProps } from "@/types";

/**
 * Google token validation result attached to request
 */
export type GoogleTokenValidationResult = {
  tokens: TokensProps;
} & TokenExpiryStatus;

/**
 * Google Token Validation Middleware
 *
 * Validates that the user has Google Calendar tokens stored and checks their status.
 * Attaches token validation result to request for downstream middleware/handlers.
 *
 * @description
 * This middleware:
 * 1. Fetches user's Google Calendar tokens from database
 * 2. Validates tokens exist and are active
 * 3. Checks token expiry status
 * 4. Attaches validation result to req.googleTokenValidation
 *
 * @example
 * router.get('/calendar', supabaseAuth(), googleTokenValidation, googleTokenRefresh(), handler);
 */
export const googleTokenValidation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const email = req.user?.email;

  if (!email) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User email not found. Please authenticate first.");
  }

  const { data: tokens, error } = await fetchGoogleTokensByEmail(email);

  if (error) {
    console.error("Google token validation DB error:", error);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, `Database error: ${error}`);
  }

  if (!tokens) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Google Calendar not connected. Please authorize access to your calendar.");
  }

  if (!tokens.is_active) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Google Calendar access has been revoked. Please reconnect your calendar.");
  }

  if (!tokens.refresh_token) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Missing refresh token. Please reconnect your Google Calendar with full permissions.");
  }

  const expiryStatus = checkTokenExpiry(tokens.expiry_date);

  req.googleTokenValidation = {
    tokens,
    ...expiryStatus,
  };

  next();
});

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      googleTokenValidation?: GoogleTokenValidationResult;
    }
  }
}
