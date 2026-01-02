import { Router } from "express";
import { chatController } from "@/controllers/chat-controller";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = Router();

router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh());

/**
 * Chat endpoint that returns regular HTTP response
 * Uses OpenAI Agents SDK to process messages and returns complete response
 * Frontend uses typewriter component to simulate real-time typing
 */
router.post("/stream", supabaseAuth(), googleTokenValidation, chatController.streamChat);

/**
 * Non-streaming chat endpoint for fallback
 */
router.post("/", supabaseAuth(), googleTokenValidation, chatController.sendChat);

export default router;
