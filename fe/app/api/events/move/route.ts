import { NextRequest } from 'next/server';
import { proxyPost } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * POST /api/events/move
 * Move event between calendars (auth required)
 */
export async function POST(request: NextRequest) {
  return proxyPost(request, ENDPOINTS.EVENTS_MOVE);
}
