/**
 * Google OAuth Route Handler
 * Initiates Google OAuth sign-in via Supabase
 */

import { ERROR_MESSAGES, ROUTES } from "@/lib/constants";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signInWithOAuth } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") || ROUTES.DASHBOARD;

  try {
    const supabase = await createClient();
    const { data, error } = await signInWithOAuth(supabase, "google", {
      origin: requestUrl.origin,
      next,
    });

    if (error) {
      return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=${encodeURIComponent(error.message)}`, request.url));
    }

    if (data.url) {
      return NextResponse.redirect(data.url);
    }

    return NextResponse.json({ error: ERROR_MESSAGES.FAILED_TO_INITIATE_OAUTH }, { status: 500 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
    return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
