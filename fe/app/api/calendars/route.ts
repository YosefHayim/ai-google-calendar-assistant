/**
 * Calendar API Route Handler
 * Proxies requests to backend calendar API
 * Following Next.js 15 best practices
 */

import { NextRequest } from "next/server";
import { proxyToBackend, parseRequestBody } from "@/lib/api/utils/proxy";

// GET /api/calendars - Get all calendars (default)
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/calendars/");
}

// POST /api/calendars - Create event
export async function POST(request: NextRequest) {
  const body = await parseRequestBody(request);
  return proxyToBackend(request, "/api/calendars/", {
    method: "POST",
    body,
  });
}

