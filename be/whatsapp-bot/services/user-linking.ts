/**
 * WhatsApp User Linking Service
 * Handles onboarding and account linking for WhatsApp users
 */

import { env } from "@/config/env"

import type { Database } from "@/database.types"
import { SUPABASE } from "@/infrastructure/supabase/supabase"
import { logger } from "@/lib/logger"
import type { WhatsAppInteractiveContent } from "../types"
import { detectLanguageFromPhone } from "../utils/language-detection"
import { sendButtonMessage, sendTextMessage } from "./send-message"

type WhatsAppUser = Database["public"]["Tables"]["whatsapp_users"]["Row"]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_CLEANUP_REGEX = /[\s-]/g
const OTP_FORMAT_REGEX = /^\d{6}$/

const otpVerificationInProgress = new Set<string>()

type OnboardingStep =
  | "welcome"
  | "awaiting_choice"
  | "email_input"
  | "otp_verification"
  | "google_auth"
  | "complete"

export type UserResolution = {
  user: WhatsAppUser
  isLinked: boolean
  needsOnboarding: boolean
  email?: string
  onboardingStep: OnboardingStep
}

/**
 * Gets or creates a WhatsApp user and determines next action
 */
export const resolveWhatsAppUser = async (
  phoneNumber: string,
  displayName?: string
): Promise<UserResolution> => {
  // Try to find existing user with linked account info
  const { data: existingUser } = await SUPABASE.from("whatsapp_users")
    .select("*")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (existingUser) {
    // Update activity
    await SUPABASE.from("whatsapp_users")
      .update({
        last_activity_at: new Date().toISOString(),
        whatsapp_name: displayName || existingUser.whatsapp_name,
        message_count: (existingUser.message_count || 0) + 1,
      })
      .eq("id", existingUser.id)

    // Get linked user's email if available
    let email: string | undefined
    if (existingUser.user_id) {
      const { data: userData } = await SUPABASE.from("users")
        .select("email")
        .eq("id", existingUser.user_id)
        .single()
      email = userData?.email || undefined
    }

    const onboardingStep =
      (existingUser.onboarding_step as OnboardingStep) || "welcome"

    // PRIORITY: If user is fully linked with user_id, skip ALL onboarding
    // This prevents auth loops after successful OTP verification
    const isFullyLinked = existingUser.is_linked && existingUser.user_id

    return {
      user: existingUser,
      isLinked: existingUser.is_linked ?? false,
      needsOnboarding: !isFullyLinked && onboardingStep !== "complete",
      email,
      onboardingStep: isFullyLinked ? "complete" : onboardingStep,
    }
  }

  const detectedLanguage = detectLanguageFromPhone(phoneNumber)
  logger.info(
    `WhatsApp: Creating new user ${phoneNumber} with detected language: ${detectedLanguage}`
  )

  const { data: newUser, error: insertError } = await SUPABASE.from(
    "whatsapp_users"
  )
    .insert({
      whatsapp_phone: phoneNumber,
      whatsapp_name: displayName || null,
      is_linked: false,
      onboarding_step: "welcome",
      first_message_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      language_code: detectedLanguage,
      message_count: 1,
    })
    .select()
    .single()

  if (insertError || !newUser) {
    logger.error(
      `WhatsApp: Failed to create user for ${phoneNumber}: ${insertError?.message}`
    )
    throw new Error(`Failed to create WhatsApp user: ${insertError?.message}`)
  }

  return {
    user: newUser,
    isLinked: false,
    needsOnboarding: true,
    onboardingStep: "welcome",
  }
}

/**
 * Updates the onboarding step for a WhatsApp user
 */
const updateOnboardingStep = async (
  phoneNumber: string,
  step: OnboardingStep
): Promise<void> => {
  await SUPABASE.from("whatsapp_users")
    .update({ onboarding_step: step })
    .eq("whatsapp_phone", phoneNumber)
}

/**
 * Handles onboarding flow based on current step
 */
export const handleOnboarding = async (
  phoneNumber: string,
  messageText: string,
  currentStep: OnboardingStep,
  interactiveReply?: WhatsAppInteractiveContent
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  const text = messageText.toLowerCase().trim()

  // Handle reset command at any step
  if (text === "reset" || text === "/reset") {
    await updateOnboardingStep(phoneNumber, "welcome")
    await sendWelcomeMessage(phoneNumber)
    return { handled: true, nextStep: "awaiting_choice" }
  }

  // Handle resend OTP command
  if (text === "resend" && currentStep === "otp_verification") {
    return await resendOtp(phoneNumber)
  }

  switch (currentStep) {
    case "welcome":
      await sendWelcomeMessage(phoneNumber)
      return { handled: true, nextStep: "awaiting_choice" }

    case "awaiting_choice":
      return await handleChoiceSelection(phoneNumber, text, interactiveReply)

    case "email_input":
      return await handleEmailInput(phoneNumber, messageText)

    case "otp_verification":
      return await handleOtpVerification(phoneNumber, messageText)

    case "google_auth":
      return await checkGoogleAuthStatus(phoneNumber)

    case "complete":
      return { handled: false } // Proceed to AI agent

    default:
      // Unknown step, restart onboarding
      await sendWelcomeMessage(phoneNumber)
      return { handled: true, nextStep: "awaiting_choice" }
  }
}

/**
 * Sends the welcome message with options
 */
const sendWelcomeMessage = async (phoneNumber: string): Promise<void> => {
  await sendButtonMessage(
    phoneNumber,
    "I'm Ally, your AI calendar assistant. I can help you manage your schedule, create events, and more.\n\nTo get started, I need to link your account. Do you already have an Ally account?",
    [
      { id: "link_existing", title: "Yes, link account" },
      { id: "create_new", title: "No, create new" },
    ],
    { headerText: "Welcome to Ally!" }
  )

  await updateOnboardingStep(phoneNumber, "awaiting_choice")
}

/**
 * Handles the user's choice (existing or new account)
 */
const handleChoiceSelection = async (
  phoneNumber: string,
  text: string,
  interactiveReply?: WhatsAppInteractiveContent
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  // Check for interactive button reply
  const buttonId = interactiveReply?.button_reply?.id

  // Also accept text-based responses
  const wantsToLink =
    buttonId === "link_existing" ||
    text.includes("yes") ||
    text.includes("link") ||
    text.includes("existing")

  const wantsToCreate =
    buttonId === "create_new" ||
    text.includes("no") ||
    text.includes("new") ||
    text.includes("create")

  if (wantsToLink || wantsToCreate) {
    await sendTextMessage(
      phoneNumber,
      "Please enter your email address to continue:\n\n(I'll send you a verification code)"
    )
    await updateOnboardingStep(phoneNumber, "email_input")
    return { handled: true, nextStep: "email_input" }
  }

  // Didn't understand the choice
  await sendButtonMessage(
    phoneNumber,
    "I didn't quite catch that. Do you have an existing Ally account you'd like to link?",
    [
      { id: "link_existing", title: "Yes, link account" },
      { id: "create_new", title: "No, create new" },
    ]
  )

  return { handled: true }
}

/**
 * Handles email input during onboarding
 */
const handleEmailInput = async (
  phoneNumber: string,
  email: string
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  // Validate email format
  const trimmedEmail = email.trim().toLowerCase()

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    await sendTextMessage(
      phoneNumber,
      "That doesn't look like a valid email address. Please enter a valid email:"
    )
    return { handled: true }
  }

  // Store pending email
  await SUPABASE.from("whatsapp_users")
    .update({
      pending_email: trimmedEmail,
      onboarding_step: "otp_verification",
    })
    .eq("whatsapp_phone", phoneNumber)

  // Send OTP via Supabase Auth
  const { error } = await SUPABASE.auth.signInWithOtp({
    email: trimmedEmail,
    options: {
      shouldCreateUser: true,
    },
  })

  if (error) {
    logger.error(
      `WhatsApp: Failed to send OTP to ${trimmedEmail}: ${error.message}`
    )
    await sendTextMessage(
      phoneNumber,
      "Sorry, I couldn't send the verification code. Please try again or use a different email."
    )
    return { handled: true }
  }

  await sendTextMessage(
    phoneNumber,
    `I've sent a 6-digit verification code to *${trimmedEmail}*.\n\nPlease enter the code here.\n\n_Didn't receive it? Type 'resend' to get a new code._`
  )

  return { handled: true, nextStep: "otp_verification" }
}

/**
 * Resends OTP to the pending email
 */
const resendOtp = async (
  phoneNumber: string
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  const { data: waUser } = await SUPABASE.from("whatsapp_users")
    .select("pending_email")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (!waUser?.pending_email) {
    await sendTextMessage(
      phoneNumber,
      "I don't have an email on file. Let's start over. What's your email?"
    )
    await updateOnboardingStep(phoneNumber, "email_input")
    return { handled: true, nextStep: "email_input" }
  }

  const { error } = await SUPABASE.auth.signInWithOtp({
    email: waUser.pending_email,
    options: {
      shouldCreateUser: true,
    },
  })

  if (error) {
    logger.error(
      `WhatsApp: Failed to resend OTP to ${waUser.pending_email}: ${error.message}`
    )
    await sendTextMessage(
      phoneNumber,
      "Sorry, I couldn't resend the code. Please try again in a moment."
    )
    return { handled: true }
  }

  await sendTextMessage(
    phoneNumber,
    `I've sent a new verification code to *${waUser.pending_email}*.`
  )

  return { handled: true }
}

const handleOtpVerification = async (
  phoneNumber: string,
  otp: string
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  if (otpVerificationInProgress.has(phoneNumber)) {
    logger.debug(
      `WhatsApp: OTP verification already in progress for ${phoneNumber}`
    )
    return { handled: true }
  }

  otpVerificationInProgress.add(phoneNumber)

  try {
    return await executeOtpVerification(phoneNumber, otp)
  } finally {
    otpVerificationInProgress.delete(phoneNumber)
  }
}

const executeOtpVerification = async (
  phoneNumber: string,
  otp: string
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  const { data: waUser } = await SUPABASE.from("whatsapp_users")
    .select("pending_email, is_linked, user_id")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (waUser?.is_linked && waUser?.user_id) {
    logger.info(`WhatsApp: User ${phoneNumber} already linked, skipping OTP`)
    return { handled: false, nextStep: "complete" }
  }

  if (!waUser?.pending_email) {
    await sendTextMessage(
      phoneNumber,
      "Something went wrong. Let's start over. What's your email?"
    )
    await updateOnboardingStep(phoneNumber, "email_input")
    return { handled: true, nextStep: "email_input" }
  }

  const cleanOtp = otp.replace(OTP_CLEANUP_REGEX, "").trim()

  if (!OTP_FORMAT_REGEX.test(cleanOtp)) {
    await sendTextMessage(
      phoneNumber,
      "Please enter the 6-digit code from your email.\n\n_Type 'resend' if you need a new code._"
    )
    return { handled: true }
  }

  // Verify OTP
  const { data: authData, error } = await SUPABASE.auth.verifyOtp({
    email: waUser.pending_email,
    token: cleanOtp,
    type: "email",
  })

  if (error || !authData.user) {
    logger.warn(
      `WhatsApp: OTP verification failed for ${phoneNumber}: ${error?.message}`
    )
    await sendTextMessage(
      phoneNumber,
      "That code didn't work. Please check and try again, or type 'resend' for a new code."
    )
    return { handled: true }
  }

  const { data: oauthToken } = await SUPABASE.from("oauth_tokens")
    .select("id")
    .eq("user_id", authData.user.id)
    .eq("provider", "google")
    .eq("is_valid", true)
    .maybeSingle()

  const hasGoogleCalendar = !!oauthToken
  const finalStep = hasGoogleCalendar ? "complete" : "google_auth"

  const { data: updatedUser, error: updateError } = await SUPABASE.from(
    "whatsapp_users"
  )
    .update({
      user_id: authData.user.id,
      is_linked: true,
      pending_email: null,
      onboarding_step: finalStep,
    })
    .eq("whatsapp_phone", phoneNumber)
    .select("id, is_linked, user_id, onboarding_step")
    .single()

  if (updateError || !updatedUser) {
    logger.error(
      `WhatsApp: Failed to link account for ${phoneNumber}: ${updateError?.message || "No rows updated"}`
    )
    await sendTextMessage(
      phoneNumber,
      "Sorry, something went wrong linking your account. Please try again."
    )
    return { handled: true }
  }

  const isFullyLinked = updatedUser.is_linked && updatedUser.user_id
  if (!isFullyLinked) {
    logger.error(
      `WhatsApp: Update succeeded but state invalid for ${phoneNumber}: is_linked=${updatedUser.is_linked}, user_id=${updatedUser.user_id}`
    )
    await sendTextMessage(
      phoneNumber,
      "Sorry, something went wrong linking your account. Please try again."
    )
    return { handled: true }
  }

  logger.info(
    `WhatsApp: Successfully linked ${phoneNumber} to user ${authData.user.id}, step: ${finalStep}, verified: is_linked=${updatedUser.is_linked}`
  )

  if (oauthToken) {
    await sendTextMessage(
      phoneNumber,
      "*Account linked successfully!* Your Google Calendar is already connected.\n\nTry asking me:\n- _What's on my calendar today?_\n- _Schedule a meeting tomorrow at 2pm_\n- _Show me my week_"
    )
    return { handled: true, nextStep: "complete" }
  }

  // Need to connect Google Calendar
  const authUrl = `${env.server.baseUrl}/api/users/signup/google?redirect=whatsapp&phone=${encodeURIComponent(phoneNumber)}`

  await sendTextMessage(
    phoneNumber,
    `*Email verified!*\n\nNow let's connect your Google Calendar. Tap the link below to authorize:\n\n${authUrl}\n\n_Once you've connected, send me any message to continue._`
  )

  return { handled: true, nextStep: "google_auth" }
}

/**
 * Checks if the user has completed Google OAuth
 */
const checkGoogleAuthStatus = async (
  phoneNumber: string
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  const { data: waUser } = await SUPABASE.from("whatsapp_users")
    .select("user_id")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (!waUser?.user_id) {
    // User somehow lost their user_id, restart onboarding
    await sendWelcomeMessage(phoneNumber)
    return { handled: true, nextStep: "awaiting_choice" }
  }

  const { data: oauthToken } = await SUPABASE.from("oauth_tokens")
    .select("id")
    .eq("user_id", waUser.user_id)
    .eq("provider", "google")
    .eq("is_valid", true)
    .maybeSingle()

  if (oauthToken) {
    await SUPABASE.from("whatsapp_users")
      .update({ onboarding_step: "complete" })
      .eq("whatsapp_phone", phoneNumber)

    await sendTextMessage(
      phoneNumber,
      "*You're all set!* Your Google Calendar is now connected.\n\nTry asking me:\n- _What's on my calendar today?_\n- _Schedule a meeting tomorrow at 2pm_\n- _Show me my week_"
    )
    return { handled: true, nextStep: "complete" }
  }

  // Still waiting for Google auth
  const authUrl = `${env.server.baseUrl}/api/users/signup/google?redirect=whatsapp&phone=${encodeURIComponent(phoneNumber)}`

  await sendTextMessage(
    phoneNumber,
    `I'm still waiting for you to connect your Google Calendar.\n\nTap here to connect:\n${authUrl}`
  )

  return { handled: true }
}

/**
 * Checks if a WhatsApp user has completed onboarding
 */
export const isOnboardingComplete = async (
  phoneNumber: string
): Promise<boolean> => {
  const { data } = await SUPABASE.from("whatsapp_users")
    .select("is_linked, onboarding_step")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  return data?.is_linked === true && data?.onboarding_step === "complete"
}

/**
 * Gets the email for a linked WhatsApp user
 */
export const getEmailForWhatsAppUser = async (
  phoneNumber: string
): Promise<string | null> => {
  const { data: waUser } = await SUPABASE.from("whatsapp_users")
    .select("user_id")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (!waUser?.user_id) {
    return null
  }

  const { data: userData } = await SUPABASE.from("users")
    .select("email")
    .eq("id", waUser.user_id)
    .single()

  return userData?.email || null
}
