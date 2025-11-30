/**
 * User Sign Up Route Handler
 */

import { NextRequest } from "next/server";
import { proxyToBackend, parseRequestBody } from "@/lib/api/utils/proxy";

export async function POST(request: NextRequest) {
  const body = await parseRequestBody(request);
  return proxyToBackend(request, "/api/users/signup", {
    method: "POST",
    body,
  });
}

