import type { NextFunction, Request, Response } from "express";
import { STATUS_RESPONSE, SUPABASE } from "@/config";
import { TOKEN_FIELDS } from "@/config/constants/sql";
import { asyncHandler, sendR } from "@/utils/http";
import type { TokensProps } from "@/types";

/**
 * Token validation result attached to request
 */
export type TokenValidationResult = {
  tokens: TokensProps;
  isExpired: boolean;
  isNearExpiry: boolean;
  expiresInMs: number | null;
};

// Buffer time before expiry to consider token as "near expiry" (5 minutes)
const NEAR_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

/**
 * Check if token is expired or near expiry
 *
 * @param {number | null | undefined} expiryDate - Token expiry timestamp in milliseconds
 * @returns {{ isExpired: boolean; isNearExpiry: boolean; expiresInMs: number | null }}
 */
const checkTokenExpiry = (
  expiryDate: number | null | undefined
): { isExpired: boolean; isNearExpiry: boolean; expiresInMs: number | null } => {
  if (!expiryDate) {
    // No expiry date means we can't validate - treat as potentially expired
    return { isExpired: true, isNearExpiry: true, expiresInMs: null };
  }

  const now = Date.now();
  const expiresInMs = expiryDate - now;

  return {
    isExpired: expiresInMs <= 0,
    isNearExpiry: expiresInMs > 0 && expiresInMs <= NEAR_EXPIRY_BUFFER_MS,
    expiresInMs: expiresInMs > 0 ? expiresInMs : null,
  };
};

/**
 * Token Validation Middleware
 *
 * Validates that the user has Google Calendar tokens stored and checks their status.
 * Attaches token validation result to request for downstream middleware/handlers.
 *
 * @param {Request} req - The request object (must have user attached from authHandler)
 * @param {Response} res - The response object
 * @param {NextFunction} next - The next function
 * @returns {Promise<void>}
 *
 * @description
 * This middleware:
 * 1. Fetches user's Google Calendar tokens from database
 * 2. Validates tokens exist and are active
 * 3. Checks token expiry status
 * 4. Attaches validation result to req.tokenValidation
 *
 * @example
 * // Use after authHandler in routes that need Google Calendar access
 * router.get('/calendar', authHandler, tokenValidation, tokenRefresh, calendarHandler);
 */
export const tokenValidation = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const email = req.user?.email;

  if (!email) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User email not found. Please authenticate first.");
  }

  // Fetch tokens from database
  const { data, error } = await SUPABASE.from("user_calendar_tokens")
    .select(TOKEN_FIELDS)
    .ilike("email", email.trim())
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Token validation DB error:", error.message);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, `Database error: ${error.message}`);
  }

  if (!data) {
    return sendR(
      res,
      STATUS_RESPONSE.UNAUTHORIZED,
      "Google Calendar not connected. Please authorize access to your calendar."
    );
  }

  const tokens = data as TokensProps;

  // Check if tokens are marked as active
  if (!tokens.is_active) {
    return sendR(
      res,
      STATUS_RESPONSE.UNAUTHORIZED,
      "Google Calendar access has been revoked. Please reconnect your calendar."
    );
  }

  // Check if refresh token exists (required for token refresh)
  if (!tokens.refresh_token) {
    return sendR(
      res,
      STATUS_RESPONSE.UNAUTHORIZED,
      "Missing refresh token. Please reconnect your Google Calendar with full permissions."
    );
  }

  // Check token expiry status
  const expiryStatus = checkTokenExpiry(tokens.expiry_date);

  // Attach validation result to request for downstream middleware
  req.tokenValidation = {
    tokens,
    ...expiryStatus,
  };

  next();
});

// Extend Express Request type to include tokenValidation
declare global {
  namespace Express {
    interface Request {
      tokenValidation?: TokenValidationResult;
    }
  }
}
