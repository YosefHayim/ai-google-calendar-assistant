/**
 * Users API Route Handler
 * Proxies requests to backend users API
 */

import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend, parseRequestBody } from "@/lib/api/utils/proxy";

// GET /api/users - Various user endpoints based on query params
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const endpoint = searchParams.get("endpoint");
  
  if (endpoint === "get-user") {
    return proxyToBackend(request, "/api/users/get-user");
  }
  if (endpoint === "callback") {
    return proxyToBackend(request, "/api/users/callback");
  }
  
  // Default: redirect to callback for OAuth
  return proxyToBackend(request, "/api/users/callback");
}

// POST /api/users - Sign up, sign in, verify OTP
export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const endpoint = searchParams.get("endpoint");
  const body = await parseRequestBody(request);
  
  if (endpoint === "signup") {
    return proxyToBackend(request, "/api/users/signup", {
      method: "POST",
      body,
    });
  }
  if (endpoint === "signin") {
    return proxyToBackend(request, "/api/users/signin", {
      method: "POST",
      body,
    });
  }
  if (endpoint === "verify-otp") {
    return proxyToBackend(request, "/api/users/verify-user-by-email-otp", {
      method: "POST",
      body,
    });
  }
  
  return NextResponse.json({ message: "Invalid endpoint" }, { status: 400 });
}

// DELETE /api/users - Deactivate user
export async function DELETE(request: NextRequest) {
  const body = await parseRequestBody(request);
  return proxyToBackend(request, "/api/users/", {
    method: "DELETE",
    body,
  });
}

