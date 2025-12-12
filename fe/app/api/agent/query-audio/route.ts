/**
 * Agent Query Audio API Route Handler
 * Proxies audio queries to backend
 */

import { NextRequest, NextResponse } from "next/server";

import type { components } from "@/types";

type ErrorResponse = components["schemas"]["ErrorResponse"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      const errorResponse: ErrorResponse = {
        status: "error",
        message: "Audio file is required",
        data: {
          error: "Missing audio file",
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get backend URL
    let backendUrl = process.env.BACKEND_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:3001";

    // Validate that the URL is not a placeholder
    if (backendUrl.includes("placeholder") || !backendUrl.startsWith("http")) {
      console.error("Invalid backend URL detected:", backendUrl);
      backendUrl = "http://localhost:3001"; // Fallback to correct default
    }
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
    const errorResponse: ErrorResponse = {
      status: "error",
      message: "Error proxying audio query",
      data: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
