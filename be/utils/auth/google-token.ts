import { OAUTH2CLIENT, REDIRECT_URI, SCOPES, SUPABASE, env } from "@/config";

import { TOKEN_FIELDS } from "@/config/constants/sql";
import type { TokensProps } from "@/types";
import { google } from "googleapis";

/**
 * Create a fresh OAuth2Client instance for token refresh
 *
 * This avoids issues with singleton OAuth2Client caching stale token state.
 *
 * @returns {google.auth.OAuth2} A new OAuth2Client instance
 */
const createFreshOAuth2Client = () => {
  return new google.auth.OAuth2(env.googleClientId, env.googleClientSecret, REDIRECT_URI);
};

/**
 * Generate Google OAuth URL for calendar authorization
 *
 * @returns {string} The OAuth URL for Google Calendar authorization
 */
export const generateGoogleAuthUrl = (): string => {
  return OAUTH2CLIENT.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    include_granted_scopes: true,
    redirect_uri: REDIRECT_URI,
  });
};

// Buffer time before expiry to consider token as "near expiry" (5 minutes)
export const NEAR_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

/**
 * Token expiry status
 */
export type TokenExpiryStatus = {
  isExpired: boolean;
  isNearExpiry: boolean;
  expiresInMs: number | null;
};

/**
 * Refreshed token result
 */
export type RefreshedGoogleToken = {
  accessToken: string;
  expiryDate: number;
};

/**
 * Check if token is expired or near expiry
 *
 * @param {number | null | undefined} expiryDate - Token expiry timestamp in milliseconds
 * @returns {TokenExpiryStatus} Expiry status object
 */
export const checkTokenExpiry = (expiryDate: number | null | undefined): TokenExpiryStatus => {
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
 * Fetch Google Calendar tokens from database by email
 *
 * @param {string} email - User's email
 * @returns {Promise<TokensProps | null>} Tokens or null if not found
 */
export const fetchGoogleTokensByEmail = async (email: string): Promise<{ data: TokensProps | null; error: string | null }> => {
  const { data, error } = await SUPABASE.from("user_calendar_tokens").select(TOKEN_FIELDS).ilike("email", email.trim()).limit(1).maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as TokensProps | null, error: null };
};

/**
 * Refresh Google access token using OAuth2 client
 *
 * Creates a fresh OAuth2Client per call to avoid singleton caching issues
 * that cause "session expired" errors when the backend hasn't been restarted.
 *
 * @param {TokensProps} tokens - Current tokens with refresh_token
 * @returns {Promise<RefreshedGoogleToken>} New access token and expiry
 * @throws {Error} REAUTH_REQUIRED if refresh token is invalid/expired
 * @throws {Error} TOKEN_REFRESH_FAILED for other errors
 */
export const refreshGoogleAccessToken = async (tokens: TokensProps): Promise<RefreshedGoogleToken> => {
  // Create fresh OAuth2Client per request to avoid stale cached token state
  const oauthClient = createFreshOAuth2Client();
  oauthClient.setCredentials({
    expiry_date: tokens.expiry_date,
    token_type: tokens.token_type,
    scope: tokens.scope,
    id_token: tokens.id_token,
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token,
  });

  try {
    const { credentials } = await oauthClient.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error("No access token received from Google");
    }

    if (!credentials.expiry_date) {
      throw new Error("No expiry date received from Google");
    }

    return {
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date,
    };
  } catch (e) {
    console.error("Google token refresh failed:", e);
    throw e;
  }
};

/**
 * Persist refreshed Google tokens to database
 *
 * @param {string} email - User's email
 * @param {RefreshedGoogleToken} refreshedTokens - New token data
 */
export const persistGoogleTokens = async (email: string, refreshedTokens: RefreshedGoogleToken): Promise<void> => {
  const { error } = await SUPABASE.from("user_calendar_tokens").upsert(
    {
      email: email,
      access_token: refreshedTokens.accessToken,
      expiry_date: refreshedTokens.expiryDate,
      is_active: true,
    },
    {
      onConflict: "email",
    }
  );

  if (error) {
    console.error("Failed to persist Google tokens:", error.message);
    throw new Error(`Failed to save refreshed tokens: ${error.message}`);
  }
};

/**
 * Mark Google tokens as inactive in database
 *
 * @param {string} email - User's email
 */
export const deactivateGoogleTokens = async (email: string): Promise<void> => {
  const { error } = await SUPABASE.from("user_calendar_tokens").update({ is_active: false }).ilike("email", email.trim());
  if (error) {
    console.error("Failed to deactivate Google tokens:", error.message);
    throw new Error(`Failed to deactivate tokens: ${error.message}`);
  }
};
