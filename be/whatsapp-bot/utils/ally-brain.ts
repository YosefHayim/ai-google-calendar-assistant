/**
 * WhatsApp Ally Brain Utility
 * Handles user preferences for AI personality and voice settings
 */

import { SUPABASE } from "@/config"
import { logger } from "@/utils/logger"
import { getUserIdFromWhatsApp } from "./conversation-history"

export type AllyBrainPreference = {
  enabled: boolean
  instructions: string
}

const DEFAULT_ALLY_BRAIN: AllyBrainPreference = {
  enabled: false,
  instructions: "",
}

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

    const { data, error } = await SUPABASE.from("user_preferences")
      .select("preference_value")
      .eq("user_id", userId)
      .eq("preference_key", "ally_brain")
      .maybeSingle()

    if (error) {
      logger.error(`WhatsApp: ally-brain: Error fetching preference: ${error.message}`)
      return null
    }

    if (!data) {
      return DEFAULT_ALLY_BRAIN
    }

    return data.preference_value as unknown as AllyBrainPreference
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
      logger.warn(`WhatsApp: ally-brain: No user found for phone ${phoneNumber}`)
      return false
    }

    const { error } = await SUPABASE.from("user_preferences").upsert(
      {
        user_id: userId,
        preference_key: "ally_brain",
        preference_value: value,
        category: "assistant",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,preference_key",
      }
    )

    if (error) {
      logger.error(`WhatsApp: ally-brain: Error updating preference: ${error.message}`)
      return false
    }

    return true
  } catch (error) {
    logger.error(`WhatsApp: ally-brain: Failed to update preference: ${error}`)
    return false
  }
}

export type VoicePreference = {
  enabled: boolean
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"
}

const DEFAULT_VOICE_PREFERENCE: VoicePreference = {
  enabled: true,
  voice: "alloy",
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

    const { data, error } = await SUPABASE.from("user_preferences")
      .select("preference_value")
      .eq("user_id", userId)
      .eq("preference_key", "voice_preference")
      .maybeSingle()

    if (error) {
      logger.error(`WhatsApp: voice-preference: Error fetching: ${error.message}`)
      return DEFAULT_VOICE_PREFERENCE
    }

    if (!data) {
      return DEFAULT_VOICE_PREFERENCE
    }

    return data.preference_value as unknown as VoicePreference
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

    const { error } = await SUPABASE.from("user_preferences").upsert(
      {
        user_id: userId,
        preference_key: "voice_preference",
        preference_value: value,
        category: "assistant",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,preference_key",
      }
    )

    if (error) {
      logger.error(`WhatsApp: voice-preference: Error updating: ${error.message}`)
      return false
    }

    return true
  } catch (error) {
    logger.error(`WhatsApp: voice-preference: Failed to update: ${error}`)
    return false
  }
}
