import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/proxy';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * GET /api/whatsapp
 * WhatsApp webhook verification endpoint
 * Query params: hub.mode, hub.challenge, hub.verify_token
 */
export async function GET(request: NextRequest) {
  return proxyGet(request, ENDPOINTS.WHATSAPP);
}
