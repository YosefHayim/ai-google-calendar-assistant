import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/calendars/timezones
 * Get calendar timezone information (auth required)
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, ENDPOINTS.CALENDARS_TIMEZONES);
}
