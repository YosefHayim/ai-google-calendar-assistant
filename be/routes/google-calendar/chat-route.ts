import { Router } from "express";
import { chatController } from "@/controllers/chat-controller";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = Router();

router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh());

// ============================================
// Chat Message Endpoints
// ============================================

/**
 * Chat endpoint that returns regular HTTP response
 * Uses OpenAI Agents SDK to process messages and returns complete response
 * Frontend uses typewriter component to simulate real-time typing
 */
router.post("/stream", chatController.streamChat);

/**
 * Non-streaming chat endpoint for fallback
 */
router.post("/", chatController.sendChat);

// ============================================
// Conversation Management Endpoints
// ============================================

/**
 * Get list of user's conversations
 * Query params: ?limit=20&offset=0
 */
router.get("/conversations", chatController.getConversations);

/**
 * Get a specific conversation by ID
 */
router.get("/conversations/:id", chatController.getConversation);

/**
 * Delete a conversation
 */
router.delete("/conversations/:id", chatController.removeConversation);

/**
 * Continue an existing conversation - send message to specific conversation
 */
router.post("/conversations/:id/messages", chatController.continueConversation);

export default router;
