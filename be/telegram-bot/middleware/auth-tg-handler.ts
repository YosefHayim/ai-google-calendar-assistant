import type { GlobalContext } from "../init-bot";
import type { MiddlewareFn } from "grammy";
import { SUPABASE } from "@/config";
import isEmail from "validator/lib/isEmail";
import { logger } from "@/utils/logger";

/**
 * Telegram Authentication Middleware
 *
 * Handles user authentication and email verification for Telegram bot.
 * Sets up session with user info and email from database or user input.
 *
 * @description
 * This middleware:
 * 1. Initializes session with Telegram user info (chatId, userId, username)
 * 2. Loads email from database if user exists in user_telegram_links
 * 3. Prompts for email and saves to database if new user
 * 4. Must run before googleTokenTgHandler middleware
 */
export const authTgHandler: MiddlewareFn<GlobalContext> = async (ctx, next) => {
  logger.info(`Telegram Bot: Auth: authTgHandler middleware called`);

  const from = ctx.from;
  const session = ctx.session;
  logger.info(`Telegram Bot: Auth: from: ${from}`);
  logger.info(`Telegram Bot: Auth: session: ${session}`);
  if (!(from && session)) {
    logger.info(`Telegram Bot: Auth: from or session not found`);
    return next();
  }

  // Initialize session once
  if (!session.chatId) {
    logger.info(`Telegram Bot: Auth: session.chatId not found`);
    session.chatId = from.id;
    session.userId = from.id;
    session.username = from.username;
    session.codeLang = from.language_code;
    session.messageCount = 0;
  }

  // Try to load from DB
  const { data } = await SUPABASE.from("user_telegram_links").select("email,first_name").eq("chat_id", session.chatId).single();
  logger.info(`Telegram Bot: Auth: data: ${data}`);
  if (data?.email) {
    if (!session.email) {
      session.email = data.email;
      logger.info(`Telegram Bot: Auth: session.email found: ${session.email}`);
    }

    session.messageCount++;
    logger.info(`Telegram Bot: Auth: session.messageCount incremented: ${session.messageCount}`);
    return next();
  }

  // Ask for email if missing
  if (!session.email) {
    const text = ctx.message?.text?.trim();
    if (!(text && isEmail(text))) {
      logger.info(`Telegram Bot: Auth: text not found or not email: ${text}`);
      await ctx.reply("First time? Please provide your email to authorize:");
      return; // do NOT call next()
    }

    // Save email
    session.email = text;
    logger.info(`Telegram Bot: Auth: session.email set: ${session.email}`);
    const { error, data } = await SUPABASE.from("user_telegram_links")
      .insert({
        chat_id: from.id,
        username: from.username,
        first_name: from.first_name,
        language_code: from.language_code,
        email: text,
        is_bot: from.is_bot,
        telegram_user_id: from.id,
      })
      .select()
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      logger.error(`Telegram Bot: Auth: error or data not found: ${error}`);
      console.error("[DEBUG] authTgHandler middleware error", { error });
      await ctx.reply("Error saving email. Please try again.");
      return;
    }

    logger.info(`Telegram Bot: Auth: email saved successfully: ${data}`);
    await ctx.reply("Email has been saved successfully!");
    session.messageCount++;
    logger.info(`Telegram Bot: Auth: session.messageCount incremented: ${session.messageCount}`);
    return next();
  }

  logger.info(`Telegram Bot: Auth: next middleware called`);
  return next();
};
