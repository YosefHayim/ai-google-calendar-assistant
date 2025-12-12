/**
 * OpenAI Transcription API Route Handler
 * Transcribes audio using OpenAI Whisper API
 */

import { NextRequest, NextResponse } from "next/server";

import type { components } from "@/types";

type ErrorResponse = components["schemas"]["ErrorResponse"];
type ApiResponse = components["schemas"]["ApiResponse"];

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

    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!openaiApiKey) {
      const errorResponse: ErrorResponse = {
        status: "error",
        message: "OpenAI API key is not configured",
        data: {
          error: "Missing API key",
        },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Convert File to Blob for OpenAI API
    const audioBlob = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(audioBlob);

    // Create form data for OpenAI API
    const openaiFormData = new FormData();
    const audioFileBlob = new Blob([audioBuffer], { type: audioFile.type || "audio/webm" });
    openaiFormData.append("file", audioFileBlob, audioFile.name || "audio.webm");
    openaiFormData.append("model", "whisper-1");

    // Call OpenAI Whisper API
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorResponse: ErrorResponse = {
        status: "error",
        message: "Failed to transcribe audio",
        data: {
          error: errorData,
        },
      };
      return NextResponse.json(errorResponse, { status: response.status });
    }

    const data = await response.json();

    const successResponse: ApiResponse = {
      status: "success",
      message: "Audio transcribed successfully",
      data: {
        text: data.text || "",
      },
    };
    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Transcription error:", error);
    const errorResponse: ErrorResponse = {
      status: "error",
      message: "Error transcribing audio",
      data: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
