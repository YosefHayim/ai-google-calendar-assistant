/**
 * GitHub OAuth Route Handler
 * Initiates GitHub OAuth sign-in via Supabase
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signInWithOAuth } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  try {
    const supabase = await createClient();
    const { data, error } = await signInWithOAuth(supabase, "github", {
      origin: requestUrl.origin,
      next,
    });

    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
    }

    if (data.url) {
      return NextResponse.redirect(data.url);
    }

    return NextResponse.json({ error: "Failed to initiate OAuth" }, { status: 500 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
