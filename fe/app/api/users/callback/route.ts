import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardHeaders } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/users/callback
 * Google OAuth callback handler
 * Receives the OAuth callback, forwards to backend, and redirects to frontend with tokens
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const backendUrl = `${getBackendUrl()}${ENDPOINTS.USERS_CALLBACK}${url.search}`;

  try {
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: forwardHeaders(request),
      redirect: 'manual',
    });

    // Handle redirect from backend (might redirect to frontend with tokens in URL)
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        return NextResponse.redirect(location);
      }
    }

    // Handle JSON response with auth data
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();

      // If successful auth, redirect to callback page with tokens
      if (data.status === 'success' && data.data) {
        const authData = data.data;
        const callbackUrl = new URL('/auth/callback', request.url);

        // Pass tokens as URL params (will be stored client-side)
        if (authData.session?.access_token) {
          callbackUrl.searchParams.set('access_token', authData.session.access_token);
        }
        if (authData.session?.refresh_token) {
          callbackUrl.searchParams.set('refresh_token', authData.session.refresh_token);
        }
        if (authData.user) {
          callbackUrl.searchParams.set('user', JSON.stringify(authData.user));
        }

        return NextResponse.redirect(callbackUrl.toString());
      }

      // If error, redirect to login with error message
      if (data.status === 'error') {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', data.message || 'Authentication failed');
        return NextResponse.redirect(loginUrl.toString());
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
    console.error('OAuth callback error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'OAuth callback failed');
    return NextResponse.redirect(loginUrl.toString());
  }
}
