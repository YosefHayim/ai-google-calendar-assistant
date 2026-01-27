/**
 * WhatsApp User Linking Service
 * Handles onboarding and account linking for WhatsApp users
 */

import { env } from "@/config/env"

import type { Database } from "@/database.types"
import { isRedisConnected, redisClient } from "@/infrastructure/redis/redis"
import { SUPABASE } from "@/infrastructure/supabase/supabase"
import { logger } from "@/lib/logger"
import { markUnauthUserConverted } from "@/shared/context"
import type { SupportedLocale } from "../i18n/config"
import { getTranslatorFromLanguageCode } from "../i18n/translator"
import type { WhatsAppInteractiveContent } from "../types"
import { getLanguagePreferenceForWhatsApp } from "../utils/ally-brain"
import {
  detectLanguageFromPhone,
  detectLanguageFromText,
} from "../utils/language-detection"
import { sendButtonMessage, sendTextMessage } from "./send-message"

type WhatsAppUser = Database["public"]["Tables"]["whatsapp_users"]["Row"]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_CLEANUP_REGEX = /[\s-]/g
const OTP_FORMAT_REGEX = /^\d{6}$/

const ONBOARDING_LOCK_PREFIX = "wa:onboarding:lock:"
const ONBOARDING_LOCK_TTL_SECONDS = 30

const acquireOnboardingLock = async (phoneNumber: string): Promise<boolean> => {
  if (!isRedisConnected()) {
    logger.warn("WhatsApp: Redis not connected, skipping onboarding lock")
    return true
  }

  try {
    const key = `${ONBOARDING_LOCK_PREFIX}${phoneNumber}`
    const result = await redisClient.set(
      key,
      "1",
      "EX",
      ONBOARDING_LOCK_TTL_SECONDS,
      "NX"
    )
    return result === "OK"
  } catch (error) {
    logger.error(`WhatsApp: Failed to acquire onboarding lock: ${error}`)
    return true
  }
}

const releaseOnboardingLock = async (phoneNumber: string): Promise<void> => {
  if (!isRedisConnected()) {
    return
  }

  try {
    const key = `${ONBOARDING_LOCK_PREFIX}${phoneNumber}`
    await redisClient.del(key)
  } catch (error) {
    logger.error(`WhatsApp: Failed to release onboarding lock: ${error}`)
  }
}

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

export const resolveWhatsAppUser = async (
  phoneNumber: string,
  displayName?: string,
  messageText?: string
): Promise<UserResolution> => {
  logger.debug(
    `WhatsApp: resolveWhatsAppUser called with phone="${phoneNumber}", name="${displayName || "none"}"`
  )

  const { data: existingUser, error: fetchError } = await SUPABASE.from(
    "whatsapp_users"
  )
    .select("*")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    logger.warn(
      `WhatsApp: Error fetching user for ${phoneNumber}: ${fetchError.message} (code: ${fetchError.code})`
    )
  }

  if (existingUser) {
    logger.debug(
      `WhatsApp: Found existing user for ${phoneNumber}: is_linked=${existingUser.is_linked}, ` +
        `user_id=${existingUser.user_id || "null"}, step=${existingUser.onboarding_step}`
    )

    await SUPABASE.from("whatsapp_users")
      .update({
        last_activity_at: new Date().toISOString(),
        whatsapp_name: displayName || existingUser.whatsapp_name,
        message_count: (existingUser.message_count || 0) + 1,
      })
      .eq("id", existingUser.id)

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

    const isFullyLinked = existingUser.is_linked && existingUser.user_id

    return {
      user: existingUser,
      isLinked: existingUser.is_linked ?? false,
      needsOnboarding: !isFullyLinked && onboardingStep !== "complete",
      email,
      onboardingStep: isFullyLinked ? "complete" : onboardingStep,
    }
  }

  const textLanguage = messageText ? detectLanguageFromText(messageText) : null
  const phoneLanguage = detectLanguageFromPhone(phoneNumber)
  const detectedLanguage = textLanguage ?? phoneLanguage
  logger.info(
    `WhatsApp: Creating new user ${phoneNumber} with detected language: ${detectedLanguage} (text: ${textLanguage}, phone: ${phoneLanguage})`
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

export const handleOnboarding = async (
  phoneNumber: string,
  messageText: string,
  currentStep: OnboardingStep,
  interactiveReply?: WhatsAppInteractiveContent
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  const text = messageText.toLowerCase().trim()

  const textLang = detectLanguageFromText(messageText)
  const storedLang = await getLanguagePreferenceForWhatsApp(phoneNumber)
  const languageCode = textLang ?? storedLang

  if (text === "reset" || text === "/reset") {
    await updateOnboardingStep(phoneNumber, "welcome")
    await sendWelcomeMessage(phoneNumber, languageCode)
    return { handled: true, nextStep: "awaiting_choice" }
  }

  if (text === "resend" && currentStep === "otp_verification") {
    return await resendOtp(phoneNumber, languageCode)
  }

  switch (currentStep) {
    case "welcome":
      await sendWelcomeMessage(phoneNumber, languageCode)
      return { handled: true, nextStep: "awaiting_choice" }

    case "awaiting_choice":
      return await handleChoiceSelection(
        phoneNumber,
        text,
        interactiveReply,
        languageCode
      )

    case "email_input":
      return await handleEmailInput(phoneNumber, messageText, languageCode)

    case "otp_verification":
      return await handleOtpVerification(phoneNumber, messageText, languageCode)

    case "google_auth":
      return await checkGoogleAuthStatus(phoneNumber, languageCode)

    case "complete":
      return { handled: false }

    default:
      await sendWelcomeMessage(phoneNumber, languageCode)
      return { handled: true, nextStep: "awaiting_choice" }
  }
}

const sendWelcomeMessage = async (
  phoneNumber: string,
  languageCode?: SupportedLocale
): Promise<void> => {
  const { t } = getTranslatorFromLanguageCode(languageCode)

  await sendButtonMessage(
    phoneNumber,
    t("whatsapp.onboarding.welcomeText"),
    [
      { id: "link_existing", title: t("whatsapp.onboarding.buttonYesLink") },
      { id: "create_new", title: t("whatsapp.onboarding.buttonNoCreate") },
    ],
    { headerText: t("whatsapp.onboarding.welcomeHeader") }
  )

  await updateOnboardingStep(phoneNumber, "awaiting_choice")
}

const handleChoiceSelection = async (
  phoneNumber: string,
  text: string,
  interactiveReply?: WhatsAppInteractiveContent,
  languageCode?: SupportedLocale
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  const { t } = getTranslatorFromLanguageCode(languageCode)
  const buttonId = interactiveReply?.button_reply?.id

  const wantsToLink =
    buttonId === "link_existing" ||
    text.includes("yes") ||
    text.includes("link") ||
    text.includes("existing") ||
    text.includes("כן") ||
    text.includes("نعم")

  const wantsToCreate =
    buttonId === "create_new" ||
    text.includes("no") ||
    text.includes("new") ||
    text.includes("create") ||
    text.includes("לא") ||
    text.includes("חדש") ||
    text.includes("لا")

  if (wantsToLink || wantsToCreate) {
    await sendTextMessage(phoneNumber, t("whatsapp.onboarding.enterEmail"))
    await updateOnboardingStep(phoneNumber, "email_input")
    return { handled: true, nextStep: "email_input" }
  }

  await sendButtonMessage(
    phoneNumber,
    t("whatsapp.onboarding.choiceUnclear"),
    [
      { id: "link_existing", title: t("whatsapp.onboarding.buttonYesLink") },
      { id: "create_new", title: t("whatsapp.onboarding.buttonNoCreate") },
    ]
  )

  return { handled: true }
}

const handleEmailInput = async (
  phoneNumber: string,
  email: string,
  languageCode?: SupportedLocale
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  const { t } = getTranslatorFromLanguageCode(languageCode)
  const trimmedEmail = email.trim().toLowerCase()

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    await sendTextMessage(phoneNumber, t("whatsapp.onboarding.invalidEmail"))
    return { handled: true }
  }

  await SUPABASE.from("whatsapp_users")
    .update({
      pending_email: trimmedEmail,
      onboarding_step: "otp_verification",
    })
    .eq("whatsapp_phone", phoneNumber)

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
    await sendTextMessage(phoneNumber, t("whatsapp.onboarding.otpSendFailed"))
    return { handled: true }
  }

  await sendTextMessage(
    phoneNumber,
    t("whatsapp.onboarding.otpSent", { email: trimmedEmail })
  )

  return { handled: true, nextStep: "otp_verification" }
}

const resendOtp = async (
  phoneNumber: string,
  languageCode?: SupportedLocale
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const lockAcquired = await acquireOnboardingLock(phoneNumber)
  if (!lockAcquired) {
    await sendTextMessage(phoneNumber, t("errors.processingPreviousRequest"))
    return { handled: true }
  }

  try {
    const { data: waUser } = await SUPABASE.from("whatsapp_users")
      .select("pending_email, is_linked, user_id")
      .eq("whatsapp_phone", phoneNumber)
      .single()

    if (waUser?.is_linked && waUser?.user_id) {
      await sendTextMessage(phoneNumber, t("whatsapp.onboarding.allSet"))
      return { handled: true, nextStep: "complete" }
    }

    if (!waUser?.pending_email) {
      await sendTextMessage(phoneNumber, t("whatsapp.onboarding.enterEmail"))
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
      await sendTextMessage(phoneNumber, t("whatsapp.onboarding.otpSendFailed"))
      return { handled: true }
    }

    await sendTextMessage(
      phoneNumber,
      t("whatsapp.onboarding.otpResent", { email: waUser.pending_email })
    )

    return { handled: true }
  } finally {
    await releaseOnboardingLock(phoneNumber)
  }
}

const handleOtpVerification = async (
  phoneNumber: string,
  otp: string,
  languageCode?: SupportedLocale
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const lockAcquired = await acquireOnboardingLock(phoneNumber)
  if (!lockAcquired) {
    logger.debug(
      `WhatsApp: OTP verification already in progress for ${phoneNumber}`
    )
    await sendTextMessage(phoneNumber, t("errors.processingPreviousRequest"))
    return { handled: true }
  }

  try {
    return await executeOtpVerification(phoneNumber, otp, languageCode)
  } finally {
    await releaseOnboardingLock(phoneNumber)
  }
}

const executeOtpVerification = async (
  phoneNumber: string,
  otp: string,
  languageCode?: SupportedLocale
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const { data: waUser } = await SUPABASE.from("whatsapp_users")
    .select("pending_email, is_linked, user_id")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (waUser?.is_linked && waUser?.user_id) {
    logger.info(`WhatsApp: User ${phoneNumber} already linked, skipping OTP`)
    return { handled: false, nextStep: "complete" }
  }

  if (!waUser?.pending_email) {
    await sendTextMessage(phoneNumber, t("whatsapp.onboarding.enterEmail"))
    await updateOnboardingStep(phoneNumber, "email_input")
    return { handled: true, nextStep: "email_input" }
  }

  const cleanOtp = otp.replace(OTP_CLEANUP_REGEX, "").trim()

  if (!OTP_FORMAT_REGEX.test(cleanOtp)) {
    await sendTextMessage(phoneNumber, t("whatsapp.onboarding.otpInvalid"))
    return { handled: true }
  }

  const { data: authData, error } = await SUPABASE.auth.verifyOtp({
    email: waUser.pending_email,
    token: cleanOtp,
    type: "email",
  })

  if (error || !authData.user) {
    logger.warn(
      `WhatsApp: OTP verification failed for ${phoneNumber}: ${error?.message}`
    )
    await sendTextMessage(phoneNumber, t("whatsapp.onboarding.otpInvalid"))
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

  logger.info(
    `WhatsApp: Attempting to link ${phoneNumber} to user ${authData.user.id}, target step: ${finalStep}`
  )

  const { data: updatedUsers, error: updateError } = await SUPABASE.from(
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

  if (updateError) {
    logger.error(
      `WhatsApp: Failed to link account for ${phoneNumber}: ${updateError.message}`
    )
    await sendTextMessage(phoneNumber, t("whatsapp.onboarding.linkFailed"))
    return { handled: true }
  }

  const updatedUser = updatedUsers?.[0]
  if (!updatedUser) {
    logger.error(
      `WhatsApp: No whatsapp_users row found for ${phoneNumber} during linking. ` +
        `Rows returned: ${updatedUsers?.length ?? 0}`
    )
    await sendTextMessage(phoneNumber, t("whatsapp.onboarding.linkFailed"))
    return { handled: true }
  }

  if (updatedUsers && updatedUsers.length > 1) {
    logger.warn(
      `WhatsApp: Multiple rows (${updatedUsers.length}) found for ${phoneNumber} - using first`
    )
  }

  const isFullyLinked = updatedUser.is_linked && updatedUser.user_id
  if (!isFullyLinked) {
    logger.error(
      `WhatsApp: Update succeeded but state invalid for ${phoneNumber}: is_linked=${updatedUser.is_linked}, user_id=${updatedUser.user_id}`
    )
    await sendTextMessage(phoneNumber, t("whatsapp.onboarding.linkFailed"))
    return { handled: true }
  }

  const { data: verifyRow, error: verifyError } = await SUPABASE.from(
    "whatsapp_users"
  )
    .select("is_linked, user_id, onboarding_step")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (verifyError || !verifyRow?.is_linked || !verifyRow?.user_id) {
    logger.error(
      `WhatsApp: CRITICAL - Update appeared to succeed but re-verification failed for ${phoneNumber}. ` +
        `Expected: is_linked=true, user_id=${authData.user.id}. ` +
        `Got: is_linked=${verifyRow?.is_linked}, user_id=${verifyRow?.user_id}. ` +
        `Error: ${verifyError?.message || "none"}`
    )
    await sendTextMessage(phoneNumber, t("whatsapp.onboarding.linkFailed"))
    return { handled: true }
  }

  logger.info(
    `WhatsApp: Successfully linked ${phoneNumber} to user ${authData.user.id}, ` +
      `step: ${finalStep}, verified: is_linked=${verifyRow.is_linked}, ` +
      `onboarding_step=${verifyRow.onboarding_step}`
  )

  await markUnauthUserConverted("whatsapp", phoneNumber)

  if (oauthToken) {
    await sendTextMessage(
      phoneNumber,
      t("whatsapp.onboarding.successWithCalendar")
    )
    return { handled: true, nextStep: "complete" }
  }

  const authUrl = `${env.server.baseUrl}/api/users/signup/google?redirect=whatsapp&phone=${encodeURIComponent(phoneNumber)}`

  await sendTextMessage(
    phoneNumber,
    t("whatsapp.onboarding.emailVerified", { authUrl })
  )

  return { handled: true, nextStep: "google_auth" }
}

const checkGoogleAuthStatus = async (
  phoneNumber: string,
  languageCode?: SupportedLocale
): Promise<{ handled: boolean; nextStep?: OnboardingStep }> => {
  const { t } = getTranslatorFromLanguageCode(languageCode)

  const { data: waUser } = await SUPABASE.from("whatsapp_users")
    .select("user_id")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (!waUser?.user_id) {
    await sendWelcomeMessage(phoneNumber, languageCode)
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

    await sendTextMessage(phoneNumber, t("whatsapp.onboarding.allSet"))
    return { handled: true, nextStep: "complete" }
  }

  const authUrl = `${env.server.baseUrl}/api/users/signup/google?redirect=whatsapp&phone=${encodeURIComponent(phoneNumber)}`

  await sendTextMessage(
    phoneNumber,
    t("whatsapp.onboarding.waitingForGoogle", { authUrl })
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
