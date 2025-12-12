/**
 * Shared utilities for Next.js Route Handlers
 * Proxies requests to backend API
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Get backend API base URL from environment variables
 */
export function getBackendUrl(): string {
  return process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:3000";
}

/**
 * Create headers for backend request
 * Forwards cookies and sets content type
 */
export function createBackendHeaders(request: NextRequest): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Forward cookies from the incoming request
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    headers.Cookie = cookieHeader;
  }

  return headers;
}

/**
 * Create error response
 */
export function createErrorResponse(error: unknown, status = 500): NextResponse {
  return NextResponse.json(
    {
      message: error instanceof Error ? error.message : "Internal server error",
      error,
    },
    { status }
  );
}

/**
 * Proxy request to backend API
 * 
 * @param request - Next.js request object
 * @param backendPath - Backend API path (e.g., "/api/calendars/")
 * @param options - Request options
 * @returns NextResponse with backend response
 */
export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  options: {
    method?: string;
    body?: unknown;
    forwardQueryParams?: boolean;
  } = {}
): Promise<NextResponse> {
  const { method = "GET", body, forwardQueryParams = true } = options;

  try {
    const backendUrl = getBackendUrl();
    const url = new URL(backendPath, backendUrl);

    // Forward query parameters if requested
    if (forwardQueryParams) {
      request.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = createBackendHeaders(request);

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    const data = await parseResponse(response);

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return createErrorResponse(error);
  }
}

/**
 * Parse request body safely
 */
export async function parseRequestBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

/**
 * Parse fetch response safely
 */
export async function parseResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/**
 * Create API error response
 */
export function createApiErrorResponse(
  error: unknown,
  status?: number,
  message?: string
): { message: string; error?: unknown } {
  return {
    message: message || (error instanceof Error ? error.message : "Network error occurred"),
    error,
  };
}

/**
 * Create API success response
 */
export function createApiSuccessResponse<T>(
  data: unknown,
  message?: string
): { message: string; data?: T } {
  return {
    message: message || "Success",
    data: (data as { data?: T })?.data !== undefined ? (data as { data: T }).data : (data as T),
  };
}

