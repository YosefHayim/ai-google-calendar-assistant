import { auditLogger } from "@/utils/audit-logger"

import type { GlobalContext } from "../init-bot";
import type { MiddlewareFn } from "grammy";
import { SUPABASE } from "@/config";
import { getTranslatorFromLanguageCode } from "../i18n";
import { logger } from "@/utils/logger";
import { resetRateLimit } from "./rate-limiter";
import validator from "validator";

const MINUTES_IN_OTP_EXPIRY = 10
const SECONDS_IN_MINUTE = 60
const MS_IN_SECOND = 1000
const OTP_EXPIRY_MS = MINUTES_IN_OTP_EXPIRY * SECONDS_IN_MINUTE * MS_IN_SECOND
const OTP_LENGTH = 6

const sendEmailOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await SUPABASE.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      if (error.message.includes("User not found") || error.message.includes("Signups not allowed")) {
        const { error: createError } = await SUPABASE.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: true,
          },
        });
        if (createError) {
          return { success: false, error: createError.message };
        }
        return { success: true };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
};

const verifyEmailOtp = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
  const normalizedToken = token.replace(/\D/g, "")

  if (normalizedToken.length !== OTP_LENGTH) {
    logger.warn(`OTP verification: Invalid token length after normalization: ${normalizedToken.length}`)
    return { success: false, error: "Invalid OTP format" }
  }

  try {
    const { error } = await SUPABASE.auth.verifyOtp({
      email,
      token: normalizedToken,
      type: "email",
    })

    if (error) {
      logger.warn(`OTP verification failed for ${email}: ${error.message}`)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    const verifyError = err as Error
    logger.error(`OTP verification exception for ${email}: ${verifyError.message}`)
    return { success: false, error: verifyError.message }
  }
}

const isOtpCode = (text: string): boolean => {
  const trimmed = text.trim()
  return validator.isLength(trimmed, { min: OTP_LENGTH, max: OTP_LENGTH }) && validator.isNumeric(trimmed)
}

export const authTgHandler: MiddlewareFn<GlobalContext> = async (ctx, next) => {
  const from = ctx.from;
  const session = ctx.session;

  if (!(from && session)) {
    return next();
  }

  if (!session.chatId) {
    session.chatId = from.id;
    session.userId = from.id;
    session.firstName = from.first_name;
    session.username = from.username;
    session.codeLang = from.language_code;
    session.messageCount = 0;
  }

  const { t } = getTranslatorFromLanguageCode(session.codeLang);

  try {
    const { data: telegramUser, error } = await SUPABASE.from("telegram_users").select("user_id, first_name").eq("telegram_user_id", from.id).single();

    if (error && error.code !== "PGRST116") {
      logger.error(`Telegram Bot: Auth: DB Error: ${error.message}`);
    }

    if (telegramUser?.user_id) {
      const { data: userData } = await SUPABASE.from("users").select("email").eq("id", telegramUser.user_id).single();

      if (userData?.email) {
        session.email = userData.email;
        session.pendingEmailVerification = undefined;
        session.messageCount++;
        return next();
      }
    }

    if (session.email && !session.pendingEmailVerification) {
      session.firstName = from.first_name;
      session.username = from.username;
      session.codeLang = from.language_code;
      return next();
    }

    const text = ctx.message?.text?.trim();

    if (session.pendingEmailVerification) {
      const { email: pendingEmail, expiresAt } = session.pendingEmailVerification;

      if (Date.now() > expiresAt) {
        session.pendingEmailVerification = undefined;
        await ctx.reply(t("auth.otpExpired"), { parse_mode: "HTML" });
        return;
      }

      if (text && isOtpCode(text)) {
        const verification = await verifyEmailOtp(pendingEmail, text);

        if (!verification.success) {
          auditLogger.authFail(from.id, verification.error || "OTP verification failed", pendingEmail);
          await ctx.reply(`${t("auth.otpInvalidError")}\n\n${t("auth.otpInvalidWithNewEmail", { error: verification.error || "" })}`, { parse_mode: "HTML" });
          return;
        }

        auditLogger.authSuccess(from.id, pendingEmail, "otp");
        try {
          await resetRateLimit(from.id, "auth");
        } catch (error) {
          logger.warn(`Failed to reset rate limit for user ${from.id}: ${error}`);
        }
        session.firstName = from.first_name;
        session.username = from.username;
        session.codeLang = from.language_code;
        session.email = pendingEmail;
        session.pendingEmailVerification = undefined;

        let userId: string | null = null;
        const { data: existingUser } = await SUPABASE.from("users").select("id").ilike("email", pendingEmail).maybeSingle();

        if (!existingUser) {
          const { data: newUser, error: userError } = await SUPABASE.from("users")
            .insert({
              email: pendingEmail,
              status: "pending_verification",
            })
            .select("id")
            .single();

          if (userError || !newUser) {
            logger.error(`Telegram Bot: Auth: Failed to create user: ${userError?.message}`);
            await ctx.reply(t("auth.dbSaveError"), { parse_mode: "HTML" });
            session.email = undefined;
            return;
          }
          userId = newUser.id;
        } else {
          userId = existingUser.id;
        }

        const { data: existingTelegramUsers } = await SUPABASE.from("telegram_users")
          .select("id, telegram_user_id, telegram_chat_id")
          .or(`telegram_user_id.eq.${from.id},telegram_chat_id.eq.${from.id}`);

        let insertRes;
        if (existingTelegramUsers && existingTelegramUsers.length > 0) {
          const existingTgUser = existingTelegramUsers[0];
          logger.debug(
            `Updating existing telegram_users record: id=${existingTgUser.id}, telegram_user_id=${existingTgUser.telegram_user_id}, telegram_chat_id=${existingTgUser.telegram_chat_id}`
          );
          insertRes = await SUPABASE.from("telegram_users")
            .update({
              telegram_chat_id: from.id,
              telegram_username: from.username,
              first_name: from.first_name,
              language_code: from.language_code,
              is_bot: from.is_bot,
              telegram_user_id: from.id,
              user_id: userId,
              is_linked: true,
              last_activity_at: new Date().toISOString(),
            })
            .eq("id", existingTgUser.id)
            .select()
            .maybeSingle();
        } else {
          insertRes = await SUPABASE.from("telegram_users")
            .insert({
              telegram_chat_id: from.id,
              telegram_username: from.username,
              first_name: from.first_name,
              language_code: from.language_code,
              is_bot: from.is_bot,
              telegram_user_id: from.id,
              user_id: userId,
              is_linked: true,
            })
            .select()
            .maybeSingle();
        }

        if (insertRes.error || !insertRes.data) {
          logger.error(`Telegram Bot: Auth: Save error: ${insertRes.error?.message}`);
          await ctx.reply(t("auth.dbSaveError"), { parse_mode: "HTML" });
          session.email = undefined;
          return;
        }

        await ctx.reply(t("auth.emailVerifiedSuccess"), { parse_mode: "HTML" });
        session.messageCount++;
        return next();
      }

      if (text && validator.isEmail(text)) {
        const newEmail = text.toLowerCase().trim();
        const otpResult = await sendEmailOtp(newEmail);

        if (!otpResult.success) {
          await ctx.reply(t("auth.otpSendFailed", { error: otpResult.error || "" }), { parse_mode: "HTML" });
          return;
        }

        session.pendingEmailVerification = {
          email: newEmail,
          expiresAt: Date.now() + OTP_EXPIRY_MS,
        };

        await ctx.reply(t("auth.otpSentToNewEmail", { email: newEmail }), { parse_mode: "HTML" });
        return;
      }

      await ctx.reply(t("auth.enterOtpOrNewEmail"), { parse_mode: "HTML" });
      return;
    }

    if (!(text && validator.isEmail(text))) {
      await ctx.reply(t("auth.welcomePrompt"), { parse_mode: "HTML" });
      return;
    }

    const emailToVerify = text.toLowerCase().trim();
    const otpResult = await sendEmailOtp(emailToVerify);

    if (!otpResult.success) {
      await ctx.reply(t("auth.otpSendFailed", { error: otpResult.error || "" }), { parse_mode: "HTML" });
      return;
    }

    session.pendingEmailVerification = {
      email: emailToVerify,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    };

    await ctx.reply(t("auth.enterOtpPrompt", { email: emailToVerify }), { parse_mode: "HTML" });
    return;
  } catch (err) {
    logger.error(`Telegram Bot: Auth: Unexpected error: ${err}`);
    return next();
  }
};
