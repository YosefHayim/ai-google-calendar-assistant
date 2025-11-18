import type { Request, Response } from "express";
import {  redirectUri, SCOPES_STRING, SUPABASE } from "@/config/root-config";
import { type PROVIDERS, STATUS_RESPONSE } from "@/types";

import { asyncHandler } from "./asyncHandlers";
import sendResponseesponse from "./sendResponseesponse";

export const thirdPartySignInOrSignUp = asyncHandler(async (_req: Request, res: Response, provider: PROVIDERS) => {
  const { data, error } = await SUPABASE.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUri,
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
    sendResponse(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to sign up user.", error);
    return;
  }
});
