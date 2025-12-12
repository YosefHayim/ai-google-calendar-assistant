/**
 * OAuth Callback Route Handler
 * Handles Google OAuth callback from Telegram bot flow
 * Proxies to backend to exchange code for tokens and store them
 */

import { NextRequest, NextResponse } from "next/server";
import { createBackendHeaders, getBackendUrl } from "@/lib/api/utils/proxy";

import { ROUTES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get("code");

    // If no code, this might be the initial redirect - redirect to login
    if (!code) {
      return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=${encodeURIComponent("No authorization code provided")}`, request.url));
    }

    // Get backend URL
    const backendUrl = getBackendUrl();
    const backendPath = "/api/users/callback";

    // Construct backend URL with code parameter
    const url = new URL(backendPath, backendUrl);
    url.searchParams.append("code", code);

    // Forward all other query parameters (scope, authuser, prompt, etc.)
    searchParams.forEach((value, key) => {
      if (key !== "code") {
        url.searchParams.append(key, value);
      }
    });

    // Create headers for backend request
    const headers = createBackendHeaders(request);

    // Make request to backend
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
      credentials: "include",
    });

    // Parse response
    let data: {
      status?: string;
      message?: string;
      data?: unknown;
      userEmail?: string;
    } = {};

    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = (await response.json()) as {
          status?: string;
          message?: string;
          data?: unknown;
          userEmail?: string;
        };
      } else {
        // If response is not JSON, treat as error
        throw new Error("Backend returned non-JSON response");
      }
    } catch (parseError) {
      // If parsing fails, treat as error
      const errorMessage = parseError instanceof Error ? parseError.message : "Failed to parse backend response";
      return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=${encodeURIComponent(errorMessage)}`, request.url));
    }

    // Check if request was successful
    if (response.ok && data.status === "success") {
      // If this is a frontend OAuth flow, redirect to auth callback to create Supabase session
      const source = searchParams.get("source");
      if (source === "frontend" && data.userEmail) {
        // Redirect to auth callback page which will handle Supabase session creation
        const next = searchParams.get("next") || ROUTES.DASHBOARD;
        return NextResponse.redirect(
          new URL(`${ROUTES.AUTH.CALLBACK}?email=${encodeURIComponent(data.userEmail)}&next=${encodeURIComponent(next)}`, request.url)
        );
      }

      // For backend/Telegram bot flow, just redirect to dashboard
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }

    // Error: redirect to login with error message
    const errorMessage = data.message || "Failed to complete OAuth authentication";
    return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=${encodeURIComponent(errorMessage)}`, request.url));
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
