/**
 * WhatsApp Ally Brain Utility
 * Handles user preferences for AI personality and voice settings
 */

import {
  getPreference,
  PREFERENCE_DEFAULTS,
  updatePreference,
} from "@/domains/settings/services/user-preferences-service"
import { SUPABASE } from "@/infrastructure/supabase/supabase"
import { logger } from "@/lib/logger"
import { getUserIdFromWhatsApp } from "./conversation-history"

export type {
  AllyBrainPreference,
  VoicePreference,
} from "@/domains/settings/services/user-preferences-service"

type AllyBrainPreference =
  import("@/domains/settings/services/user-preferences-service").AllyBrainPreference
type VoicePreference =
  import("@/domains/settings/services/user-preferences-service").VoicePreference

const DEFAULT_ALLY_BRAIN = PREFERENCE_DEFAULTS.ally_brain as AllyBrainPreference
const DEFAULT_VOICE_PREFERENCE =
  PREFERENCE_DEFAULTS.voice_preference as VoicePreference

/**
 * Gets Ally Brain preferences for a WhatsApp user
 */
export const getAllyBrainForWhatsApp = async (
  phoneNumber: string
): Promise<AllyBrainPreference | null> => {
  try {
    const userId = await getUserIdFromWhatsApp(phoneNumber)
    if (!userId) {
      return null
    }

    const result = await getPreference<AllyBrainPreference>(
      userId,
      "ally_brain"
    )
    return result ?? DEFAULT_ALLY_BRAIN
  } catch (error) {
    logger.error(`WhatsApp: ally-brain: Failed to get preference: ${error}`)
    return null
  }
}

/**
 * Updates Ally Brain preferences for a WhatsApp user
 */
export const updateAllyBrainForWhatsApp = async (
  phoneNumber: string,
  value: AllyBrainPreference
): Promise<boolean> => {
  try {
    const userId = await getUserIdFromWhatsApp(phoneNumber)
    if (!userId) {
      logger.warn(
        `WhatsApp: ally-brain: No user found for phone ${phoneNumber}`
      )
      return false
    }

    await updatePreference(userId, "ally_brain", value)
    return true
  } catch (error) {
    logger.error(`WhatsApp: ally-brain: Failed to update preference: ${error}`)
    return false
  }
}

/**
 * Gets voice preferences for a WhatsApp user
 */
export const getVoicePreferenceForWhatsApp = async (
  phoneNumber: string
): Promise<VoicePreference> => {
  try {
    const userId = await getUserIdFromWhatsApp(phoneNumber)
    if (!userId) {
      return DEFAULT_VOICE_PREFERENCE
    }

    const result = await getPreference<VoicePreference>(
      userId,
      "voice_preference"
    )
    return result ?? DEFAULT_VOICE_PREFERENCE
  } catch (error) {
    logger.error(`WhatsApp: voice-preference: Failed to get: ${error}`)
    return DEFAULT_VOICE_PREFERENCE
  }
}

/**
 * Updates voice preferences for a WhatsApp user
 */
export const updateVoicePreferenceForWhatsApp = async (
  phoneNumber: string,
  value: VoicePreference
): Promise<boolean> => {
  try {
    const userId = await getUserIdFromWhatsApp(phoneNumber)
    if (!userId) {
      return false
    }

    await updatePreference(userId, "voice_preference", value)
    return true
  } catch (error) {
    logger.error(`WhatsApp: voice-preference: Failed to update: ${error}`)
    return false
  }
}

const DEFAULT_LANGUAGE = "en"

export const getLanguagePreferenceForWhatsApp = async (
  phoneNumber: string
): Promise<string> => {
  try {
    const { data, error } = await SUPABASE.from("whatsapp_users")
      .select("language_code")
      .eq("whatsapp_phone", phoneNumber)
      .single()

    if (error || !data?.language_code) {
      return DEFAULT_LANGUAGE
    }

    return data.language_code
  } catch (error) {
    logger.error(`WhatsApp: language-preference: Failed to get: ${error}`)
    return DEFAULT_LANGUAGE
  }
}

export const updateLanguagePreferenceForWhatsApp = async (
  phoneNumber: string,
  languageCode: string
): Promise<boolean> => {
  try {
    const { error } = await SUPABASE.from("whatsapp_users")
      .update({ language_code: languageCode })
      .eq("whatsapp_phone", phoneNumber)

    if (error) {
      logger.error(
        `WhatsApp: language-preference: Failed to update: ${error.message}`
      )
      return false
    }

    return true
  } catch (error) {
    logger.error(`WhatsApp: language-preference: Failed to update: ${error}`)
    return false
  }
}
