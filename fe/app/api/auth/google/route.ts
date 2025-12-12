/**
 * Google OAuth Route Handler
 * Initiates Google OAuth sign-in using backend's OAuth client (shows "CAL AI" in consent screen)
 * This ensures both frontend and backend use the same OAuth client for consistent branding
 */

import { ERROR_MESSAGES, ROUTES } from "@/lib/constants";

import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api/utils/proxy";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") || ROUTES.DASHBOARD;

  try {
    // Use backend's OAuth URL generation to ensure we use the same Google OAuth client
    // This will show "CAL AI" in the consent screen instead of Supabase domain
    const backendUrl = getBackendUrl();
    const backendOAuthUrl = new URL("/api/users/callback", backendUrl);
    // Add next parameter so we can redirect after OAuth completes
    backendOAuthUrl.searchParams.append("next", next);
    backendOAuthUrl.searchParams.append("source", "frontend");

    // Redirect to backend OAuth URL generation
    // Backend will redirect to Google OAuth consent screen
    return NextResponse.redirect(backendOAuthUrl.toString());
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
    return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
