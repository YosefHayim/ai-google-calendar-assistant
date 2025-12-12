/**
 * Get Agent Name Route Handler
 */

import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api/utils/proxy";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/users/agent-name");
}

