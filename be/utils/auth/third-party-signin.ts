import { PROVIDERS, REDIRECT_URI, SCOPES_STRING, STATUS_RESPONSE, SUPABASE } from "@/config";

import type { AuthError } from "@supabase/supabase-js";
import type { Response } from "express";
import sendR from "@/utils/send-response";

type OAuthResult = {
  url: string | null;
  error: AuthError | null;
};

/**
 * Initiate OAuth flow with Supabase
 *
 * @param provider - The OAuth provider to use.
 * @param options - Configuration options
 * @param options.forceConsent - Force consent screen (default: true for first-time auth)
 * @returns The OAuth result with URL or error.
 * @description
 * Optimized to reduce redundant consent screens:
 * - Uses `prompt: "consent"` only when forceConsent=true (first-time auth)
 * - Otherwise relies on refresh tokens for silent re-authentication
 * - Always includes `access_type: "offline"` to ensure refresh_token is returned
 */
export async function initiateOAuthFlow(provider: PROVIDERS, options: { forceConsent?: boolean } = {}): Promise<OAuthResult> {
  const { forceConsent = true } = options; // Default to true for first-time auth

  const queryParams: {
    access_type: string;
    prompt?: string;
  } = {
    access_type: "offline", // CRITICAL: Required to receive refresh_token
  };

  // Only force consent screen on first-time auth or when explicitly requested
  // This prevents redundant redirects when user already has a valid refresh token
  if (forceConsent) {
    queryParams.prompt = "consent";
  }

  const { data, error } = await SUPABASE.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: REDIRECT_URI,
      scopes: SCOPES_STRING,
      queryParams,
    },
  });

  return { url: data.url, error };
}

/**
 * Redirect user to OAuth provider URL
 *
 * @param res - Express response object.
 * @param url - The OAuth URL to redirect to.
 */
export function redirectToOAuth(res: Response, url: string): void {
  res.redirect(url);
}

/**
 * Send OAuth error response
 *
 * @param res - Express response object.
 * @param error - The authentication error.
 */
export function sendOAuthError(res: Response, error: AuthError): void {
  sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to sign up user.", error);
}

/**
 * Handle third party sign in or sign up
 *
 * Initiates OAuth flow and redirects user to provider, or sends error response.
 *
 * @param res - Express response object.
 * @param provider - The OAuth provider to use.
 */
export async function supabaseThirdPartySignInOrSignUp(res: Response, provider: PROVIDERS): Promise<void> {
  const { url, error } = await initiateOAuthFlow(provider);

  if (url) {
    redirectToOAuth(res, url);
    return;
  }

  if (error) {
    sendOAuthError(res, error);
  }
}
