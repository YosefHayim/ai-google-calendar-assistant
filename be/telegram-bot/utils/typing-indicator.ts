import { logger } from "@/utils/logger";
import type { GlobalContext } from "../handlers/bot-config";

const TYPING_INTERVAL_MS = 4000; // Telegram typing indicator lasts ~5 seconds

/**
 * Starts a typing indicator that repeats until stopped.
 * Returns a function to stop the indicator.
 */
export function startTypingIndicator(ctx: GlobalContext): () => void {
  const chatId = ctx.chat?.id;
  if (!chatId) {
    return () => {};
  }

  let isActive = true;

  const sendTyping = async () => {
    if (!isActive) {
      return;
    }
    try {
      await ctx.api.sendChatAction(chatId, "typing");
    } catch (error) {
      logger.debug(`Typing indicator error: ${error}`);
    }
  };

  // Send immediately
  sendTyping();

  // Keep sending every 4 seconds
  const intervalId = setInterval(sendTyping, TYPING_INTERVAL_MS);

  // Return stop function
  return () => {
    isActive = false;
    clearInterval(intervalId);
  };
}
