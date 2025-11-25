import type { GlobalContext } from "../init-bot";
import type { MiddlewareFn } from "grammy";
import { SUPABASE } from "@/config/root-config";
import isEmail from "validator/lib/isEmail";
import { randomUUID } from "crypto";

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
    session.username = from.username ?? "";
    session.codeLang = from.language_code ?? "en";
    session.messageCount = 0;
  }

  // Try to load from DB
  const { data } = await SUPABASE.from("user_telegram_links").select("email,first_name").eq("chat_id", session.chatId).maybeSingle();

  if (data?.email) {
    if (!session.email) {
      session.email = data.email;
    }
    session.messageCount++;
    return next(); // single exit with next()
  }

  // Ask for email if missing
  if (!session.email) {
    // Allow voice messages to pass through (they don't have text)
    // Voice handler will handle the response appropriately
    if (ctx.message?.voice) {
      return next();
    }

    const text = ctx.message?.text?.trim();
    if (!(text && isEmail(text))) {
      await ctx.reply("First time? Please provide your email to authorize:");
      return; // do NOT call next()
    }

    // Save email
    session.email = text;

    // Check if user exists in user_calendar_tokens table
    const { data: existingToken } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", text).maybeSingle();

    let userId: string | null = null;
    if (existingToken?.user_id) {
      userId = existingToken.user_id;
    } else {
      // Create new user_id and add to user_calendar_tokens
      userId = randomUUID();
      const { error: tokenError } = await SUPABASE.from("user_calendar_tokens").insert({
        user_id: userId,
        email: text,
        is_active: true,
      });

      if (tokenError) {
        console.error("Error creating user calendar token:", tokenError);
        userId = null;
      }
    }

    // Save telegram link (user_id field doesn't exist in user_telegram_links table)
    await SUPABASE.from("user_telegram_links").upsert({
      chat_id: from.id,
      username: from.username,
      first_name: from.first_name,
      language_code: from.language_code,
      email: text,
    });
    await ctx.reply("Email has been saved successfully!");
    session.messageCount++;
    return next();
  }

  return next();
};
