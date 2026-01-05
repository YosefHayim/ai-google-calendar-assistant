import type { GlobalContext } from "../init-bot";
import { SUPABASE } from "@/config";
import { isEmail } from "validator";
import { logger } from "@/utils/logger";
import { auditLogger } from "@/utils/audit-logger";

// Email change OTP expiry time (10 minutes)
const EMAIL_CHANGE_EXPIRY_MS = 10 * 60 * 1000;

/**
 * Send OTP to new email for verification
 */
const sendEmailOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await SUPABASE.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Create user if doesn't exist
      },
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
 * Verify OTP code for email change
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
export const isOtpCode = (text: string): boolean => {
  return /^\d{6}$/.test(text.trim());
};

/**
 * Initiate email change - send OTP to new email
 */
export const initiateEmailChange = async (ctx: GlobalContext, newEmail: string): Promise<void> => {
  const userId = ctx.from?.id;
  const oldEmail = ctx.session.email;

  if (!userId || !oldEmail) {
    await ctx.reply("You must be authenticated to change your email.");
    return;
  }

  if (!isEmail(newEmail)) {
    await ctx.reply("Please enter a valid email address.");
    return;
  }

  const normalizedEmail = newEmail.toLowerCase().trim();

  if (normalizedEmail === oldEmail.toLowerCase()) {
    await ctx.reply("This is already your linked email address.");
    return;
  }

  // Check if email is already linked to another account
  // First find the user by email, then check if they have a telegram link
  const { data: existingUser } = await SUPABASE
    .from("users")
    .select("id")
    .ilike("email", normalizedEmail)
    .single();

  if (existingUser) {
    const { data: existingTelegramLink } = await SUPABASE
      .from("telegram_users")
      .select("telegram_user_id")
      .eq("user_id", existingUser.id)
      .single();

    if (existingTelegramLink && existingTelegramLink.telegram_user_id !== userId) {
      await ctx.reply("This email is already linked to another Telegram account.");
      return;
    }
  }

  // Send OTP to new email
  const otpResult = await sendEmailOtp(normalizedEmail);

  if (!otpResult.success) {
    logger.error(`Email change OTP failed: ${otpResult.error}`);
    await ctx.reply(`Failed to send verification code: ${otpResult.error}`);
    return;
  }

  // Store pending email change
  ctx.session.pendingEmailChange = {
    newEmail: normalizedEmail,
    expiresAt: Date.now() + EMAIL_CHANGE_EXPIRY_MS,
  };
  ctx.session.awaitingEmailChange = undefined;

  await ctx.reply(
    `A verification code has been sent to ${normalizedEmail}.\n\n` +
      `Please enter the 6-digit code to confirm the email change.\n\n` +
      `This code expires in 10 minutes. Type /cancel to abort.`
  );
};

/**
 * Verify OTP and complete email change
 * Returns true if the message was handled, false otherwise
 */
export const handlePendingEmailChange = async (ctx: GlobalContext, text: string): Promise<boolean> => {
  const pending = ctx.session.pendingEmailChange;
  const userId = ctx.from?.id;
  const oldEmail = ctx.session.email;

  if (!pending || !userId || !oldEmail) {
    return false;
  }

  // Check expiry
  if (Date.now() > pending.expiresAt) {
    ctx.session.pendingEmailChange = undefined;
    await ctx.reply("Verification code expired. Please start the email change process again via /settings.");
    return true;
  }

  // Check if user wants to cancel
  if (text.toLowerCase() === "/cancel" || text.toLowerCase() === "cancel") {
    ctx.session.pendingEmailChange = undefined;
    await ctx.reply("Email change cancelled.");
    return true;
  }

  // Check if input is a new email (user wants to try different email)
  if (isEmail(text)) {
    await initiateEmailChange(ctx, text);
    return true;
  }

  // Check if input is OTP code
  if (!isOtpCode(text)) {
    await ctx.reply("Please enter the 6-digit verification code, a new email address, or /cancel to abort.");
    return true;
  }

  // Verify OTP
  const verification = await verifyEmailOtp(pending.newEmail, text);

  if (!verification.success) {
    await ctx.reply(`Invalid verification code: ${verification.error}\n\nPlease try again or type a new email address.`);
    return true;
  }

  // Get the user_id from telegram_users first
  const { data: telegramUser } = await SUPABASE
    .from("telegram_users")
    .select("user_id")
    .eq("telegram_user_id", userId)
    .single();

  if (!telegramUser?.user_id) {
    logger.error(`Email change failed: No user found for telegram_user_id=${userId}`);
    await ctx.reply("Failed to update email. Please try again.");
    return true;
  }

  // Update email in users table
  const { error: updateError } = await SUPABASE
    .from("users")
    .update({
      email: pending.newEmail,
      updated_at: new Date().toISOString(),
    })
    .eq("id", telegramUser.user_id);

  if (updateError) {
    logger.error(`Email change update failed: ${updateError.message}`);
    await ctx.reply("Failed to update email. Please try again.");
    return true;
  }

  // Audit log
  auditLogger.emailChange(userId, oldEmail, pending.newEmail);

  // Clear google tokens to force re-auth with new email
  ctx.session.googleTokens = undefined;
  ctx.session.email = pending.newEmail;
  ctx.session.pendingEmailChange = undefined;

  await ctx.reply(
    `Email successfully changed to ${pending.newEmail}!\n\n` + `You'll need to re-authorize Google Calendar access with your new email.`
  );

  return true;
};

/**
 * Cancel pending email change
 */
export const cancelEmailChange = (ctx: GlobalContext): void => {
  ctx.session.pendingEmailChange = undefined;
  ctx.session.awaitingEmailChange = undefined;
};
