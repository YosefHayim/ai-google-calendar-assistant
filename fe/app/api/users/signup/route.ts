import { NextRequest } from 'next/server';
import { proxyPost } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * POST /api/users/signup
 * User registration with email/password
 */
export async function POST(request: NextRequest) {
  return proxyPost(request, ENDPOINTS.USERS_SIGNUP);
}
