/**
 * GitHub OAuth Route Handler
 * Initiates GitHub OAuth sign-in via Supabase
 */

import { ERROR_MESSAGES, ROUTES } from "@/lib/constants";

import { NextResponse } from "next/server";
import type { components } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { signInWithOAuth } from "@/lib/supabase/auth";

type ErrorResponse = components["schemas"]["ErrorResponse"];

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") || ROUTES.DASHBOARD;

  try {
    const supabase = await createClient();
    const { data, error } = await signInWithOAuth(supabase, "github", {
      origin: requestUrl.origin,
      next,
    });

    if (error) {
      return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=${encodeURIComponent(error.message)}`, request.url));
    }

    if (data.url) {
      return NextResponse.redirect(data.url);
    }

    const errorResponse: ErrorResponse = {
      status: "error",
      message: ERROR_MESSAGES.FAILED_TO_INITIATE_OAUTH,
      data: {
        error: ERROR_MESSAGES.FAILED_TO_INITIATE_OAUTH,
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
    return NextResponse.redirect(new URL(`${ROUTES.LOGIN}?error=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
