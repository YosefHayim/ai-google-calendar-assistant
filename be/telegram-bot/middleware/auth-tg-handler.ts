import type { GlobalContext } from "../init-bot";
import type { MiddlewareFn } from "grammy";
import { SUPABASE } from "@/config";
import { isEmail } from "validator";
import { logger } from "@/utils/logger";

export const authTgHandler: MiddlewareFn<GlobalContext> = async (ctx, next) => {
  logger.info(`Telegram Bot: Auth: authTgHandler middleware called`);

  const from = ctx.from;
  const session = ctx.session;

  if (!(from && session)) {
    logger.info(`Telegram Bot: Auth: from or session not found`);
    return next();
  }

  // 1. Initialize session if missing
  if (!session.chatId) {
    session.chatId = from.id;
    session.userId = from.id;
    session.username = from.username;
    session.codeLang = from.language_code;
    session.messageCount = 0;
  }

  try {
    // 2. Try to load from DB
    const { data, error } = await SUPABASE.from("user_telegram_links").select("email,first_name").eq("chat_id", session.chatId).single();

    if (error && error.code !== "PGRST116") {
      // Ignore "no rows found" error
      logger.error(`Telegram Bot: Auth: DB Error: ${error.message}`);
    }

    // 3. Logic: If DB has email, Sync it to Session AND Context
    if (data?.email) {
      // Always sync session with DB (Source of Truth)
      session.email = data.email;

      // CRITICAL FIX: Pass email to the temporary context for the next middleware
      // You might need to add 'email' to your GlobalContext type definition
      (ctx as any).email = data.email;

      logger.info(`Telegram Bot: Auth: Email synced: ${session.email}`);
      session.messageCount++;
      return next();
    }

    // 4. If Session has email but DB failed (Edge case), pass it along
    if (session.email) {
      (ctx as any).email = session.email;
      return next();
    }

    // 5. Ask for email if missing in both DB and Session
    const text = ctx.message?.text?.trim();
    if (!(text && isEmail(text))) {
      await ctx.reply("First time? Please provide your email to authorize:");
      return;
    }

    // 6. Save new email
    session.email = text;
    (ctx as any).email = text; // Fix for current request

    const insertRes = await SUPABASE.from("user_telegram_links")
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
      .maybeSingle();

    if (insertRes.error || !insertRes.data) {
      logger.error(`Telegram Bot: Auth: Save error: ${insertRes.error?.message}`);
      await ctx.reply("Error saving email. Please try again.");
      return;
    }

    await ctx.reply("Email has been saved successfully!");
    session.messageCount++;
    return next();
  } catch (err) {
    logger.error(`Telegram Bot: Auth: Unexpected error: ${err}`);
    return next(); // Proceed or handle gracefully
  }
};
