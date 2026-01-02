import { Router } from "express";
import { chatController } from "@/controllers/chat-controller";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const chatRoute = Router();

/**
 * Streaming chat endpoint using Server-Sent Events (SSE)
 * Uses OpenAI Agents SDK to process messages and stream responses
 */
chatRoute.post("/stream", supabaseAuth(), googleTokenValidation, chatController.streamChat);

/**
 * Non-streaming chat endpoint for fallback
 */
chatRoute.post("/", supabaseAuth(), googleTokenValidation, chatController.sendChat);

export default chatRoute;
