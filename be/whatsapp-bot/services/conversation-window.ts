/**
 * WhatsApp Conversation Window Service
 * Tracks the 24-hour messaging window for WhatsApp Cloud API
 *
 * WhatsApp allows free-form messages only within 24 hours of the user's last message.
 * After that, only pre-approved template messages can be sent.
 */

import { SUPABASE } from "@/infrastructure/supabase/supabase"
import { logger } from "@/lib/logger"
import { sendTemplateMessage, sendTextMessage } from "./send-message"

const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const MS_PER_SECOND = 1000
const MS_PER_MINUTE = SECONDS_PER_MINUTE * MS_PER_SECOND
const MS_PER_HOUR = MINUTES_PER_HOUR * MS_PER_MINUTE
const WINDOW_HOURS = 24
const WINDOW_DURATION_MS = WINDOW_HOURS * MS_PER_HOUR
const MAX_TEMPLATE_PARAM_LENGTH = 1024

export const isWithinMessagingWindow = async (
  phoneNumber: string
): Promise<boolean> => {
  const { data: waUser } = await SUPABASE.from("whatsapp_users")
    .select("last_activity_at")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (!waUser?.last_activity_at) {
    return false
  }

  const lastActivity = new Date(waUser.last_activity_at).getTime()
  const now = Date.now()

  return now - lastActivity < WINDOW_DURATION_MS
}

export const getWindowExpiryTime = async (
  phoneNumber: string
): Promise<Date | null> => {
  const { data: waUser } = await SUPABASE.from("whatsapp_users")
    .select("last_activity_at")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (!waUser?.last_activity_at) {
    return null
  }

  const lastActivity = new Date(waUser.last_activity_at).getTime()
  return new Date(lastActivity + WINDOW_DURATION_MS)
}

export const updateLastActivity = async (
  phoneNumber: string
): Promise<void> => {
  await SUPABASE.from("whatsapp_users")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("whatsapp_phone", phoneNumber)
}

type SmartMessageOptions = {
  templateName?: string
  templateParams?: string[]
  languageCode?: string
}

export const sendMessageSmart = async (
  phoneNumber: string,
  text: string,
  options: SmartMessageOptions = {}
): Promise<{ success: boolean; usedTemplate: boolean; error?: string }> => {
  const withinWindow = await isWithinMessagingWindow(phoneNumber)

  if (withinWindow) {
    const result = await sendTextMessage(phoneNumber, text)
    return {
      success: result.success,
      usedTemplate: false,
      error: result.error,
    }
  }

  const templateName = options.templateName || "reengagement_message"
  const templateParams = options.templateParams || [
    text.slice(0, MAX_TEMPLATE_PARAM_LENGTH),
  ]
  const languageCode = options.languageCode || "en"

  logger.info(
    `WhatsApp: Outside 24h window for ${phoneNumber}, using template: ${templateName}`
  )

  const result = await sendTemplateMessage(
    phoneNumber,
    templateName,
    templateParams,
    languageCode
  )

  if (!result.success) {
    logger.warn(
      `WhatsApp: Template message failed for ${phoneNumber}, window expired`
    )
  }

  return { success: result.success, usedTemplate: true, error: result.error }
}

export const canSendFreeformMessage = async (
  phoneNumber: string
): Promise<boolean> => isWithinMessagingWindow(phoneNumber)

export const getRemainingWindowTime = async (
  phoneNumber: string
): Promise<number | null> => {
  const { data: waUser } = await SUPABASE.from("whatsapp_users")
    .select("last_activity_at")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (!waUser?.last_activity_at) {
    return null
  }

  const lastActivity = new Date(waUser.last_activity_at).getTime()
  const expiryTime = lastActivity + WINDOW_DURATION_MS
  const remaining = expiryTime - Date.now()

  return remaining > 0 ? remaining : 0
}

export const formatRemainingTime = (ms: number): string => {
  if (ms <= 0) {
    return "expired"
  }

  const hours = Math.floor(ms / MS_PER_HOUR)
  const minutes = Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
