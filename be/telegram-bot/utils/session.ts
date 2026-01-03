import type { Context, SessionFlavor } from "grammy";

import type { SessionData } from "@/types";
import { logger } from "@/utils/logger";

type BotContext = SessionFlavor<SessionData> & Context;

export const isDuplicateMessage = (ctx: BotContext, msgId: number): boolean => {
  logger.info(`Telegram Bot: Session: Checking duplicate message: ${ctx.session.lastProcessedMsgId}, ${msgId}`);
  if (ctx.session.lastProcessedMsgId === msgId) {
    logger.info(`Telegram Bot: Session: Duplicate message found: ${ctx.session.lastProcessedMsgId}, ${msgId}`);
    return true;
  }
  ctx.session.lastProcessedMsgId = msgId;
  logger.info(`Telegram Bot: Session: Message not duplicate: ${ctx.session.lastProcessedMsgId}, ${msgId}`);
  return false;
};

export const resetSession = (ctx: BotContext): void => {
  logger.info(`Telegram Bot: Session: Resetting session: ${ctx.session.lastProcessedMsgId}`);
  ctx.session.agentActive = false;
  ctx.session.isProcessing = false;
  ctx.session.pendingConfirmation = undefined;
  logger.info(`Telegram Bot: Session: Session reset: ${ctx.session.lastProcessedMsgId}`);
};
