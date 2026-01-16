import { Readable } from "node:stream";
import OpenAI from "openai";
import { env } from "@/config";

const openai = new OpenAI({ apiKey: env.openAiApiKey });

export type TranscriptionResult = {
  success: boolean;
  text?: string;
  error?: string;
};

/**
 * @description Transcribes audio content to text using OpenAI's Whisper speech-to-text API.
 * Accepts audio in various formats (webm, mp3, mp4, m4a, wav, ogg, flac) and returns
 * the transcribed text. Handles file conversion for the API and provides meaningful
 * error messages for empty or unclear audio.
 *
 * @param {Buffer} audioBuffer - The audio data as a Node.js Buffer
 * @param {string} [mimeType="audio/webm"] - The MIME type of the audio (e.g., "audio/webm", "audio/mp3", "audio/ogg")
 * @returns {Promise<TranscriptionResult>} Result object with success status and transcribed text or error message
 *
 * @example
 * // Transcribe a voice message from Telegram
 * const audioBuffer = await downloadVoiceMessage(fileId);
 * const result = await transcribeAudio(audioBuffer, "audio/ogg");
 * if (result.success) {
 *   console.log(`User said: ${result.text}`);
 * }
 *
 * @example
 * // Handle transcription failure
 * const result = await transcribeAudio(audioBuffer);
 * if (!result.success) {
 *   await sendMessage("Sorry, I couldn't understand the audio. Please try again.");
 * }
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType = "audio/webm"
): Promise<TranscriptionResult> {
  try {
    // Normalize MIME type by stripping codec specifications (e.g., "audio/webm;codecs=opus" -> "audio/webm")
    // OpenAI's Whisper API doesn't accept MIME types with codec parameters
    const normalizedMimeType = mimeType.split(";")[0].trim();
    const extension = getExtensionFromMimeType(normalizedMimeType);
    const filename = `audio.${extension}`;

    const file = await OpenAI.toFile(Readable.from(audioBuffer), filename, {
      type: normalizedMimeType,
    });

    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
      response_format: "text",
    });

    const text = typeof response === "string" ? response : String(response);

    if (!text.trim()) {
      return {
        success: false,
        error: "Could not transcribe audio. Please try speaking more clearly.",
      };
    }

    return { success: true, text: text.trim() };
  } catch (error) {
    console.error("Transcription error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to transcribe audio.",
    };
  }
}

/**
 * @description Maps an audio MIME type to its corresponding file extension.
 * Used to create properly named temporary files for the OpenAI Whisper API,
 * which requires files to have the correct extension. Defaults to "webm"
 * for unrecognized MIME types.
 *
 * @param {string} mimeType - The audio MIME type (e.g., "audio/mp3", "audio/ogg")
 * @returns {string} The file extension without a leading dot (e.g., "mp3", "ogg", "webm")
 *
 * @example
 * getExtensionFromMimeType("audio/mp3");   // Returns "mp3"
 * getExtensionFromMimeType("audio/mpeg");  // Returns "mp3"
 * getExtensionFromMimeType("audio/ogg");   // Returns "ogg"
 * getExtensionFromMimeType("audio/unknown"); // Returns "webm" (default)
 */
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
  };
  return mimeMap[mimeType] ?? "webm";
}
