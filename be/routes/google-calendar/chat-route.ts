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

router.post(
  "/",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatController.sendChat
);
router.post(
  "/stream",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatStreamController.streamChat
);

router.get("/conversations", supabaseAuth(), chatController.getConversations);
router.post(
  "/conversations/new",
  supabaseAuth(),
  chatController.startNewConversation
);
router.delete(
  "/conversations",
  supabaseAuth(),
  chatController.deleteAllConversations
);
router.delete("/memory", supabaseAuth(), chatController.resetMemory);
router.get(
  "/conversations/:id",
  supabaseAuth(),
  chatController.getConversation
);
router.patch(
  "/conversations/:id",
  supabaseAuth(),
  chatController.updateConversationTitle
);
router.delete(
  "/conversations/:id",
  supabaseAuth(),
  chatController.removeConversation
);

router.post(
  "/conversations/:id/messages",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatController.continueConversation
);
router.post(
  "/conversations/:id/messages/stream",
  withGoogleAuth,
  aiChatBurstLimiter,
  aiChatRateLimiter,
  chatStreamController.streamContinueConversation
);

router.post(
  "/conversations/:id/share",
  supabaseAuth(),
  chatController.createShareLink
);
router.delete(
  "/conversations/:id/share",
  supabaseAuth(),
  chatController.revokeShareLink
);
router.get(
  "/conversations/:id/share",
  supabaseAuth(),
  chatController.getShareStatus
);

export default router;
