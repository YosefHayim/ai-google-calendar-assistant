/**
 * Agent Query Audio API Route Handler
 * Proxies audio queries to backend
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ message: "Audio file is required", error: "Missing audio file" }, { status: 400 });
    }

    // Get backend URL
    const backendUrl = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:3000";
    const url = new URL("/api/agent/query-audio", backendUrl);

    // Forward cookies from the incoming request
    const cookieHeader = request.headers.get("cookie");
    const headers: HeadersInit = {};
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    // Create new FormData for backend
    const backendFormData = new FormData();
    backendFormData.append("audio", audioFile);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: backendFormData,
      credentials: "include",
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Audio query proxy error:", error);
    return NextResponse.json(
      {
        message: "Error proxying audio query",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
