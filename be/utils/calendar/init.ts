import { REDIRECT_URI, env } from "@/config";
import { calendar_v3, google } from "googleapis";

import type { OAuth2Client, Credentials } from "google-auth-library";
import type { TokensProps } from "@/types";
import { logger } from "../logger";
import { updateUserSupabaseTokens } from "../auth/update-tokens-of-user";

/**
 * Create a fresh OAuth2Client instance for per-request use. Part of: Calendar initialization flow.
 */
export const createOAuth2Client = (): OAuth2Client => {
  return new google.auth.OAuth2(env.googleClientId, env.googleClientSecret, REDIRECT_URI);
};

type RefreshedToken = { token: string | null | undefined; expiry_date?: number | null };

/**
 * Refresh OAuth tokens and get new access token. Part of: Calendar initialization flow.
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
 * Create Google Calendar client. Part of: Calendar initialization flow.
 */
export const createCalendarClient = (auth: OAuth2Client): calendar_v3.Calendar => {
  return google.calendar({ version: "v3", auth, responseType: "json" });
};

/**
 * Persist refreshed tokens to database if needed. Part of: Calendar initialization flow.
 */
const persistRefreshedTokens = async (oldTokens: TokensProps, newTokens: RefreshedToken | null): Promise<void> => {
  if (newTokens?.token) {
    await updateUserSupabaseTokens(oldTokens, newTokens as TokensProps & { token?: string | null });
  }
};

/**
 * Convert TokensProps to Google Credentials format
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
 * Initialize calendar with user tokens. Part of: Calendar initialization flow - main entry point.
 */
export const initUserSupabaseCalendarWithTokensAndUpdateTokens = async (tokens: TokensProps): Promise<calendar_v3.Calendar> => {
  const oauthClient = createOAuth2Client();
  oauthClient.setCredentials(toGoogleCredentials(tokens));

  const refreshedTokens = await refreshAccessToken(oauthClient);
  await persistRefreshedTokens(tokens, refreshedTokens);

  return createCalendarClient(oauthClient);
};
