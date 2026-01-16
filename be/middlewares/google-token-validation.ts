import type { NextFunction, Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import type { TokensProps } from "@/types";
import {
  checkTokenExpiry,
  fetchGoogleTokensByEmail,
  type TokenExpiryStatus,
} from "@/utils/auth/google-token";
import { reqResAsyncHandler, sendR } from "@/utils/http";

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
 * Uses the new schema: users + oauth_tokens tables
 *
 * @description
 * This middleware:
 * 1. Fetches user's Google Calendar tokens from database
 * 2. Validates tokens exist and are valid
 * 3. Checks token expiry status
 * 4. Attaches validation result to req.googleTokenValidation
 *
 * @example
 * router.get('/calendar', supabaseAuth(), googleTokenValidation, googleTokenRefresh(), handler);
 */
export const googleTokenValidation = reqResAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.user?.email;
    if (!email) {
      return sendR(
        res,
        STATUS_RESPONSE.UNAUTHORIZED,
        "User email not found. Please authenticate first."
      );
    }

    // Normalize email for consistent lookup
    const normalizedEmail = email.toLowerCase().trim();

    const { data: tokens, error } =
      await fetchGoogleTokensByEmail(normalizedEmail);

    if (error) {
      console.error(
        `[Token Validation] DB error for ${normalizedEmail}:`,
        error
      );
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        `Database error: ${error}`
      );
    }

    if (!tokens) {
      return sendR(
        res,
        STATUS_RESPONSE.UNAUTHORIZED,
        "Google Calendar not connected. Please authorize access to your calendar."
      );
    }

    // Check is_valid (new schema) or is_active (backwards compatibility)
    const isValid = tokens.is_valid ?? tokens.is_active;
    if (!isValid) {
      return sendR(
        res,
        STATUS_RESPONSE.UNAUTHORIZED,
        "Google Calendar access has been revoked. Please reconnect your calendar."
      );
    }

    if (!tokens.refresh_token) {
      return sendR(
        res,
        STATUS_RESPONSE.UNAUTHORIZED,
        "Missing refresh token. Please reconnect your Google Calendar with full permissions."
      );
    }

    // Check expiry using expires_at (new) or expiry_date (legacy)
    const expiryValue =
      tokens.expiry_date ??
      (tokens.expires_at ? new Date(tokens.expires_at).getTime() : null);
    const expiryStatus = checkTokenExpiry(expiryValue);

    req.googleTokenValidation = {
      tokens,
      ...expiryStatus,
    };

    next();
  }
);
