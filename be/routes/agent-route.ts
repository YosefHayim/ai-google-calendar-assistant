import { agentController } from "@/controllers/agent-controller";
import { authHandler } from "@/middlewares/auth-handler";
import express from "express";
import multer from "multer";

const router = express.Router();

// Configure multer for audio file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

/**
 * @swagger
 * /api/agent/query:
 *   post:
 *     summary: Query the AI agent with a text prompt
 *     tags: [Agent]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QueryAgentRequest'
 *           example:
 *             query: "What events do I have today?"
 *     responses:
 *       200:
 *         description: Agent query processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QueryAgentResponse'
 *       400:
 *         description: Bad request - Query is required and must be a string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/query", authHandler, agentController.queryAgent);

/**
 * @swagger
 * /api/agent/query-audio:
 *   post:
 *     summary: Query the AI agent with an audio file
 *     tags: [Agent]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - audio
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: Audio file (webm format recommended, max 25MB)
 *     responses:
 *       200:
 *         description: Agent query processed successfully with audio transcription
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/QueryAgentWithAudioResponse'
 *       400:
 *         description: Bad request - Audio file is required or no text was transcribed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/query-audio", authHandler, upload.single("audio"), agentController.queryAgentWithAudio);

export default router;
