import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/users/signup/github
 * Initiate GitHub OAuth sign-up flow
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, ENDPOINTS.USERS_SIGNUP_GITHUB);
}
