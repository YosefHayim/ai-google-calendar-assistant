import type { NextFunction, Request, Response } from "express";
import { Router } from "express";

import { STATUS_RESPONSE } from "@/config/constants";
import { chatController } from "@/controllers/chat-controller";
import { chatStreamController } from "@/controllers/chat-stream-controller";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import {
  aiChatBurstLimiter,
  aiChatRateLimiter,
} from "@/middlewares/rate-limiter";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { sendR } from "@/utils";
import { logger } from "@/utils/logger";

const router = Router();

const authOnly = supabaseAuth();
const withGoogleAuth = [
  supabaseAuth(),
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

router.get("/conversations", authOnly, chatController.getConversations);
router.post(
  "/conversations/new",
  authOnly,
  chatController.startNewConversation
);
router.delete(
  "/conversations",
  authOnly,
  chatController.deleteAllConversations
);
router.delete("/memory", authOnly, chatController.resetMemory);
router.get("/conversations/:id", authOnly, chatController.getConversation);
router.delete(
  "/conversations/:id",
  authOnly,
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
  authOnly,
  chatController.createShareLink
);
router.delete(
  "/conversations/:id/share",
  authOnly,
  chatController.revokeShareLink
);
router.get("/conversations/:id/share", authOnly, chatController.getShareStatus);

export default router;
