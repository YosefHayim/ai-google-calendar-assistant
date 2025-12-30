import type { GlobalContext } from "../init-bot";
import type { MiddlewareFn } from "grammy";
import { SUPABASE } from "@/config";
import isEmail from "validator/lib/isEmail";

/**
 * Authenticate Telegram user by token using Supabase Auth Get User
 *
 * @param {Context} ctx - The context object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<void>} The response object.
 * @description Authenticates a Telegram user by token and sends the response.
 * @example
 * const data = await authTgHandler(ctx, next);
 * console.log(data);
 */
export const authTgHandler: MiddlewareFn<GlobalContext> = async (ctx, next) => {
  const from = ctx.from;
  const session = ctx.session;

  if (!(from && session)) {
    return next();
  }

  // Initialize session once
  if (!session.chatId) {
    session.chatId = from.id;
    session.userId = from.id;
    session.username = from.username;
    session.codeLang = from.language_code;
    session.messageCount = 0;
  }

  // Try to load from DB
  const { data } = await SUPABASE.from("user_telegram_links").select("email,first_name").eq("chat_id", session.chatId).single();

  if (data?.email) {
    if (!session.email) {
      session.email = data.email;
    }
    // if (session.messageCount === 0) {
    //   await ctx.reply(`Hi ${data.first_name}`);
    // }
    session.messageCount++;
    return next(); // single exit with next()
  }

  // Ask for email if missing
  if (!session.email) {
    const text = ctx.message?.text?.trim();
    if (!(text && isEmail(text))) {
      await ctx.reply("First time? Please provide your email to authorize:");
      return; // do NOT call next()
    }

    // Save email
    session.email = text;
    await SUPABASE.from("user_telegram_links").upsert({
      chat_id: from.id,
      username: from.username,
      first_name: from.first_name,
      language_code: from.language_code,
      email: text,
      updated_at: new Date().toISOString(),
    });
    await ctx.reply("Email has been saved successfully!");
    session.messageCount++;
    return next();
  }

  return next();
};
