import OpenAI from "openai";
import { env } from "@/config";
import { logger } from "@/utils/logger";

const openai = new OpenAI({ apiKey: env.openAiApiKey });

export const TTS_VOICES = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
] as const;
export type TTSVoice = (typeof TTS_VOICES)[number];

export const DEFAULT_VOICE: TTSVoice = "alloy";

const MAX_TTS_CHARS = 4096;

export type TTSResult = {
  success: boolean;
  audioBuffer?: Buffer;
  error?: string;
};

export async function generateSpeech(
  text: string,
  voice: TTSVoice = DEFAULT_VOICE,
): Promise<TTSResult> {
  if (!text.trim()) {
    return { success: false, error: "No text provided for speech generation" };
  }

  const inputText =
    text.length > MAX_TTS_CHARS
      ? (logger.warn(
          `TTS: Truncating text from ${text.length} to ${MAX_TTS_CHARS} chars`,
        ),
        text.substring(0, MAX_TTS_CHARS))
      : text;

  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: inputText,
      response_format: "mp3",
    });

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    logger.debug(`TTS: Generated ${audioBuffer.length} bytes of audio`);

    return { success: true, audioBuffer };
  } catch (error) {
    logger.error(`TTS: Speech generation failed: ${error}`);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate speech",
    };
  }
}

export async function generateSpeechForTelegram(
  text: string,
  voice: TTSVoice = DEFAULT_VOICE,
): Promise<TTSResult> {
  if (!text.trim()) {
    return { success: false, error: "No text provided for speech generation" };
  }

  const inputText =
    text.length > MAX_TTS_CHARS
      ? (logger.warn(
          `TTS: Truncating text from ${text.length} to ${MAX_TTS_CHARS} chars`,
        ),
        text.substring(0, MAX_TTS_CHARS))
      : text;

  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice,
      input: inputText,
      response_format: "opus",
    });

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    logger.debug(
      `TTS: Generated ${audioBuffer.length} bytes of Opus audio for Telegram`,
    );

    return { success: true, audioBuffer };
  } catch (error) {
    logger.error(`TTS: Telegram speech generation failed: ${error}`);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate speech for Telegram",
    };
  }
}

export function isValidVoice(voice: string): voice is TTSVoice {
  return TTS_VOICES.includes(voice as TTSVoice);
}
