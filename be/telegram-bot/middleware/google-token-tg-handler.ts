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
import { logger } from "@/utils/logger";

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
  logger.info(`Telegram Bot: Google Token: validateGoogleTokens middleware called: ${email}`);
  const { data: tokens, error } = await fetchGoogleTokensByEmail(email);
  logger.info(`Telegram Bot: Google Token: validateGoogleTokens middleware tokens: ${tokens}`);
  if (error) {
    logger.error(`Telegram Bot: Google Token: validateGoogleTokens middleware error: ${error}`);
    console.error(`Telegram Bot: Google Token: validateGoogleTokens middleware error: ${error}`);
    await ctx.reply("Error checking your calendar connection. Please try again.");
    return null;
  }

  if (!tokens) {
    logger.info(`Telegram Bot: Google Token: validateGoogleTokens middleware tokens not found`);
    // First-time authentication - force consent screen
    const authUrl = generateGoogleAuthUrl({ forceConsent: true });
    await ctx.reply(`To help you manage your calendar, I need access to your Google Calendar. Please authorize:\n\n${authUrl}`);
    return null;
  }

  if (!tokens.is_active) {
    logger.info(`Telegram Bot: Google Token: validateGoogleTokens middleware tokens not active`);
    // Re-authentication required - force consent screen
    const authUrl = generateGoogleAuthUrl({ forceConsent: true });
    await ctx.reply(`Your Google Calendar access has been revoked. Please reconnect:\n\n${authUrl}`);
    return null;
  }

  if (!tokens.refresh_token) {
    logger.info(`Telegram Bot: Google Token: validateGoogleTokens middleware tokens refresh token missing`);
    // Missing refresh token - force consent screen to get one
    const authUrl = generateGoogleAuthUrl({ forceConsent: true });
    await ctx.reply(`Missing calendar permissions. Please reconnect with full access:\n\n${authUrl}`);
    return null;
  }

  const expiryStatus = checkTokenExpiry(tokens.expiry_date);
  logger.info(`Telegram Bot: Google Token: validateGoogleTokens middleware expiry status: ${expiryStatus}`);
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
  logger.info(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware called: ${validation}`);
  const { tokens, isExpired, isNearExpiry } = validation;
  logger.info(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware tokens: ${tokens}`);
  logger.info(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware isExpired: ${isExpired}`);
  logger.info(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware isNearExpiry: ${isNearExpiry}`);

  // Token is still valid - no refresh needed
  if (!isExpired && !isNearExpiry) {
    logger.info(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware no refresh needed`);
    return validation;
  }

  const email = tokens.email;
  if (!email) {
    logger.error(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware user email missing from tokens`);
    await ctx.reply("Error with your calendar connection. Please try again.");
    return null;
  }

  try {
    logger.info(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware refreshing tokens: ${email}`);
    const refreshedTokens = await refreshGoogleAccessToken(tokens);
    logger.info(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware refreshed tokens: ${refreshedTokens}`);
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
    logger.info(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware result: ${result}`);
    return result;
  } catch (error) {
    const err = error as Error;
    logger.error(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware error: ${error}`);
    const message = err.message || "Token refresh failed";

    if (message.startsWith("REAUTH_REQUIRED:")) {
      logger.info(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware reauth required: ${email}`);
      await deactivateGoogleTokens(email);
      // Re-authentication required - force consent screen
      const authUrl = generateGoogleAuthUrl({ forceConsent: true });
      await ctx.reply(`Your Google Calendar session has expired. Please reconnect:\n\n${authUrl}`);
      return null;
    }

    logger.error(`Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware error: ${message}`);
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
  logger.info(`Telegram Bot: Google Token: googleTokenTgHandler middleware called`);
  const email = ctx.session?.email;
  logger.info(`Telegram Bot: Google Token: googleTokenTgHandler middleware email: ${email}`);

  // Skip if no email in session (authTgHandler should have set this)
  if (!email) {
    logger.info(`Telegram Bot: Google Token: googleTokenTgHandler middleware email not found`);
    return next();
  }

  // Step 1: Validate tokens exist and are active
  const validation = await validateGoogleTokens(ctx, email);
  if (!validation) {
    logger.info(`Telegram Bot: Google Token: googleTokenTgHandler middleware validation not found`);
    return; // Stop here until user authorizes Google Calendar
  }

  // Step 2: Refresh tokens if expired or near expiry
  const refreshedValidation = await refreshGoogleTokensIfNeeded(ctx, validation);
  if (!refreshedValidation) {
    logger.info(`Telegram Bot: Google Token: googleTokenTgHandler middleware refreshed validation not found`);
    return; // Stop here until user re-authorizes
  }

  // Step 3: Store validated tokens in session for agent usage
  ctx.session.googleTokens = refreshedValidation.tokens;
  logger.info(`Telegram Bot: Google Token: googleTokenTgHandler middleware googleTokens: ${ctx.session.googleTokens}`);
  logger.info(`Telegram Bot: Google Token: googleTokenTgHandler middleware next middleware called`);
  return next();
};
