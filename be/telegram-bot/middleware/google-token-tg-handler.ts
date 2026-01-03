import {
  checkTokenExpiry,
  deactivateGoogleTokens,
  fetchGoogleTokensByEmail,
  generateGoogleAuthUrl,
  persistGoogleTokens,
  refreshGoogleAccessToken,
} from "@/utils/auth";

import type { GlobalContext } from "../init-bot";
import type { MiddlewareFn } from "grammy";
import type { TokensProps } from "@/types";

/**
 * Validation result for Google Calendar tokens
 */
type TelegramTokenValidationResult = {
  tokens: TokensProps;
  isExpired: boolean;
  isNearExpiry: boolean;
  expiresInMs: number | null;
};

/**
 * Validate Google Calendar tokens for Telegram user
 * Returns validated tokens or null if auth is required
 */
const validateGoogleTokens = async (ctx: GlobalContext, email: string): Promise<TelegramTokenValidationResult | null> => {
  const { data: tokens, error } = await fetchGoogleTokensByEmail(email);

  if (error) {
    console.error("Telegram: Google token validation DB error:", error);
    await ctx.reply("Error checking your calendar connection. Please try again.");
    return null;
  }

  if (!tokens) {
    // First-time authentication - force consent screen
    const authUrl = generateGoogleAuthUrl({ forceConsent: true });
    await ctx.reply(`To help you manage your calendar, I need access to your Google Calendar. Please authorize:\n\n${authUrl}`);
    return null;
  }

  if (!tokens.is_active) {
    // Re-authentication required - force consent screen
    const authUrl = generateGoogleAuthUrl({ forceConsent: true });
    await ctx.reply(`Your Google Calendar access has been revoked. Please reconnect:\n\n${authUrl}`);
    return null;
  }

  if (!tokens.refresh_token) {
    // Missing refresh token - force consent screen to get one
    const authUrl = generateGoogleAuthUrl({ forceConsent: true });
    await ctx.reply(`Missing calendar permissions. Please reconnect with full access:\n\n${authUrl}`);
    return null;
  }

  const expiryStatus = checkTokenExpiry(tokens.expiry_date);

  return {
    tokens,
    ...expiryStatus,
  };
};

/**
 * Refresh Google Calendar tokens if expired or near expiry
 * Returns refreshed tokens or null if reauth is required
 */
const refreshGoogleTokensIfNeeded = async (ctx: GlobalContext, validation: TelegramTokenValidationResult): Promise<TelegramTokenValidationResult | null> => {
  const { tokens, isExpired, isNearExpiry } = validation;

  // Token is still valid - no refresh needed
  if (!isExpired && !isNearExpiry) {
    return validation;
  }

  const email = tokens.email;
  if (!email) {
    console.error("Telegram: User email missing from tokens");
    await ctx.reply("Error with your calendar connection. Please try again.");
    return null;
  }

  try {
    const refreshedTokens = await refreshGoogleAccessToken(tokens);
    await persistGoogleTokens(email, refreshedTokens);

    const result: TelegramTokenValidationResult = {
      tokens: {
        ...tokens,
        access_token: refreshedTokens.accessToken,
        expiry_date: refreshedTokens.expiryDate,
      },
      isExpired: false,
      isNearExpiry: false,
      expiresInMs: refreshedTokens.expiryDate - Date.now(),
    };

    return result;
  } catch (error) {
    const err = error as Error;
    const message = err.message || "Token refresh failed";

    if (message.startsWith("REAUTH_REQUIRED:")) {
      await deactivateGoogleTokens(email);
      // Re-authentication required - force consent screen
      const authUrl = generateGoogleAuthUrl({ forceConsent: true });
      await ctx.reply(`Your Google Calendar session has expired. Please reconnect:\n\n${authUrl}`);
      return null;
    }

    console.error("Telegram: Google token refresh error:", message);
    await ctx.reply("Error refreshing your calendar connection. Please try again.");
    return null;
  }
};

/**
 * Google Token Validation and Refresh Middleware for Telegram
 *
 * Validates that the user has valid Google Calendar tokens and refreshes if needed.
 * Must be used after authTgHandler middleware (requires session.email to be set).
 *
 * @description
 * This middleware:
 * 1. Fetches user's Google Calendar tokens from database
 * 2. Validates tokens exist, are active, and have refresh_token
 * 3. Checks token expiry status (5 min buffer for near-expiry)
 * 4. Refreshes tokens if expired or near expiry
 * 5. Stores validated tokens in session.googleTokens
 * 6. Handles REAUTH_REQUIRED by deactivating tokens and prompting user
 */
export const googleTokenTgHandler: MiddlewareFn<GlobalContext> = async (ctx, next) => {
  const email = ctx.session?.email;

  // Skip if no email in session (authTgHandler should have set this)
  if (!email) {
    return next();
  }

  // Step 1: Validate tokens exist and are active
  const validation = await validateGoogleTokens(ctx, email);
  if (!validation) {
    return; // Stop here until user authorizes Google Calendar
  }

  // Step 2: Refresh tokens if expired or near expiry
  const refreshedValidation = await refreshGoogleTokensIfNeeded(ctx, validation);
  if (!refreshedValidation) {
    return; // Stop here until user re-authorizes
  }

  // Step 3: Store validated tokens in session for agent usage
  ctx.session.googleTokens = refreshedValidation.tokens;

  return next();
};
