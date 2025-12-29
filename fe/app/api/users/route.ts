import { NextRequest } from 'next/server';
import { proxyDelete } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * DELETE /api/users
 * Deactivate user account (auth required)
 */
export async function DELETE(request: NextRequest) {
  return proxyDelete(request, ENDPOINTS.USERS);
}
