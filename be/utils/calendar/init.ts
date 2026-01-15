import { REDIRECT_URI, env } from "@/config";
import { calendar_v3, google } from "googleapis";

import type { OAuth2Client, Credentials } from "google-auth-library";
import type { TokensProps } from "@/types";
import { logger } from "../logger";
import { updateUserSupabaseTokens } from "../auth/update-tokens-of-user";

/**
 * @description Creates a fresh OAuth2Client instance configured with application credentials.
 * Used as the foundation for Google Calendar API authentication on a per-request basis.
 * Part of the calendar initialization flow.
 * @returns {OAuth2Client} A new OAuth2Client instance configured with client ID, secret, and redirect URI.
 * @example
 * const oauthClient = createOAuth2Client();
 * oauthClient.setCredentials(userTokens);
 */
export const createOAuth2Client = (): OAuth2Client => {
  return new google.auth.OAuth2(env.googleClientId, env.googleClientSecret, REDIRECT_URI);
};

type RefreshedToken = { token: string | null | undefined; expiry_date?: number | null };

/**
 * @description Refreshes OAuth tokens using the client's refresh token and returns the new access token.
 * Handles token refresh errors gracefully and logs detailed error information.
 * Part of the calendar initialization flow.
 * @param {OAuth2Client} client - An OAuth2Client with credentials (including refresh_token) already set.
 * @returns {Promise<RefreshedToken | null>} The new access token and expiry date, or null if token is unavailable.
 * @throws {Error} Throws with "invalid grant" message if refresh fails (e.g., token revoked).
 * @example
 * const refreshed = await refreshAccessToken(oauthClient);
 * if (refreshed?.token) {
 *   console.log("New token expires at:", new Date(refreshed.expiry_date));
 * }
 */
export const refreshAccessToken = async (client: OAuth2Client): Promise<RefreshedToken | null> => {
  try {
    const result = await client.getAccessToken();
    return result?.token ? { token: result.token, expiry_date: result.res?.data?.expiry_date } : null;
  } catch (e: unknown) {
    const err = e as { response?: { data?: { error?: string; error_description?: string } }; message?: string };
    const data = err?.response?.data;
    const msg = data?.error || err?.message;
    const desc = data?.error_description;
    logger.error(`Google Calendar: Token refresh failed: ${msg}${desc ? ` - ${desc}` : ""}`);
    throw new Error(`invalid grant: ${msg}${desc ? ` - ${desc}` : ""}`);
  }
};

/**
 * @description Creates an authenticated Google Calendar API client using the provided OAuth2Client.
 * Configures the client for v3 API with JSON response type.
 * Part of the calendar initialization flow.
 * @param {OAuth2Client} auth - An authenticated OAuth2Client with valid credentials.
 * @returns {calendar_v3.Calendar} A configured Google Calendar API client ready for API calls.
 * @example
 * const calendar = createCalendarClient(oauthClient);
 * const events = await calendar.events.list({ calendarId: "primary" });
 */
export const createCalendarClient = (auth: OAuth2Client): calendar_v3.Calendar => {
  return google.calendar({ version: "v3", auth, responseType: "json" });
};

/**
 * @description Persists refreshed OAuth tokens to the database if new tokens were obtained.
 * Updates the user's stored tokens in Supabase to maintain valid credentials.
 * Part of the calendar initialization flow.
 * @param {TokensProps} oldTokens - The original tokens used for the refresh request.
 * @param {RefreshedToken | null} newTokens - The newly obtained tokens from the refresh operation.
 * @returns {Promise<void>} Resolves when tokens are persisted (or skipped if no new token).
 * @example
 * await persistRefreshedTokens(originalTokens, refreshedTokens);
 */
const persistRefreshedTokens = async (oldTokens: TokensProps, newTokens: RefreshedToken | null): Promise<void> => {
  if (newTokens?.token) {
    await updateUserSupabaseTokens(oldTokens, newTokens as TokensProps & { token?: string | null });
  }
};

/**
 * @description Converts application TokensProps format to Google's Credentials format.
 * Maps nullable fields to undefined as required by the Google Auth library.
 * @param {TokensProps} tokens - The application's token format from the database.
 * @returns {Credentials} A Google Credentials object compatible with OAuth2Client.
 * @example
 * const googleCreds = toGoogleCredentials(userTokens);
 * oauthClient.setCredentials(googleCreds);
 */
const toGoogleCredentials = (tokens: TokensProps): Credentials => ({
  access_token: tokens.access_token ?? undefined,
  refresh_token: tokens.refresh_token ?? undefined,
  scope: tokens.scope ?? undefined,
  token_type: tokens.token_type ?? undefined,
  id_token: tokens.id_token ?? undefined,
  expiry_date: tokens.expiry_date ?? undefined,
});

/**
 * @description Main entry point for initializing a Google Calendar client with user tokens.
 * Creates OAuth2Client, sets credentials, refreshes tokens, persists new tokens to database,
 * and returns a ready-to-use Calendar client.
 * @param {TokensProps} tokens - User's OAuth tokens retrieved from the database.
 * @returns {Promise<calendar_v3.Calendar>} An authenticated Google Calendar API client.
 * @example
 * const credentials = await fetchCredentialsByEmail("user@example.com");
 * const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);
 * const events = await calendar.events.list({ calendarId: "primary" });
 */
export const initUserSupabaseCalendarWithTokensAndUpdateTokens = async (tokens: TokensProps): Promise<calendar_v3.Calendar> => {
  const oauthClient = createOAuth2Client();
  oauthClient.setCredentials(toGoogleCredentials(tokens));

  const refreshedTokens = await refreshAccessToken(oauthClient);
  await persistRefreshedTokens(tokens, refreshedTokens);

  return createCalendarClient(oauthClient);
};

/**
 * @description Creates a Google Calendar client from pre-validated tokens.
 * Use this when tokens have already been validated and refreshed by middleware
 * (googleTokenValidation + googleTokenRefresh) to avoid redundant refresh calls.
 *
 * This is the RECOMMENDED way to create calendar clients in route handlers
 * that use the Google token middleware chain.
 *
 * @param {TokensProps} tokens - Pre-validated OAuth tokens from req.googleTokenValidation.tokens
 * @returns {calendar_v3.Calendar} An authenticated Google Calendar API client.
 * @example
 * // In a route handler after googleTokenValidation + googleTokenRefresh middleware:
 * const tokens = req.googleTokenValidation.tokens;
 * const calendar = createCalendarFromValidatedTokens(tokens);
 * const events = await calendar.events.list({ calendarId: "primary" });
 */
export const createCalendarFromValidatedTokens = (tokens: TokensProps): calendar_v3.Calendar => {
  const oauthClient = createOAuth2Client();
  oauthClient.setCredentials(toGoogleCredentials(tokens));
  return createCalendarClient(oauthClient);
};
