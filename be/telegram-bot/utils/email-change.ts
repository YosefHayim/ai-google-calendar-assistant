import { isEmail } from "validator"
import { SUPABASE } from "@/config"
import { auditLogger } from "@/lib/audit-logger"
import { logger } from "@/lib/logger"
import type { GlobalContext } from "../init-bot"

const MINUTES_IN_EMAIL_CHANGE_EXPIRY = 10
const SECONDS_IN_MINUTE = 60
const MS_IN_SECOND = 1000
const EMAIL_CHANGE_EXPIRY_MS =
  MINUTES_IN_EMAIL_CHANGE_EXPIRY * SECONDS_IN_MINUTE * MS_IN_SECOND
const OTP_LENGTH = 6

const sendEmailOtp = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await SUPABASE.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Create user if doesn't exist
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    const error = err as Error
    return { success: false, error: error.message }
  }
}

const verifyEmailOtp = async (
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  const normalizedToken = token.replace(/\D/g, "")

  if (normalizedToken.length !== OTP_LENGTH) {
    logger.warn(
      `Email change OTP verification: Invalid token length: ${normalizedToken.length}`
    )
    return { success: false, error: "Invalid OTP format" }
  }

  try {
    const { error } = await SUPABASE.auth.verifyOtp({
      email,
      token: normalizedToken,
      type: "email",
    })

    if (error) {
      logger.warn(
        `Email change OTP verification failed for ${email}: ${error.message}`
      )
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    const verifyError = err as Error
    logger.error(
      `Email change OTP verification exception for ${email}: ${verifyError.message}`
    )
    return { success: false, error: verifyError.message }
  }
}

const OTP_REGEX = new RegExp(`^\\d{${OTP_LENGTH}}$`)

export const isOtpCode = (text: string): boolean => OTP_REGEX.test(text.trim())

/**
 * Initiate email change - send OTP to new email
 */
export const initiateEmailChange = async (
  ctx: GlobalContext,
  newEmail: string
): Promise<void> => {
  const userId = ctx.from?.id
  const oldEmail = ctx.session.email

  if (!(userId && oldEmail)) {
    await ctx.reply("You must be authenticated to change your email.")
    return
  }

  if (!isEmail(newEmail)) {
    await ctx.reply("Please enter a valid email address.")
    return
  }

  const normalizedEmail = newEmail.toLowerCase().trim()

  if (normalizedEmail === oldEmail.toLowerCase()) {
    await ctx.reply("This is already your linked email address.")
    return
  }

  // Check if email is already linked to another account
  // First find the user by email, then check if they have a telegram link
  const { data: existingUser } = await SUPABASE.from("users")
    .select("id")
    .ilike("email", normalizedEmail)
    .single()

  if (existingUser) {
    const { data: existingTelegramLink } = await SUPABASE.from("telegram_users")
      .select("telegram_user_id")
      .eq("user_id", existingUser.id)
      .single()

    if (
      existingTelegramLink &&
      existingTelegramLink.telegram_user_id !== userId
    ) {
      await ctx.reply(
        "This email is already linked to another Telegram account."
      )
      return
    }
  }

  // Send OTP to new email
  const otpResult = await sendEmailOtp(normalizedEmail)

  if (!otpResult.success) {
    logger.error(`Email change OTP failed: ${otpResult.error}`)
    await ctx.reply(`Failed to send verification code: ${otpResult.error}`)
    return
  }

  // Store pending email change
  ctx.session.pendingEmailChange = {
    newEmail: normalizedEmail,
    expiresAt: Date.now() + EMAIL_CHANGE_EXPIRY_MS,
  }
  ctx.session.awaitingEmailChange = undefined

  await ctx.reply(
    `A verification code has been sent to ${normalizedEmail}.\n\n` +
      "Please enter the 6-digit code to confirm the email change.\n\n" +
      "This code expires in 10 minutes. Type /cancel to abort."
  )
}

/**
 * Verify OTP and complete email change
 * Returns true if the message was handled, false otherwise
 */
export const handlePendingEmailChange = async (
  ctx: GlobalContext,
  text: string
): Promise<boolean> => {
  const pending = ctx.session.pendingEmailChange
  const userId = ctx.from?.id
  const oldEmail = ctx.session.email

  if (!(pending && userId && oldEmail)) {
    return false
  }

  // Check expiry
  if (Date.now() > pending.expiresAt) {
    ctx.session.pendingEmailChange = undefined
    await ctx.reply(
      "Verification code expired. Please start the email change process again via /settings."
    )
    return true
  }

  // Check if user wants to cancel
  if (text.toLowerCase() === "/cancel" || text.toLowerCase() === "cancel") {
    ctx.session.pendingEmailChange = undefined
    await ctx.reply("Email change cancelled.")
    return true
  }

  // Check if input is a new email (user wants to try different email)
  if (isEmail(text)) {
    await initiateEmailChange(ctx, text)
    return true
  }

  // Check if input is OTP code
  if (!isOtpCode(text)) {
    await ctx.reply(
      "Please enter the 6-digit verification code, a new email address, or /cancel to abort."
    )
    return true
  }

  // Verify OTP
  const verification = await verifyEmailOtp(pending.newEmail, text)

  if (!verification.success) {
    await ctx.reply(
      `Invalid verification code: ${verification.error}\n\nPlease try again or type a new email address.`
    )
    return true
  }

  // Get the user_id from telegram_users first
  const { data: telegramUser } = await SUPABASE.from("telegram_users")
    .select("user_id")
    .eq("telegram_user_id", userId)
    .single()

  if (!telegramUser?.user_id) {
    logger.error(
      `Email change failed: No user found for telegram_user_id=${userId}`
    )
    await ctx.reply("Failed to update email. Please try again.")
    return true
  }

  // Update email in users table
  const { error: updateError } = await SUPABASE.from("users")
    .update({
      email: pending.newEmail,
      updated_at: new Date().toISOString(),
    })
    .eq("id", telegramUser.user_id)

  if (updateError) {
    logger.error(`Email change update failed: ${updateError.message}`)
    await ctx.reply("Failed to update email. Please try again.")
    return true
  }

  // Audit log
  auditLogger.emailChange(userId, oldEmail, pending.newEmail)

  // Clear google tokens to force re-auth with new email
  ctx.session.googleTokens = undefined
  ctx.session.email = pending.newEmail
  ctx.session.pendingEmailChange = undefined

  await ctx.reply(
    `Email successfully changed to ${pending.newEmail}!\n\nYou'll need to re-authorize Google Calendar access with your new email.`
  )

  return true
}

/**
 * Cancel pending email change
 */
export const cancelEmailChange = (ctx: GlobalContext): void => {
  ctx.session.pendingEmailChange = undefined
  ctx.session.awaitingEmailChange = undefined
}
