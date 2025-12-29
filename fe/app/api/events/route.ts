import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/events
 * Get all events for user's calendars (auth required)
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, ENDPOINTS.EVENTS);
}

/**
 * POST /api/events
 * Create new event in calendar (auth required)
 */
export async function POST(request: NextRequest) {
  return proxyPost(request, ENDPOINTS.EVENTS);
}
