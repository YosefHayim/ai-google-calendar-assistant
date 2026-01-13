import { NextFunction, Request, Response, Router } from "express";

import { STATUS_RESPONSE } from "@/config/constants";
import { chatController } from "@/controllers/chat-controller";
import { chatStreamController } from "@/controllers/chat-stream-controller";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { aiChatRateLimiter, aiChatBurstLimiter } from "@/middlewares/rate-limiter";
import { logger } from "@/utils/logger";
import { sendR } from "@/utils";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = Router();

router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh());

router.param(
  "id",
  (_req: Request, res: Response, next: NextFunction, id: string) => {
    if (!id) {
      logger.error(`Google Calendar: Chat: id not found`);
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "ID parameter is required.",
      );
    }
    next();
  },
);

router.post("/", aiChatBurstLimiter, aiChatRateLimiter, chatController.sendChat);
router.post("/stream", aiChatBurstLimiter, aiChatRateLimiter, chatStreamController.streamChat);

// ============================================
// Conversation Management Endpoints
// ============================================

/**
 * Get list of user's conversations
 * Query params: ?limit=20&offset=0
 */
router.get("/conversations", chatController.getConversations);

/**
 * Start a new conversation (closes current active conversation)
 * Must be before :id routes to avoid matching "new" as an ID
 */
router.post("/conversations/new", chatController.startNewConversation);

/**
 * Delete all conversations for the authenticated user
 */
router.delete("/conversations", chatController.deleteAllConversations);

/**
 * Reset all memory (embeddings, context, conversations) for the authenticated user
 * This clears all learned patterns and conversation history
 */
router.delete("/memory", chatController.resetMemory);

/**
 * Get a specific conversation by ID
 */
router.get("/conversations/:id", chatController.getConversation);

/**
 * Delete a conversation
 */
router.delete("/conversations/:id", chatController.removeConversation);

router.post("/conversations/:id/messages", aiChatBurstLimiter, aiChatRateLimiter, chatController.continueConversation);
router.post("/conversations/:id/messages/stream", aiChatBurstLimiter, aiChatRateLimiter, chatStreamController.streamContinueConversation);

router.post("/conversations/:id/share", chatController.createShareLink);
router.delete("/conversations/:id/share", chatController.revokeShareLink);
router.get("/conversations/:id/share", chatController.getShareStatus);

export default router;
