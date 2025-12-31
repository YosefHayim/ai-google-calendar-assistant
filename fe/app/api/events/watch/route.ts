import { NextRequest } from 'next/server';
import { proxyPost } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * POST /api/events/watch
 * Watch events for changes (auth required)
 */
export async function POST(request: NextRequest) {
  return proxyPost(request, ENDPOINTS.EVENTS_WATCH);
}
