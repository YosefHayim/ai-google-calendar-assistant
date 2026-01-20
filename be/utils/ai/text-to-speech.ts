import OpenAI from "openai";
import { env } from "@/config/env";
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

/**
 * @description Generates speech audio from text using OpenAI's Text-to-Speech API.
 * Produces MP3 audio output suitable for web playback. Automatically truncates
 * text exceeding the maximum character limit (4096 chars) with a warning log.
 *
 * @param {string} text - The text content to convert to speech
 * @param {TTSVoice} [voice="alloy"] - The voice to use for synthesis. Options: "alloy", "echo", "fable", "onyx", "nova", "shimmer"
 * @returns {Promise<TTSResult>} Result object with success status and audio buffer or error message
 *
 * @example
 * const result = await generateSpeech("Hello, this is a test message.", "nova");
 * if (result.success && result.audioBuffer) {
 *   // Use the MP3 audio buffer
 *   fs.writeFileSync("output.mp3", result.audioBuffer);
 * }
 *
 * @example
 * // Handle errors
 * const result = await generateSpeech("");
 * if (!result.success) {
 *   console.error(result.error); // "No text provided for speech generation"
 * }
 */
export async function generateSpeech(
  text: string,
  voice: TTSVoice = DEFAULT_VOICE
): Promise<TTSResult> {
  if (!text.trim()) {
    return { success: false, error: "No text provided for speech generation" };
  }

  const inputText =
    text.length > MAX_TTS_CHARS
      ? (logger.warn(
          `TTS: Truncating text from ${text.length} to ${MAX_TTS_CHARS} chars`
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

/**
 * @description Generates speech audio optimized for Telegram voice messages using OpenAI's TTS API.
 * Produces Opus audio format which is required for Telegram voice messages and provides
 * better compression for voice content. Automatically truncates text exceeding 4096 characters.
 *
 * @param {string} text - The text content to convert to speech
 * @param {TTSVoice} [voice="alloy"] - The voice to use for synthesis. Options: "alloy", "echo", "fable", "onyx", "nova", "shimmer"
 * @returns {Promise<TTSResult>} Result object with success status and Opus audio buffer or error message
 *
 * @example
 * const result = await generateSpeechForTelegram("Your meeting starts in 10 minutes.", "shimmer");
 * if (result.success && result.audioBuffer) {
 *   // Send as Telegram voice message
 *   await bot.sendVoice(chatId, result.audioBuffer);
 * }
 */
export async function generateSpeechForTelegram(
  text: string,
  voice: TTSVoice = DEFAULT_VOICE
): Promise<TTSResult> {
  if (!text.trim()) {
    return { success: false, error: "No text provided for speech generation" };
  }

  const inputText =
    text.length > MAX_TTS_CHARS
      ? (logger.warn(
          `TTS: Truncating text from ${text.length} to ${MAX_TTS_CHARS} chars`
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
      `TTS: Generated ${audioBuffer.length} bytes of Opus audio for Telegram`
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

/**
 * @description Type guard function that validates whether a string is a valid TTS voice option.
 * Checks if the provided voice string matches one of the supported OpenAI TTS voices:
 * "alloy", "echo", "fable", "onyx", "nova", or "shimmer".
 *
 * @param {string} voice - The voice string to validate
 * @returns {voice is TTSVoice} True if the voice is valid, with TypeScript type narrowing to TTSVoice
 *
 * @example
 * const userVoice = req.query.voice as string;
 * if (isValidVoice(userVoice)) {
 *   // userVoice is now typed as TTSVoice
 *   await generateSpeech(text, userVoice);
 * } else {
 *   // Fall back to default voice
 *   await generateSpeech(text);
 * }
 */
export function isValidVoice(voice: string): voice is TTSVoice {
  return TTS_VOICES.includes(voice as TTSVoice);
}
