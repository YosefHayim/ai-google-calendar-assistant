import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/events/analytics
 * Get event analytics by date range (auth required)
 * Query params: startDate, endDate
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, ENDPOINTS.EVENTS_ANALYTICS);
}
