import type { Request, Response } from "express"
import { reqResAsyncHandler, sendR } from "@/utils/http"
import { STATUS_RESPONSE, SUPABASE } from "@/config"
import {
  AGENT_PROFILES,
  getAgentProfile,
  getProfilesForTier,
  DEFAULT_AGENT_PROFILE_ID,
  type AgentTier,
} from "@/shared/orchestrator/agent-profiles"

interface AgentProfileDTO {
  id: string
  displayName: string
  tagline: string
  description: string
  tier: AgentTier
  capabilities: string[]
  provider: string
  supportsRealtime: boolean
  voice: {
    style: string
    speed: number
  }
}

function toDTO(profileId: string): AgentProfileDTO {
  const profile = getAgentProfile(profileId)
  return {
    id: profile.id,
    displayName: profile.displayName,
    tagline: profile.tagline,
    description: profile.description,
    tier: profile.tier,
    capabilities: profile.capabilities,
    provider: profile.modelConfig.provider,
    supportsRealtime: profile.modelConfig.supportsRealtime,
    voice: profile.voice,
  }
}

const listProfiles = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tier = (req.query.tier as AgentTier) || "pro"
  const voiceOnly = req.query.voiceOnly === "true"

  let profiles = getProfilesForTier(tier).map((p) => toDTO(p.id))

  if (voiceOnly) {
    profiles = profiles.filter((p) => p.supportsRealtime)
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Profiles retrieved", {
    profiles,
    defaultProfileId: DEFAULT_AGENT_PROFILE_ID,
  })
})

const getProfile = reqResAsyncHandler(async (req: Request, res: Response) => {
  const profileId = req.params.id

  if (!AGENT_PROFILES[profileId]) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Profile not found")
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Profile retrieved", {
    profile: toDTO(profileId),
  })
})

const getUserSelectedProfile = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    }

    const { data, error } = await SUPABASE.from("user_preferences")
      .select("preference_value")
      .eq("user_id", userId)
      .eq("preference_key", "agent_profile")
      .maybeSingle()

    if (error) {
      console.error("Error fetching agent profile preference:", error)
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error fetching preference"
      )
    }

    const profileId =
      (data?.preference_value as { profileId?: string })?.profileId ||
      DEFAULT_AGENT_PROFILE_ID

    if (!AGENT_PROFILES[profileId]) {
      return sendR(res, STATUS_RESPONSE.SUCCESS, "Profile retrieved", {
        profile: toDTO(DEFAULT_AGENT_PROFILE_ID),
        isDefault: true,
      })
    }

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Profile retrieved", {
      profile: toDTO(profileId),
      isDefault: !data,
    })
  }
)

const setUserSelectedProfile = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id
    const { profileId } = req.body

    if (!userId) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated")
    }

    if (!profileId || !AGENT_PROFILES[profileId]) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid profile ID")
    }

    const { error } = await SUPABASE.from("user_preferences").upsert(
      {
        user_id: userId,
        preference_key: "agent_profile",
        preference_value: { profileId },
        category: "assistant",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,preference_key" }
    )

    if (error) {
      console.error("Error saving agent profile preference:", error)
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error saving preference"
      )
    }

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Profile saved", {
      profile: toDTO(profileId),
    })
  }
)

export const agentProfilesController = {
  listProfiles,
  getProfile,
  getUserSelectedProfile,
  setUserSelectedProfile,
}
