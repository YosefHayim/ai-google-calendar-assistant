import express from "express";
import multer from "multer";
import voiceController from "@/controllers/voice-controller";
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
          "Invalid audio format. Supported: webm, mp3, mp4, m4a, wav, ogg, flac",
        ),
      );
    }
  },
});

router.use(supabaseAuth());

router.post("/transcribe", upload.single("audio"), voiceController.transcribe)
router.post("/synthesize", voiceController.synthesize)
router.get("/agents/profiles", voiceController.getAgentProfiles)

export default router
