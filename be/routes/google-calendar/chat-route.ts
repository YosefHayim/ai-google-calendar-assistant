import type { NextFunction, Request, Response } from "express";
import {
  aiChatBurstLimiter,
  aiChatRateLimiter,
} from "@/middlewares/rate-limiter";

import { Router } from "express";
import { STATUS_RESPONSE } from "@/config/constants";
import { chatController } from "@/controllers/chat-controller";
import { chatStreamController } from "@/controllers/chat-stream-controller";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { logger } from "@/utils/logger";
import { sendR } from "@/utils";
import { subscriptionGuard } from "@/middlewares/subscription-guard";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = Router();

const withGoogleAuth = [
  supabaseAuth(),
  subscriptionGuard(),
  googleTokenValidation,
  googleTokenRefresh(),
];

router.param(
  "id",
  (_req: Request, res: Response, next: NextFunction, id: string) => {
    if (!id) {
      logger.error("Google Calendar: Chat: id not found");
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "ID parameter is required."
      );
    }
    next();
  }
);

// POST / - Send chat message
router.post(
  "/",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatController.sendChat
);
// POST /stream - Send chat message with streaming response
router.post(
  "/stream",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatStreamController.streamChat
);

// GET /conversations - Get user conversations
router.get("/conversations", supabaseAuth(), chatController.getConversations);
// POST /conversations/new - Start new conversation
router.post(
  "/conversations/new",
  supabaseAuth(),
  chatController.startNewConversation
);
// DELETE /conversations - Delete all conversations
router.delete(
  "/conversations",
  supabaseAuth(),
  chatController.deleteAllConversations
);
// DELETE /memory - Reset user memory
router.delete("/memory", supabaseAuth(), chatController.resetMemory);
// GET /conversations/:id - Get specific conversation
router.get(
  "/conversations/:id",
  supabaseAuth(),
  chatController.getConversation
);
// PATCH /conversations/:id - Update conversation title
router.patch(
  "/conversations/:id",
  supabaseAuth(),
  chatController.updateConversationTitle
);
// PATCH /conversations/:id/pin - Toggle conversation pin status
router.patch(
  "/conversations/:id/pin",
  supabaseAuth(),
  chatController.toggleConversationPinned
);
// DELETE /conversations/:id - Delete specific conversation
router.delete(
  "/conversations/:id",
  supabaseAuth(),
  chatController.removeConversation
);
// POST /conversations/:id/archive - Archive specific conversation
router.post(
  "/conversations/:id/archive",
  supabaseAuth(),
  chatController.archiveConversation
);
// POST /conversations/:id/restore - Restore specific conversation
router.post(
  "/conversations/:id/restore",
  supabaseAuth(),
  chatController.restoreConversation
);
// GET /conversations/archived - Get all archived conversations
router.get(
  "/conversations/archived",
  supabaseAuth(),
  chatController.getArchivedConversations
);
// POST /conversations/archived/restore-all - Restore all archived conversations
router.post(
  "/conversations/archived/restore-all",
  supabaseAuth(),
  chatController.restoreAllArchivedConversations
);

// POST /conversations/:id/messages - Continue conversation with new message
router.post(
  "/conversations/:id/messages",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatController.continueConversation
);
// POST /conversations/:id/messages/stream - Continue conversation with streaming response
router.post(
  "/conversations/:id/messages/stream",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatStreamController.streamContinueConversation
);

// POST /conversations/:id/share - Create shareable link for conversation
router.post(
  "/conversations/:id/share",
  supabaseAuth(),
  chatController.createShareLink
);
// DELETE /conversations/:id/share - Revoke shareable link
router.delete(
  "/conversations/:id/share",
  supabaseAuth(),
  chatController.revokeShareLink
);
// GET /conversations/:id/share - Get sharing status
router.get(
  "/conversations/:id/share",
  supabaseAuth(),
  chatController.getShareStatus
);

export default router;
