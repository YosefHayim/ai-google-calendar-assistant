import { PassThrough, Readable } from "stream";

import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { pipeline } from "stream/promises";
import { promisify } from "util";

// Set ffmpeg path
if (ffmpegStatic && typeof ffmpeg.setFfmpegPath === "function") {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export interface AudioConversionOptions {
  sampleRate?: number; // Default: 24000 (OpenAI Realtime API standard)
  channels?: number; // Default: 1 (mono)
  format?: "pcm_s16le" | "pcm_f32le"; // Default: pcm_s16le (PCM16)
}

/**
 * Convert OGG audio buffer to PCM16 format for OpenAI Realtime API
 * @param oggBuffer - Input OGG audio buffer from Telegram
 * @param options - Conversion options
 * @returns Promise resolving to PCM16 audio buffer
 */
export async function convertOggToPcm16(oggBuffer: Buffer, options: AudioConversionOptions = {}): Promise<Buffer> {
  const { sampleRate = 24000, channels = 1, format = "pcm_s16le" } = options;

  return new Promise((resolve, reject) => {
    const inputStream = Readable.from(oggBuffer);
    const outputChunks: Buffer[] = [];

    const outputStream = new PassThrough();
    outputStream.on("data", (chunk: Buffer) => {
      outputChunks.push(chunk);
    });
    outputStream.on("end", () => {
      resolve(Buffer.concat(outputChunks));
    });
    outputStream.on("error", reject);

    const ffmpegProcess = ffmpeg(inputStream)
      .inputFormat("ogg")
      .audioCodec("pcm_s16le")
      .audioFrequency(sampleRate)
      .audioChannels(channels)
      .format(format)
      .on("error", (error) => {
        reject(new Error(`Audio conversion failed: ${error.message}`));
      })
      .on("end", () => {
        // Stream end is handled by outputStream
      });

    ffmpegProcess.pipe(outputStream, { end: true });
  });
}

/**
 * Convert PCM16 audio buffer to OGG format for Telegram
 * @param pcmBuffer - Input PCM16 audio buffer from OpenAI Realtime API
 * @param options - Conversion options
 * @returns Promise resolving to OGG audio buffer
 */
export async function convertPcm16ToOgg(pcmBuffer: Buffer, options: { sampleRate?: number; channels?: number } = {}): Promise<Buffer> {
  const { sampleRate = 24000, channels = 1 } = options;

  return new Promise((resolve, reject) => {
    const inputStream = Readable.from(pcmBuffer);
    const outputChunks: Buffer[] = [];

    const outputStream = new PassThrough();
    outputStream.on("data", (chunk: Buffer) => {
      outputChunks.push(chunk);
    });
    outputStream.on("end", () => {
      resolve(Buffer.concat(outputChunks));
    });
    outputStream.on("error", reject);

    const ffmpegProcess = ffmpeg(inputStream)
      .inputFormat("s16le")
      .inputOptions([`-ar ${sampleRate}`, `-ac ${channels}`])
      .audioCodec("libopus")
      .format("ogg")
      .on("error", (error) => {
        reject(new Error(`Audio conversion failed: ${error.message}`));
      })
      .on("end", () => {
        // Stream end is handled by outputStream
      });

    ffmpegProcess.pipe(outputStream, { end: true });
  });
}

/**
 * Check if ffmpeg is available
 * @returns true if ffmpeg is available, false otherwise
 */
export function isFfmpegAvailable(): boolean {
  return ffmpegStatic !== null && ffmpegStatic !== undefined;
}
