/**
 * Calendar Event API Route Handler
 * Handles individual event operations (GET, PATCH, DELETE)
 */

import { NextRequest } from "next/server";
import { proxyToBackend, parseRequestBody } from "@/lib/api/utils/proxy";

// GET /api/calendars/[eventId] - Get specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  return proxyToBackend(request, `/api/calendars/${eventId}`);
}

// PATCH /api/calendars/[eventId] - Update event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const body = await parseRequestBody(request);
  return proxyToBackend(request, `/api/calendars/${eventId}`, {
    method: "PATCH",
    body,
  });
}

// DELETE /api/calendars/[eventId] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  return proxyToBackend(request, `/api/calendars/${eventId}`, {
    method: "DELETE",
  });
}

