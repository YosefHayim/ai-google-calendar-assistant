import { AuditEventType, auditLogger } from "@/utils/audit-logger";

import type { GlobalContext } from "../init-bot";
import type { MiddlewareFn } from "grammy";
import { SUPABASE } from "@/config";
import { isEmail } from "validator";
import { logger } from "@/utils/logger";
import { resetRateLimit } from "./rate-limiter";

// OTP expiry time in milliseconds (10 minutes)
const OTP_EXPIRY_MS = 10 * 60 * 1000;

/**
 * Send OTP to email for verification
 */
const sendEmailOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await SUPABASE.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't auto-create user, just send OTP
      },
    });

    if (error) {
      // If user doesn't exist, try with shouldCreateUser: true
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

/**
 * Verify OTP code
 */
const verifyEmailOtp = async (email: string, token: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await SUPABASE.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
};

/**
 * Check if input looks like an OTP code (6 digits)
 */
const isOtpCode = (text: string): boolean => {
  return /^\d{6}$/.test(text.trim());
};

export const authTgHandler: MiddlewareFn<GlobalContext> = async (ctx, next) => {
  const from = ctx.from;
  const session = ctx.session;

  if (!(from && session)) {
    return next();
  }

  // 1. Initialize session if missing
  if (!session.chatId) {
    session.chatId = from.id;
    session.userId = from.id;
    session.firstName = from.first_name;
    session.username = from.username;
    session.codeLang = from.language_code;
    session.messageCount = 0;
  }

  try {
    // 2. Try to load from DB by telegram_user_id (for multi-device support)
    const { data, error } = await SUPABASE.from("user_telegram_links").select("email,first_name").eq("telegram_user_id", from.id).single();

    if (error && error.code !== "PGRST116") {
      // Ignore "no rows found" error
      logger.error(`Telegram Bot: Auth: DB Error: ${error.message}`);
    }

    // 3. Logic: If DB has email, Sync it to Session AND Context
    if (data?.email) {
      // Always sync session with DB (Source of Truth)
      session.email = data.email;
      session.pendingEmailVerification = undefined; // Clear any pending verification
      session.messageCount++;
      return next();
    }

    // 4. If Session has verified email but DB failed (Edge case), pass it along
    if (session.email && !session.pendingEmailVerification) {
      session.firstName = from.first_name;
      session.username = from.username;
      session.codeLang = from.language_code;
      return next();
    }

    const text = ctx.message?.text?.trim();

    // 5. Check if user is in OTP verification flow
    if (session.pendingEmailVerification) {
      const { email: pendingEmail, expiresAt } = session.pendingEmailVerification;

      // Check if OTP has expired
      if (Date.now() > expiresAt) {
        session.pendingEmailVerification = undefined;
        await ctx.reply("Verification code expired. Please enter your email again:");
        return;
      }

      // Check if input is an OTP code
      if (text && isOtpCode(text)) {
        const verification = await verifyEmailOtp(pendingEmail, text);

        if (!verification.success) {
          auditLogger.authFail(from.id, verification.error || "OTP verification failed", pendingEmail);
          await ctx.reply(`Invalid verification code. Please try again or type a new email address.\n\nError: ${verification.error}`);
          return;
        }

        // OTP verified successfully - save the email
        auditLogger.authSuccess(from.id, pendingEmail, "otp");
        // Reset auth rate limit on successful verification (non-fatal if Redis is down)
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

        // Create stub entry in user_calendar_tokens if it doesn't exist (to satisfy FK constraint)
        const { data: existingToken } = await SUPABASE.from("user_calendar_tokens").select("email").ilike("email", pendingEmail).maybeSingle();

        if (!existingToken) {
          // Create stub entry to satisfy FK constraint
          // Only set email and is_active - other fields will be populated during Google OAuth
          const { error: tokenError } = await SUPABASE.from("user_calendar_tokens").insert({
            email: pendingEmail,
            is_active: false, // Not authenticated with Google yet
          });

          if (tokenError) {
            logger.error(`Telegram Bot: Auth: Failed to create token stub: ${tokenError.message}`);
            await ctx.reply("Error setting up your account. Please try again.");
            session.email = undefined;
            return;
          }
        }

        // Check if user already exists by telegram_user_id OR chat_id
        // (both should be the same in private chats, but one might be NULL in existing records)
        const { data: existingUsers } = await SUPABASE.from("user_telegram_links")
          .select("id, telegram_user_id, chat_id")
          .or(`telegram_user_id.eq.${from.id},chat_id.eq.${from.id}`);

        let insertRes;
        if (existingUsers && existingUsers.length > 0) {
          // Update existing user (use the first match, they should all be the same user)
          const existingUser = existingUsers[0];
          logger.debug(
            `Updating existing user_telegram_links record: id=${existingUser.id}, telegram_user_id=${existingUser.telegram_user_id}, chat_id=${existingUser.chat_id}`
          );
          insertRes = await SUPABASE.from("user_telegram_links")
            .update({
              chat_id: from.id,
              username: from.username,
              first_name: from.first_name,
              language_code: from.language_code,
              email: pendingEmail,
              is_bot: from.is_bot,
              telegram_user_id: from.id, // Ensure this is set even if it was NULL before
            })
            .eq("id", existingUser.id) // Update by primary key to be safe
            .select()
            .maybeSingle();
        } else {
          // Insert new user
          insertRes = await SUPABASE.from("user_telegram_links")
            .insert({
              chat_id: from.id,
              username: from.username,
              first_name: from.first_name,
              language_code: from.language_code,
              email: pendingEmail,
              is_bot: from.is_bot,
              telegram_user_id: from.id,
            })
            .select()
            .maybeSingle();
        }

        if (insertRes.error || !insertRes.data) {
          logger.error(`Telegram Bot: Auth: Save error: ${insertRes.error?.message}`);
          await ctx.reply("Error saving email. Please try again.");
          session.email = undefined;
          return;
        }

        await ctx.reply("Email verified and saved successfully! You can now use the bot.");
        session.messageCount++;
        return next();
      }

      // User entered something else - check if it's a new email
      if (text && isEmail(text)) {
        // User wants to try a different email
        const newEmail = text.toLowerCase().trim();
        const otpResult = await sendEmailOtp(newEmail);

        if (!otpResult.success) {
          await ctx.reply(`Failed to send verification code: ${otpResult.error}\n\nPlease try again with a different email.`);
          return;
        }

        session.pendingEmailVerification = {
          email: newEmail,
          expiresAt: Date.now() + OTP_EXPIRY_MS,
        };

        await ctx.reply(`Verification code sent to ${newEmail}.\n\nPlease enter the 6-digit code from your email (valid for 10 minutes):`);
        return;
      }

      // Invalid input
      await ctx.reply("Please enter the 6-digit verification code from your email, or enter a different email address:");
      return;
    }

    // 6. Ask for email if missing in both DB and Session
    if (!(text && isEmail(text))) {
      await ctx.reply("Welcome! To get started, please enter your email address for verification:");
      return;
    }

    // 7. SECURITY FIX: Send OTP instead of immediately saving email
    const emailToVerify = text.toLowerCase().trim();
    const otpResult = await sendEmailOtp(emailToVerify);

    if (!otpResult.success) {
      await ctx.reply(`Failed to send verification code: ${otpResult.error}\n\nPlease try again with a different email.`);
      return;
    }

    // Store pending verification
    session.pendingEmailVerification = {
      email: emailToVerify,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    };

    await ctx.reply(
      `A verification code has been sent to ${emailToVerify}.\n\n` +
        `Please enter the 6-digit code from your email (valid for 10 minutes).\n\n` +
        `If you entered the wrong email, just type the correct one.`
    );
    return;
  } catch (err) {
    logger.error(`Telegram Bot: Auth: Unexpected error: ${err}`);
    return next(); // Proceed or handle gracefully
  }
};
