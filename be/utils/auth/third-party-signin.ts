import { PROVIDERS, REDIRECT_URI, SCOPES_STRING, STATUS_RESPONSE, SUPABASE } from "@/config";
import type { Request, Response } from "express";

import { asyncHandler } from "../http/async-handlers";
import sendR from "@/utils/send-response";

/**
 * Sign in or sign up with a third party provider using Supabase Auth Sign In With OAuth
 *
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @param {PROVIDERS} provider - The provider to sign in or sign up with.
 * @returns {Promise<void>} The response object.
 * @description Signs in or signs up a user with a third party provider and sends the response.
 * @example
 * const data = await supabaseThirdPartySignInOrSignUp(_req, res, provider);
 * console.log(data);
 */
export const supabaseThirdPartySignInOrSignUp = asyncHandler(async (_req: Request, res: Response, provider: PROVIDERS) => {
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

  if (data.url) {
    res.redirect(data.url);
    return;
  }

  if (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to sign up user.", error);
    return;
  }
});
