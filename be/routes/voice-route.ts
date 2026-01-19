import express from "express";
import multer from "multer";
import voiceController from "@/controllers/voice-controller";
import {
  voiceBurstLimiter,
  voiceRateLimiter,
} from "@/middlewares/rate-limiter";
import { supabaseAuth } from "@/middlewares/supabase-auth";

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

// POST /transcribe - Transcribe audio file to text
router.post(
  "/transcribe",
  voiceBurstLimiter,
  voiceRateLimiter,
  upload.single("audio"),
  voiceController.transcribe
);
// POST /synthesize - Synthesize text to speech audio
router.post(
  "/synthesize",
  voiceBurstLimiter,
  voiceRateLimiter,
  voiceController.synthesize
);

export default router;
