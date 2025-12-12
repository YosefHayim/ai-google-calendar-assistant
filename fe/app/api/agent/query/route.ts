/**
 * Agent Query API Route Handler
 * Proxies agent queries to backend
 */

import { parseRequestBody, proxyToBackend } from "@/lib/api/utils/proxy";

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await parseRequestBody(request);
  return proxyToBackend(request, "/api/agent/query", {
    method: "POST",
    body,
  });
}
