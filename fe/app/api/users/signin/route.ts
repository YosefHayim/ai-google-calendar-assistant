import { NextRequest } from 'next/server';
import { proxyPost } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * POST /api/users/signin
 * User sign in with email/password
 */
export async function POST(request: NextRequest) {
  return proxyPost(request, ENDPOINTS.USERS_SIGNIN);
}
