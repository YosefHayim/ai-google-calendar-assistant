import { SUPABASE } from "@/config"
import { logger } from "@/utils/logger"
import { telegramConversation } from "@/utils/conversation/TelegramConversationAdapter"
import {
  AGENT_PROFILES,
  DEFAULT_AGENT_PROFILE_ID,
  getAgentProfile,
  type AgentProfile,
} from "@/shared/orchestrator/agent-profiles"

const getUserIdFromTelegram = (telegramUserId: number) =>
  telegramConversation.getUserIdFromTelegram(telegramUserId)

export type SelectedAgentProfilePreference = {
  profileId: string
  selectedAt: string
}

const DEFAULT_PREFERENCE: SelectedAgentProfilePreference = {
  profileId: DEFAULT_AGENT_PROFILE_ID,
  selectedAt: new Date().toISOString(),
}

export const getSelectedAgentProfileForTelegram = async (
  telegramUserId: number
): Promise<string> => {
  try {
    const userId = await getUserIdFromTelegram(telegramUserId)
    if (!userId) {
      return DEFAULT_AGENT_PROFILE_ID
    }

    const { data, error } = await SUPABASE.from("user_preferences")
      .select("preference_value")
      .eq("user_id", userId)
      .eq("preference_key", "selected_agent_profile")
      .maybeSingle()

    if (error) {
      logger.error(
        `agent-profile: Error fetching preference: ${error.message}`
      )
      return DEFAULT_AGENT_PROFILE_ID
    }

    if (!data) {
      return DEFAULT_AGENT_PROFILE_ID
    }

    const pref = data.preference_value as unknown as SelectedAgentProfilePreference
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

    const preference: SelectedAgentProfilePreference = {
      profileId,
      selectedAt: new Date().toISOString(),
    }

    const { error } = await SUPABASE.from("user_preferences").upsert(
      {
        user_id: userId,
        preference_key: "selected_agent_profile",
        preference_value: preference,
        category: "assistant",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,preference_key",
      }
    )

    if (error) {
      logger.error(
        `agent-profile: Error updating preference: ${error.message}`
      )
      return false
    }

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
