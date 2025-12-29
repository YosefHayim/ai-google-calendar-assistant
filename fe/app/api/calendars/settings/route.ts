import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/calendars/settings
 * Get general calendar settings (timezone) (auth required)
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, ENDPOINTS.CALENDARS_SETTINGS);
}
