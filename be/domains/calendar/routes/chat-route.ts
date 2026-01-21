import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { STATUS_RESPONSE } from "@/config/constants";
import { chatController } from "@/domains/chat/controllers/chat-controller";
import { chatStreamController } from "@/domains/chat/controllers/chat-stream-controller";
import { googleTokenRefresh } from "@/domains/auth/middleware/google-token-refresh";
import { googleTokenValidation } from "@/domains/auth/middleware/google-token-validation";
import {
  aiChatBurstLimiter,
  aiChatRateLimiter,
} from "@/middlewares/rate-limiter";
import { subscriptionGuard } from "@/domains/auth/middleware/subscription-guard";
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth";
import { sendR } from "@/utils";
import { logger } from "@/lib/logger";

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
// DELETE /conversations/:id - Delete specific conversation
router.delete(
  "/conversations/:id",
  supabaseAuth(),
  chatController.removeConversation
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
