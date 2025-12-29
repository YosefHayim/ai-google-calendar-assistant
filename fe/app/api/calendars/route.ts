import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/calendars
 * Get all calendars for authenticated user (auth required)
 * Query params: customCalendars=true|false
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, ENDPOINTS.CALENDARS);
}
