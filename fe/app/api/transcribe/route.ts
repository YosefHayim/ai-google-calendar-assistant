/**
 * OpenAI Transcription API Route Handler
 * Transcribes audio using OpenAI Whisper API
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ message: "Audio file is required", error: "Missing audio file" }, { status: 400 });
    }

    // Get OpenAI API key from environment
    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!openaiApiKey) {
      return NextResponse.json({ message: "OpenAI API key is not configured", error: "Missing API key" }, { status: 500 });
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
      return NextResponse.json(
        {
          message: "Failed to transcribe audio",
          error: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      message: "Audio transcribed successfully",
      data: {
        text: data.text || "",
      },
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      {
        message: "Error transcribing audio",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
