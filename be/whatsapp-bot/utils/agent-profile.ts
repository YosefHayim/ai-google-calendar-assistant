/**
 * WhatsApp Agent Profile Utility
 * Handles agent profile selection for WhatsApp users
 */

import { logger } from "@/utils/logger"
import { getUserIdFromWhatsApp } from "./conversation-history"
import { DEFAULT_AGENT_PROFILE_ID } from "@/shared/orchestrator/agent-profiles"
import {
  getPreference,
  updatePreference,
  type AgentProfilePreference,
} from "@/services/user-preferences-service"

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

    const pref = await getPreference<AgentProfilePreference>(userId, "agent_profile")

    if (!pref?.profileId) {
      return DEFAULT_AGENT_PROFILE_ID
    }

    return pref.profileId
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

    await updatePreference<AgentProfilePreference>(userId, "agent_profile", {
      profileId,
    })

    return true
  } catch (error) {
    logger.error(`WhatsApp: agent-profile: Failed to update: ${error}`)
    return false
  }
}
