import { logger } from "@/utils/logger"
import { telegramConversation } from "@/utils/conversation/TelegramConversationAdapter"
import {
  AGENT_PROFILES,
  DEFAULT_AGENT_PROFILE_ID,
  getAgentProfile,
  type AgentProfile,
} from "@/shared/orchestrator/agent-profiles"
import {
  getPreference,
  updatePreference,
  type AgentProfilePreference,
} from "@/services/user-preferences-service"

const getUserIdFromTelegram = (telegramUserId: number) =>
  telegramConversation.getUserIdFromTelegram(telegramUserId)

export const getSelectedAgentProfileForTelegram = async (
  telegramUserId: number
): Promise<string> => {
  try {
    const userId = await getUserIdFromTelegram(telegramUserId)
    if (!userId) {
      return DEFAULT_AGENT_PROFILE_ID
    }

    const pref = await getPreference<AgentProfilePreference>(userId, "agent_profile")

    if (!pref?.profileId) {
      return DEFAULT_AGENT_PROFILE_ID
    }

    if (!AGENT_PROFILES[pref.profileId]) {
      logger.warn(
        `agent-profile: Profile ${pref.profileId} no longer exists, using default`
      )
      return DEFAULT_AGENT_PROFILE_ID
    }

    return pref.profileId
  } catch (error) {
    logger.error(`agent-profile: Failed to get preference: ${error}`)
    return DEFAULT_AGENT_PROFILE_ID
  }
}

export const getAgentProfileForTelegram = async (
  telegramUserId: number
): Promise<AgentProfile> => {
  const profileId = await getSelectedAgentProfileForTelegram(telegramUserId)
  return getAgentProfile(profileId)
}

export const setSelectedAgentProfileForTelegram = async (
  telegramUserId: number,
  profileId: string
): Promise<boolean> => {
  try {
    const userId = await getUserIdFromTelegram(telegramUserId)
    if (!userId) {
      logger.warn(
        `agent-profile: No user found for telegram ID ${telegramUserId}`
      )
      return false
    }

    if (!AGENT_PROFILES[profileId]) {
      logger.warn(`agent-profile: Invalid profile ID: ${profileId}`)
      return false
    }

    await updatePreference<AgentProfilePreference>(userId, "agent_profile", {
      profileId,
    })

    logger.info(
      `agent-profile: Set profile ${profileId} for telegram user ${telegramUserId}`
    )
    return true
  } catch (error) {
    logger.error(`agent-profile: Failed to update preference: ${error}`)
    return false
  }
}

export const getAllAgentProfiles = (): AgentProfile[] => {
  return Object.values(AGENT_PROFILES)
}

export const getProviderIcon = (
  provider: "openai" | "google" | "anthropic"
): string => {
  switch (provider) {
    case "openai":
      return "○"
    case "google":
      return "◇"
    case "anthropic":
      return "△"
    default:
      return "●"
  }
}

export const getTierBadge = (tier: "free" | "pro" | "enterprise"): string => {
  switch (tier) {
    case "free":
      return "🆓"
    case "pro":
      return "⭐"
    case "enterprise":
      return "💎"
    default:
      return ""
  }
}
