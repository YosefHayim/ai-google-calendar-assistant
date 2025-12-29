import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

/**
 * Get the backend API base URL
 */
export function getBackendUrl(): string {
  return BACKEND_URL;
}

/**
 * Forward headers from the incoming request to the backend
 */
export function forwardHeaders(request: NextRequest): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const authorization = request.headers.get('Authorization');
  if (authorization) {
    headers['Authorization'] = authorization;
  }

  const cookie = request.headers.get('Cookie');
  if (cookie) {
    headers['Cookie'] = cookie;
  }

  return headers;
}

/**
 * Proxy a request to the backend API
 */
export async function proxyToBackend(
  request: NextRequest,
  endpoint: string,
  options?: {
    method?: string;
    body?: unknown;
  }
): Promise<NextResponse> {
  const url = new URL(request.url);
  const backendUrl = `${BACKEND_URL}${endpoint}${url.search}`;

  try {
    const fetchOptions: RequestInit = {
      method: options?.method || request.method,
      headers: forwardHeaders(request),
    };

    if (options?.body) {
      fetchOptions.body = JSON.stringify(options.body);
    } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {
        // No body or invalid JSON - continue without body
      }
    }

    const response = await fetch(backendUrl, fetchOptions);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // For non-JSON responses, return as text
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'Content-Type': contentType || 'text/plain' },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to connect to backend', data: null },
      { status: 503 }
    );
  }
}

/**
 * Proxy a GET request to the backend
 */
export async function proxyGet(request: NextRequest, endpoint: string): Promise<NextResponse> {
  return proxyToBackend(request, endpoint, { method: 'GET' });
}

/**
 * Proxy a POST request to the backend
 */
export async function proxyPost(request: NextRequest, endpoint: string): Promise<NextResponse> {
  return proxyToBackend(request, endpoint, { method: 'POST' });
}

/**
 * Proxy a PATCH request to the backend
 */
export async function proxyPatch(request: NextRequest, endpoint: string): Promise<NextResponse> {
  return proxyToBackend(request, endpoint, { method: 'PATCH' });
}

/**
 * Proxy a DELETE request to the backend
 */
export async function proxyDelete(request: NextRequest, endpoint: string): Promise<NextResponse> {
  return proxyToBackend(request, endpoint, { method: 'DELETE' });
}
