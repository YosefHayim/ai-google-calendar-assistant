import type { Request, Response } from "express";
import { OAUTH2CLIENT, redirectUri, SCOPES } from "@/config/root-config";
import { STATUS_RESPONSE } from "@/types";
import sendResponseesponse from "@/utils/sendResponseesponse";

/**
 * Generates Google OAuth2 authorization URL
 */
export function generateGoogleAuthUrl(): string {
  return OAUTH2CLIENT.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    include_granted_scopes: true,
    redirect_uri: redirectUri,
  });
}

/**
 * Checks if request is from Postman
 */
export function isPostmanRequest(req: Request): boolean {
  const userAgent = req.headers["user-agent"] || "";
  return userAgent.includes("Postman");
}

/**
 * Handles initial auth URL request (no code present)
 */
export function handleInitialAuthRequest(req: Request, res: Response, url: string): void {
  if (isPostmanRequest(req)) {
    sendResponse(res, STATUS_RESPONSE.SUCCESS, url);
  } else {
    res.redirect(url);
  }
}
