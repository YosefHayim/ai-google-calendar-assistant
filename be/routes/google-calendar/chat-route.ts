import { NextFunction, Request, Response, Router } from "express";

import { STATUS_RESPONSE } from "@/config/constants";
import { chatController } from "@/controllers/chat-controller";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
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

/**
 * Chat endpoint - processes messages via OpenAI Agents SDK
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

/**
 * Start a new conversation (closes current active conversation)
 */
router.post("/conversations/new", chatController.startNewConversation);

export default router;
