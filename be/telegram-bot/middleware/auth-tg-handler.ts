import type { GlobalContext } from "../init-bot";
import type { MiddlewareFn } from "grammy";
import { OAUTH2CLIENT, REDIRECT_URI, SCOPES, SUPABASE } from "@/config";
import { fetchGoogleTokensByEmail } from "@/utils/auth/google-token";
import isEmail from "validator/lib/isEmail";

/**
 * Generate Google OAuth URL for calendar authorization
 */
const generateGoogleAuthUrl = (): string => {
  return OAUTH2CLIENT.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    include_granted_scopes: true,
    redirect_uri: REDIRECT_URI,
  });
};

/**
 * Check if user has valid Google Calendar tokens and prompt for auth if missing
 */
const checkAndPromptCalendarAuth = async (ctx: GlobalContext, email: string): Promise<boolean> => {
  const { data: tokens } = await fetchGoogleTokensByEmail(email);

  // User has active tokens - proceed normally
  if (tokens?.is_active && tokens?.refresh_token) {
    return true;
  }

  // No tokens or tokens are inactive - provide OAuth URL
  const authUrl = generateGoogleAuthUrl();
  const message = tokens?.is_active === false
    ? "Your Google Calendar access has been revoked. Please reconnect:"
    : "To help you manage your calendar, I need access to your Google Calendar. Please authorize:";

  await ctx.reply(`${message}\n\n${authUrl}`);
  return false;
};

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
    session.messageCount++;

    // Check if user has Google Calendar tokens, prompt for auth if missing
    const hasCalendarAuth = await checkAndPromptCalendarAuth(ctx, data.email);
    if (!hasCalendarAuth) {
      return; // Stop here until user authorizes Google Calendar
    }

    return next();
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

    // Check if user has Google Calendar tokens, prompt for auth if missing
    const hasCalendarAuth = await checkAndPromptCalendarAuth(ctx, text);
    if (!hasCalendarAuth) {
      return; // Stop here until user authorizes Google Calendar
    }

    return next();
  }

  return next();
};
