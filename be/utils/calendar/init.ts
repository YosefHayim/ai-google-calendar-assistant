import { REDIRECT_URI, env } from "@/config";
import { calendar_v3, google } from "googleapis";

import type { OAuth2Client } from "google-auth-library";
import type { TokensProps } from "@/types";
import { logger } from "../logger";
import { updateUserSupabaseTokens } from "../auth/update-tokens-of-user";

/**
 * Create a fresh OAuth2Client instance for per-request use
 *
 * This avoids issues with singleton OAuth2Client caching stale token state.
 * Each request gets its own client to prevent credential leakage between users
 * and ensure token refresh works correctly after expiry.
 *
 * @returns {OAuth2Client} A new OAuth2Client instance
 */
export const createOAuth2Client = (): OAuth2Client => {
  const oauthClient = new google.auth.OAuth2(env.googleClientId, env.googleClientSecret, REDIRECT_URI);
  logger.info(`Google Calendar: Init: createOAuth2Client called: oauthClient: ${oauthClient}`);
  return oauthClient;
};

type RefreshedToken = { token: string | null | undefined; expiry_date?: number | null };

/**
 * Refresh OAuth tokens and get new access token
 *
 * @param {OAuth2Client} client - The OAuth2 client.
 * @returns {Promise<RefreshedToken | null>} The refreshed token data, or null if no refresh occurred.
 */
export const refreshAccessToken = async (client: OAuth2Client): Promise<RefreshedToken | null> => {
  try {
    logger.info(`Google Calendar: Init: refreshAccessToken called: client: ${client}`);
    const result = await client.getAccessToken();
    logger.info(`Google Calendar: Init: refreshAccessToken called: result: ${result}`);
    return result?.token ? { token: result.token, expiry_date: result.res?.data?.expiry_date } : null;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: string; error_description?: string } }; message?: string };
    const data = err?.response?.data;
    const msg = data?.error || err?.message;
    const desc = data?.error_description;
    logger.error(`Google Calendar: Init: refreshAccessToken called: error: ${err}`);
    console.error("OAuth token refresh failed", { msg, desc });
    throw new Error(`invalid grant: ${msg}${desc ? ` - ${desc}` : ""}`);
  }
};

/**
 * Create Google Calendar client
 *
 * @param {OAuth2Client} auth - The authenticated OAuth2 client.
 * @returns {calendar_v3.Calendar} The calendar client.
 */
export const createCalendarClient = (auth: OAuth2Client): calendar_v3.Calendar => {
  logger.info(`Google Calendar: Init: createCalendarClient called: auth: ${auth}`);
  const calendarClient = google.calendar({ version: "v3", auth, responseType: "json" });
  logger.info(`Google Calendar: Init: createCalendarClient called: calendarClient: ${calendarClient}`);
  return calendarClient;
};

/**
 * Persist refreshed tokens to database if needed
 *
 * @param {TokensProps} oldTokens - The original tokens.
 * @param {RefreshedToken | null} newTokens - The refreshed token data.
 */
const persistRefreshedTokens = async (oldTokens: TokensProps, newTokens: RefreshedToken | null): Promise<void> => {
  logger.info(`Google Calendar: Init: persistRefreshedTokens called: oldTokens: ${oldTokens}`);
  logger.info(`Google Calendar: Init: persistRefreshedTokens called: newTokens: ${newTokens}`);
  if (newTokens?.token) {
    await updateUserSupabaseTokens(oldTokens, newTokens as TokensProps & { token?: string | null });
    logger.info(
      `Google Calendar: Init: persistRefreshedTokens called: updateUserSupabaseTokens: ${updateUserSupabaseTokens(
        oldTokens,
        newTokens as TokensProps & { token?: string | null }
      )}`
    );
  }
  logger.info(`Google Calendar: Init: persistRefreshedTokens called: done`);
};

/**
 * Initialize calendar with user tokens
 *

 *
 * @param {TokensProps} tokens - The user's OAuth tokens.
 * @description - Creates a fresh OAuth2Client per request to avoid stale token state issues.
 * Sets credentials, refreshes token if needed, updates DB, and returns calendar client.
 * @returns {Promise<calendar_v3.Calendar>} The initialized calendar client.
 */
export const initUserSupabaseCalendarWithTokensAndUpdateTokens = async (tokens: TokensProps): Promise<calendar_v3.Calendar> => {
  logger.info(`Google Calendar: Init: initUserSupabaseCalendarWithTokensAndUpdateTokens called: ${tokens}`);
  // Create fresh OAuth2Client per request to avoid singleton caching issues
  const oauthClient = createOAuth2Client();
  logger.info(`Google Calendar: Init: initUserSupabaseCalendarWithTokensAndUpdateTokens called: oauthClient: ${oauthClient}`);
  oauthClient.setCredentials(tokens);
  logger.info(
    `Google Calendar: Init: initUserSupabaseCalendarWithTokensAndUpdateTokens called: oauthClient.setCredentials: ${oauthClient.setCredentials(tokens)}`
  );
  const refreshedTokens = await refreshAccessToken(oauthClient);
  logger.info(`Google Calendar: Init: initUserSupabaseCalendarWithTokensAndUpdateTokens called: refreshedTokens: ${refreshedTokens}`);
  await persistRefreshedTokens(tokens, refreshedTokens);
  logger.info(
    `Google Calendar: Init: initUserSupabaseCalendarWithTokensAndUpdateTokens called: persistRefreshedTokens: ${persistRefreshedTokens(
      tokens,
      refreshedTokens
    )}`
  );
  return createCalendarClient(oauthClient);
};
