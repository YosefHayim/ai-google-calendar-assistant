import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/calendars/timezones/:id
 * Get timezone for specific calendar (auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, ENDPOINTS.CALENDARS_TIMEZONES_BY_ID(id));
}
