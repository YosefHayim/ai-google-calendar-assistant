import type { Context, SessionFlavor } from "grammy";

import type { SessionData } from "@/types";
import { logger } from "@/utils/logger";

type BotContext = SessionFlavor<SessionData> & Context;

export const isDuplicateMessage = (ctx: BotContext, msgId: number): boolean => {
  if (ctx.session.lastProcessedMsgId === msgId) {
    return true;
  }
  ctx.session.lastProcessedMsgId = msgId;
  return false;
};

export const resetSession = (ctx: BotContext): void => {
  ctx.session.agentActive = false;
  ctx.session.isProcessing = false;
  ctx.session.pendingConfirmation = undefined;
};
