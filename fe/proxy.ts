import { NextRequest, NextResponse } from 'next/server'

export function proxy(_request: NextRequest) {
  // Proxy is currently only used for the matcher configuration
  // CSP is handled in next.config.mjs for better reliability
  return NextResponse.next()
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