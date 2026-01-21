import express from "express";
import multer from "multer";
import voiceController from "@/domains/voice/controllers/voice-controller";
import {
  voiceBurstLimiter,
  voiceRateLimiter,
} from "@/middlewares/rate-limiter";
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth";

const router = express.Router();

const BYTES_PER_KB = 1024;
const KB_PER_MB = 1024;
const MB_IN_BYTES = BYTES_PER_KB * KB_PER_MB;
const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * MB_IN_BYTES;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      "audio/webm",
      "audio/mp3",
      "audio/mpeg",
      "audio/mp4",
      "audio/m4a",
      "audio/wav",
      "audio/ogg",
      "audio/flac",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid audio format. Supported: webm, mp3, mp4, m4a, wav, ogg, flac"
        )
      );
    }
  },
});

router.use(supabaseAuth());

/**
 * POST /transcribe - Convert Audio to Text Transcription
 *
 * Processes uploaded audio files and converts speech to text using AI speech recognition.
 * Supports various audio formats and provides timestamps for word-level alignment.
 *
 * @param {File} req.file - Audio file uploaded via multipart/form-data
 * @param {string} req.file.mimetype - Audio MIME type (webm, mp3, mp4, m4a, wav, ogg, flac)
 * @param {Buffer} req.file.buffer - Audio file data in memory
 * @param {string} req.file.originalname - Original filename
 * @param {number} req.file.size - File size in bytes (max 25MB)
 * @param {Object} req.body - Additional transcription parameters
 * @param {string} req.body.language - Language code for transcription (optional)
 * @param {boolean} req.body.timestamps - Whether to include word timestamps
 * @param {string} req.body.model - AI model to use for transcription
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Transcription results
 * @property {string} text - Full transcribed text
 * @property {Array} segments - Text segments with timing information
 * @property {Object} segments[].text - Segment text content
 * @property {number} segments[].start - Start time in seconds
 * @property {number} segments[].end - End time in seconds
 * @property {number} segments[].confidence - Transcription confidence score
 * @property {Object} metadata - Processing metadata
 * @property {string} metadata.language - Detected or specified language
 * @property {number} metadata.duration - Audio duration in seconds
 *
 * @related Voice interaction flow. Converts user speech input into text that can
 * be processed by the AI assistant, enabling voice-based calendar management and
 * conversation capabilities.
 */
router.post(
  "/transcribe",
  voiceBurstLimiter,
  voiceRateLimiter,
  upload.single("audio"),
  voiceController.transcribe
);
/**
 * POST /synthesize - Convert Text to Speech Audio
 *
 * Generates natural-sounding speech audio from text input using AI text-to-speech synthesis.
 * Supports multiple voices, languages, and speech characteristics for personalized audio output.
 *
 * @param {Object} req.body - Text-to-speech synthesis parameters
 * @param {string} req.body.text - Text content to convert to speech
 * @param {string} req.body.voice - Voice identifier for speech synthesis
 * @param {string} req.body.language - Language code for pronunciation
 * @param {number} req.body.speed - Speech speed multiplier (0.5-2.0, default 1.0)
 * @param {string} req.body.format - Output audio format ('mp3', 'wav', 'ogg')
 * @param {Object} req.body.voice_settings - Voice characteristic adjustments
 * @param {number} req.body.voice_settings.stability - Voice stability (0-1)
 * @param {number} req.body.voice_settings.similarity - Voice similarity (0-1)
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Stream|Buffer} Audio data in requested format
 * @header {string} Content-Type - Audio MIME type (audio/mpeg, audio/wav, etc.)
 * @header {string} Content-Length - Audio file size in bytes
 * @header {Object} X-Voice-Metadata - Metadata about the synthesized speech
 *
 * @related Voice output flow. Converts AI assistant responses into audible speech
 * for voice-based interfaces, enabling hands-free calendar interaction and
 * accessibility features for users who prefer audio feedback.
 */
router.post(
  "/synthesize",
  voiceBurstLimiter,
  voiceRateLimiter,
  voiceController.synthesize
);

export default router;
