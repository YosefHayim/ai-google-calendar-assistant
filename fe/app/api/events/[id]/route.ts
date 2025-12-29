import { NextRequest } from 'next/server';
import { proxyGet, proxyPatch, proxyDelete } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/events/:id
 * Get specific event by event ID (auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(request, ENDPOINTS.EVENTS_BY_ID(id));
}

/**
 * PATCH /api/events/:id
 * Update existing event (auth required)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyPatch(request, ENDPOINTS.EVENTS_BY_ID(id));
}

/**
 * DELETE /api/events/:id
 * Delete event from calendar (auth required)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyDelete(request, ENDPOINTS.EVENTS_BY_ID(id));
}
