/**
 * API Configuration
 * Following Next.js 15 best practices:
 * - Use Next.js Route Handlers (app/api) as proxy to backend
 * - Separate server and client API functions
 */

import { parseResponse, createApiErrorResponse, createApiSuccessResponse } from "./utils/proxy";

/**
 * Backend API base URL
 * This is used by Route Handlers to proxy requests to the backend
 */
export const getBackendBaseUrl = (): string => {
  // Server-side only: use environment variable or default
  return process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:3000";
};

/**
 * Next.js API routes (Route Handlers)
 * These proxy to the backend API
 */
export const API_ROUTES = {
  USERS: "/api/users",
  CALENDAR: "/api/calendars",
  WHATSAPP: "/api/whatsapp",
} as const;

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  error?: unknown;
}

/**
 * HTTP Status codes
 */
export enum HttpStatus {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  NO_CONTENT = 204,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Request options for API calls
 */
export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Create a full URL from a path and optional query parameters
 * For client-side: uses Next.js API routes (relative paths)
 * For server-side: can use backend directly or Next.js API routes
 */
export const createApiUrl = (path: string, params?: Record<string, string | number | boolean | undefined>, useBackendDirectly = false): string => {
  // Server-side can optionally call backend directly
  if (useBackendDirectly && typeof window === "undefined") {
    const backendUrl = getBackendBaseUrl();
    const url = new URL(path, backendUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  // Client-side and default: use Next.js API routes (relative paths)
  const url = new URL(path, typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.pathname + url.search;
};

/**
 * Make an API request (client-side)
 * Uses Next.js Route Handlers which proxy to backend
 */
export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;
  const url = createApiUrl(path, params);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include", // Include cookies for authentication
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      return createApiErrorResponse(
        (data as { error?: unknown })?.error || data,
        response.status,
        (data as { message?: string })?.message || `HTTP error! status: ${response.status}`
      );
    }

    return createApiSuccessResponse<T>(data, (data as { message?: string })?.message);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}

/**
 * Make a server-side API request
 * Can call backend directly or use Next.js Route Handlers
 */
export async function serverApiRequest<T = unknown>(path: string, options: RequestOptions = {}, callBackendDirectly = false): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;
  const url = createApiUrl(path, params, callBackendDirectly);

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Forward cookies from the incoming request
  // This should be passed from the Server Component or Route Handler
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include",
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      return createApiErrorResponse(
        (data as { error?: unknown })?.error || data,
        response.status,
        (data as { message?: string })?.message || `HTTP error! status: ${response.status}`
      );
    }

    return createApiSuccessResponse<T>(data, (data as { message?: string })?.message);
  } catch (error) {
    return createApiErrorResponse(error);
  }
}
