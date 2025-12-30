import { PROVIDERS, REDIRECT_URI, SCOPES_STRING, STATUS_RESPONSE, SUPABASE } from "@/config";
import type { Response } from "express";
import type { AuthError } from "@supabase/supabase-js";

import sendR from "@/utils/send-response";

type OAuthResult = {
  url: string | null;
  error: AuthError | null;
};

/**
 * Initiate OAuth flow with Supabase
 *
 * @param provider - The OAuth provider to use.
 * @returns The OAuth result with URL or error.
 */
export async function initiateOAuthFlow(provider: PROVIDERS): Promise<OAuthResult> {
  const { data, error } = await SUPABASE.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: REDIRECT_URI,
      scopes: SCOPES_STRING,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
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
