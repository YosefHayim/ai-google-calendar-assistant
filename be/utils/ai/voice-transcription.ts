import OpenAI from "openai"
import { env } from "@/config"
import { Readable } from "node:stream"

const openai = new OpenAI({ apiKey: env.openAiApiKey })

export type TranscriptionResult = {
  success: boolean
  text?: string
  error?: string
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType = "audio/webm"
): Promise<TranscriptionResult> {
  try {
    const extension = getExtensionFromMimeType(mimeType)
    const filename = `audio.${extension}`

    const file = await OpenAI.toFile(Readable.from(audioBuffer), filename, {
      type: mimeType,
    })

    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
      response_format: "text",
    })

    const text = typeof response === "string" ? response : String(response)

    if (!text.trim()) {
      return { success: false, error: "Could not transcribe audio. Please try speaking more clearly." }
    }

    return { success: true, text: text.trim() }
  } catch (error) {
    console.error("Transcription error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to transcribe audio.",
    }
  }
}

function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    "audio/webm": "webm",
    "audio/mp3": "mp3",
    "audio/mpeg": "mp3",
    "audio/mp4": "mp4",
    "audio/m4a": "m4a",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/flac": "flac",
  }
  return mimeMap[mimeType] ?? "webm"
}
