import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/calendars/freebusy
 * Query free/busy information for next 24 hours (auth required)
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, ENDPOINTS.CALENDARS_FREEBUSY);
}
