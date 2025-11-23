import type { MiddlewareFn } from "grammy";
import isEmail from "validator/lib/isEmail";
import { SUPABASE } from "@/config/root-config";
import type { GlobalContext } from "../init-bot";

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
  const { data } = await SUPABASE.from("user_telegram_links").select("email,first_name").eq("chat_id", session.chatId).single();

  if (data?.email) {
    if (!session.email) {
      session.email = data.email;
    }
    if (session.messageCount === 0) {
      await ctx.reply(`Hello there ${data.first_name}`);
    }
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
    
    // Ensure user exists in users table
    const { data: existingUser } = await SUPABASE.from("users").select("user_id").eq("email", text).single();
    
    let userId: string | null = null;
    if (existingUser?.user_id) {
      userId = existingUser.user_id;
    } else {
      // Create user if doesn't exist
      const { data: newUser, error: userError } = await SUPABASE.from("users")
        .insert({
          email: text,
          is_active: true,
          metadata: {
            telegram_username: from.username,
            telegram_first_name: from.first_name,
            language_code: from.language_code,
          },
        })
        .select("user_id")
        .single();
      
      if (userError) {
        console.error("Error creating user:", userError);
      } else if (newUser?.user_id) {
        userId = newUser.user_id;
      }
    }
    
    // Save telegram link with user_id
    await SUPABASE.from("user_telegram_links").upsert({
      chat_id: from.id,
      username: from.username,
      first_name: from.first_name,
      language_code: from.language_code,
      email: text,
      user_id: userId,
    });
    await ctx.reply("Email has been saved successfully!");
    session.messageCount++;
    return next();
  }

  return next();
};
