import { NextRequest, NextResponse } from 'next/server'

function generateNonce(): string {
  // Generate a random nonce using Web Crypto API (Edge Runtime compatible)
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

export function middleware(request: NextRequest) {
  // Generate a random nonce for CSP
  const nonce = generateNonce()

  // Clone the response headers
  const response = NextResponse.next()

  // Set nonce for use in components
  response.headers.set('x-nonce', nonce)

  // Set CSP header with nonce
  const isDev = process.env.NODE_ENV === 'development'
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'strict-dynamic' 'nonce-${nonce}' https://accounts.google.com https://www.googletagmanager.com https://lmsqueezy.com`,
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    `connect-src 'self' ${isDev ? 'http://localhost:3000 ws://localhost:3000 ' : ''}https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://api.openai.com https://raw.githubusercontent.com https://*.awsapprunner.com https://*.ingest.sentry.io https://*.sentry.io https://*.posthog.com https://be.askally.io https://lmsqueezy.com`,
    "frame-src 'self' https://accounts.google.com",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "trusted-types default",
    "require-trusted-types-for 'script'",
    "upgrade-insecure-requests",
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}