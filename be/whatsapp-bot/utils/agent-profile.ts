/**
 * WhatsApp Agent Profile Utility
 * Handles agent profile selection for WhatsApp users
 */

import { SUPABASE } from "@/config"
import { logger } from "@/utils/logger"
import { getUserIdFromWhatsApp } from "./conversation-history"
import { DEFAULT_AGENT_PROFILE_ID } from "@/shared/orchestrator/agent-profiles"

/**
 * Gets the selected agent profile for a WhatsApp user
 */
export const getSelectedAgentProfileForWhatsApp = async (
  phoneNumber: string
): Promise<string> => {
  try {
    const userId = await getUserIdFromWhatsApp(phoneNumber)
    if (!userId) {
      return DEFAULT_AGENT_PROFILE_ID
    }

    const { data, error } = await SUPABASE.from("user_preferences")
      .select("preference_value")
      .eq("user_id", userId)
      .eq("preference_key", "selected_agent_profile")
      .maybeSingle()

    if (error) {
      logger.error(`WhatsApp: agent-profile: Error fetching: ${error.message}`)
      return DEFAULT_AGENT_PROFILE_ID
    }

    if (!data?.preference_value) {
      return DEFAULT_AGENT_PROFILE_ID
    }

    const profileId =
      typeof data.preference_value === "string"
        ? data.preference_value
        : (data.preference_value as { id?: string })?.id

    return profileId || DEFAULT_AGENT_PROFILE_ID
  } catch (error) {
    logger.error(`WhatsApp: agent-profile: Failed to get: ${error}`)
    return DEFAULT_AGENT_PROFILE_ID
  }
}

/**
 * Updates the selected agent profile for a WhatsApp user
 */
export const updateSelectedAgentProfileForWhatsApp = async (
  phoneNumber: string,
  profileId: string
): Promise<boolean> => {
  try {
    const userId = await getUserIdFromWhatsApp(phoneNumber)
    if (!userId) {
      return false
    }

    const { error } = await SUPABASE.from("user_preferences").upsert(
      {
        user_id: userId,
        preference_key: "selected_agent_profile",
        preference_value: { id: profileId },
        category: "assistant",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,preference_key",
      }
    )

    if (error) {
      logger.error(`WhatsApp: agent-profile: Error updating: ${error.message}`)
      return false
    }

    return true
  } catch (error) {
    logger.error(`WhatsApp: agent-profile: Failed to update: ${error}`)
    return false
  }
}
