import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/events/filtered
 * Get filtered events based on query parameters (auth required)
 * Query params: calendarId, timeMin, timeMax, maxResults, singleEvents, orderBy, q, showDeleted
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, ENDPOINTS.EVENTS_FILTERED);
}
