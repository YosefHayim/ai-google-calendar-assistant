import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardHeaders } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/users/signup/google
 * Initiate Google OAuth sign-up/sign-in flow
 * This endpoint redirects to Google's consent screen via the backend
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const backendUrl = `${getBackendUrl()}${ENDPOINTS.USERS_SIGNUP_GOOGLE}${url.search}`;

  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: forwardHeaders(request),
      redirect: 'manual', // Don't follow redirects, we'll handle them
    });

    // Handle redirect responses (302, 301, etc.) - forward to Google consent screen
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        return NextResponse.redirect(location);
      }
    }

    // Handle JSON response (backend might return consent URL in JSON)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      // If backend returns auth URL in JSON, redirect to it
      if (data.data?.authUrl || data.data?.url || data.authUrl || data.url) {
        const authUrl = data.data?.authUrl || data.data?.url || data.authUrl || data.url;
        return NextResponse.redirect(authUrl);
      }
      return NextResponse.json(data, { status: response.status });
    }

    // For non-JSON responses, return as-is
    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'Content-Type': contentType || 'text/plain' },
    });
  } catch (error) {
    console.error('Google OAuth proxy error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to initiate Google OAuth', data: null },
      { status: 503 }
    );
  }
}
