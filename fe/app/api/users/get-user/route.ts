import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/users/get-user
 * Get authenticated user information (auth required)
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, ENDPOINTS.USERS_GET_USER);
}
