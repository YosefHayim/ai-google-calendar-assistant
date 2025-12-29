import { NextRequest } from 'next/server';
import { proxyPost } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * POST /api/users/verify-user-by-email-otp
 * Verify user email via OTP token
 */
export async function POST(request: NextRequest) {
  return proxyPost(request, ENDPOINTS.USERS_VERIFY_OTP);
}
