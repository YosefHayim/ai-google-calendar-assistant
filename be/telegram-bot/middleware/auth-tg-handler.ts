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
    // First check telegram_users table, then join with users to get email
    const { data: telegramUser, error } = await SUPABASE
      .from("telegram_users")
      .select("user_id, first_name")
      .eq("telegram_user_id", from.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // Ignore "no rows found" error
      logger.error(`Telegram Bot: Auth: DB Error: ${error.message}`);
    }

    // 3. Logic: If telegram user is linked to a user, get their email
    if (telegramUser?.user_id) {
      const { data: userData } = await SUPABASE
        .from("users")
        .select("email")
        .eq("id", telegramUser.user_id)
        .single();

      if (userData?.email) {
        // Always sync session with DB (Source of Truth)
        session.email = userData.email;
        session.pendingEmailVerification = undefined; // Clear any pending verification
        session.messageCount++;
        return next();
      }
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

        // Create stub entry in users table if it doesn't exist
        let userId: string | null = null;
        const { data: existingUser } = await SUPABASE
          .from("users")
          .select("id")
          .ilike("email", pendingEmail)
          .maybeSingle();

        if (!existingUser) {
          // Create new user entry - OAuth tokens will be populated during Google OAuth flow
          const { data: newUser, error: userError } = await SUPABASE
            .from("users")
            .insert({
              email: pendingEmail,
              status: "pending_verification",
            })
            .select("id")
            .single();

          if (userError || !newUser) {
            logger.error(`Telegram Bot: Auth: Failed to create user: ${userError?.message}`);
            await ctx.reply("Error setting up your account. Please try again.");
            session.email = undefined;
            return;
          }
          userId = newUser.id;
        } else {
          userId = existingUser.id;
        }

        // Check if telegram user already exists by telegram_user_id OR telegram_chat_id
        const { data: existingTelegramUsers } = await SUPABASE
          .from("telegram_users")
          .select("id, telegram_user_id, telegram_chat_id")
          .or(`telegram_user_id.eq.${from.id},telegram_chat_id.eq.${from.id}`);

        let insertRes;
        if (existingTelegramUsers && existingTelegramUsers.length > 0) {
          // Update existing telegram user (use the first match)
          const existingTgUser = existingTelegramUsers[0];
          logger.debug(
            `Updating existing telegram_users record: id=${existingTgUser.id}, telegram_user_id=${existingTgUser.telegram_user_id}, telegram_chat_id=${existingTgUser.telegram_chat_id}`
          );
          insertRes = await SUPABASE
            .from("telegram_users")
            .update({
              telegram_chat_id: from.id,
              telegram_username: from.username,
              first_name: from.first_name,
              language_code: from.language_code,
              is_bot: from.is_bot,
              telegram_user_id: from.id,
              user_id: userId, // Link to users table
              is_linked: true,
              last_activity_at: new Date().toISOString(),
            })
            .eq("id", existingTgUser.id)
            .select()
            .maybeSingle();
        } else {
          // Insert new telegram user
          insertRes = await SUPABASE
            .from("telegram_users")
            .insert({
              telegram_chat_id: from.id,
              telegram_username: from.username,
              first_name: from.first_name,
              language_code: from.language_code,
              is_bot: from.is_bot,
              telegram_user_id: from.id,
              user_id: userId, // Link to users table
              is_linked: true,
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
