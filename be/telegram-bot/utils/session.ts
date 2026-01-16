import type { Context, SessionFlavor } from "grammy";

import type { SessionData } from "@/types";

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
  ctx.session.pendingEmailChange = undefined;
  ctx.session.awaitingEmailChange = undefined;
  // Reset activity on manual reset to prevent immediate expiry
  ctx.session.lastActivity = Date.now();
};
