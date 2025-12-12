/**
 * Supabase Auth Callback Route
 * Handles OAuth callbacks from Supabase and exchanges code for session
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error?.message || "auth_failed")}`, request.url));
    }

    // Set session cookies
    const cookieStore = await cookies();
    const { access_token, refresh_token, expires_in } = data.session;

    cookieStore.set("sb-access-token", access_token, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: expires_in || 60 * 60 * 24 * 7, // 7 days default
    });

    if (refresh_token) {
      cookieStore.set("sb-refresh-token", refresh_token, {
        ...SESSION_COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
