import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/users/callback
 * Google OAuth callback handler
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, ENDPOINTS.USERS_CALLBACK);
}
