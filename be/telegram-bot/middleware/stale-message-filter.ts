import type { MiddlewareFn } from "grammy";
import { logger } from "@/utils/logger";
import type { GlobalContext } from "../init-bot";

/**
 * Maximum age of a message in seconds before it's considered stale.
 * Messages older than this threshold will be silently discarded.
 * Default: 60 seconds
 */
const STALE_MESSAGE_THRESHOLD_SECONDS = 60;

/**
 * Stale Message Filter Middleware
 *
 * Filters out old messages that accumulated during server downtime.
 * When the server restarts, Telegram may deliver a backlog of queued messages.
 * This middleware prevents the bot from processing outdated messages,
 * avoiding a flood of irrelevant responses to the user.
 *
 * How it works:
 * 1. Extracts the `date` timestamp from the incoming Telegram update
 * 2. Compares it against the current server time
 * 3. If the message is older than the threshold, silently discards it
 * 4. If the message is fresh, proceeds with normal processing
 */
export const staleMessageFilter: MiddlewareFn<GlobalContext> = async (
  ctx,
  next
) => {
  // Extract the message timestamp from the update
  // Telegram provides the date as Unix timestamp (seconds since epoch)
  const messageDate =
    ctx.message?.date ?? ctx.callbackQuery?.message?.date ?? null;

  // If no date is available (e.g., inline queries, channel posts without date),
  // proceed with normal processing
  if (messageDate === null) {
    return next();
  }

  // Calculate message age in seconds
  const currentTimeSeconds = Math.floor(Date.now() / 1000);
  const messageAgeSeconds = currentTimeSeconds - messageDate;

  // Check if the message is stale
  if (messageAgeSeconds > STALE_MESSAGE_THRESHOLD_SECONDS) {
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    const updateType = ctx.updateType;

    logger.info(
      `Stale message filter: Discarding ${updateType} from user ${userId} in chat ${chatId}. ` +
        `Message age: ${messageAgeSeconds}s (threshold: ${STALE_MESSAGE_THRESHOLD_SECONDS}s)`
    );

    // Silently discard the message by not calling next()
    return;
  }

  // Message is fresh, proceed with normal processing
  return next();
};
