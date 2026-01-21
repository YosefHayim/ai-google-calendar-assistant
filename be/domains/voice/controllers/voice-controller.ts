import type { Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import { getVoicePreference } from "@/domains/settings/services/user-preferences-service";
import {
  DEFAULT_VOICE,
  generateSpeech,
  isValidVoice,
  type TTSVoice,
} from "@/domains/analytics/utils";
import { transcribeAudio } from "@/domains/analytics/utils";
import { reqResAsyncHandler, sendR } from "@/lib/http";

/**
 * Transcribes audio files to text using speech-to-text AI services.
 * Accepts audio file uploads and returns the transcribed text content.
 * Supports various audio formats and handles transcription errors gracefully.
 *
 * @param req - Express request with uploaded audio file
 * @param res - Express response object
 * @returns Promise resolving to transcription result or error response
 */
const transcribe = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Audio file is required.");
  }

  const result = await transcribeAudio(req.file.buffer, req.file.mimetype);

  if (!result.success) {
    return sendR(
      res,
      STATUS_RESPONSE.BAD_REQUEST,
      result.error ?? "Transcription failed."
    );
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Audio transcribed successfully", {
    text: result.text,
  });
});

/**
 * Synthesizes text to speech audio using AI text-to-speech services.
 * Converts text input to audio output with configurable voice settings.
 * Uses user preferences for voice selection when available, falls back to defaults.
 *
 * @param req - Express request with text and optional voice parameters
 * @param res - Express response object that returns audio stream
 * @returns Promise resolving to audio buffer or error response
 */
const synthesize = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { text, voice: requestedVoice } = req.body as {
    text?: string;
    voice?: string;
  };

  if (!text?.trim()) {
    return sendR(
      res,
      STATUS_RESPONSE.BAD_REQUEST,
      "Text is required for speech synthesis."
    );
  }

  let voice: TTSVoice = DEFAULT_VOICE;

  if (requestedVoice && isValidVoice(requestedVoice)) {
    voice = requestedVoice;
  } else if (req.user!.id) {
    const pref = await getVoicePreference(req.user!.id);
    if (pref?.voice && isValidVoice(pref.voice)) {
      voice = pref.voice;
    }
  }

  const result = await generateSpeech(text, voice);

  if (!(result.success && result.audioBuffer)) {
    return sendR(
      res,
      STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
      result.error ?? "Speech synthesis failed."
    );
  }

  res.set({
    "Content-Type": "audio/mpeg",
    "Content-Length": result.audioBuffer.length.toString(),
    "Content-Disposition": "inline; filename=speech.mp3",
  });

  return res.send(result.audioBuffer);
});

export default { transcribe, synthesize };
