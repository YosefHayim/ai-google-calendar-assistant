import type { Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import * as preferencesService from "@/services/user-preferences-service";
import {
  AGENT_PROFILES,
  type AgentTier,
  DEFAULT_AGENT_PROFILE_ID,
  getAgentProfile,
  getProfilesForTier,
} from "@/shared/orchestrator/agent-profiles";
import { requireUserId } from "@/utils/auth/require-user";
import { reqResAsyncHandler, sendR } from "@/utils/http";

type AgentProfileDTO = {
  id: string;
  displayName: string;
  tagline: string;
  description: string;
  tier: AgentTier;
  capabilities: string[];
  provider: string;
  voice: {
    style: string;
    speed: number;
  };
};

function toDTO(profileId: string): AgentProfileDTO {
  const profile = getAgentProfile(profileId);
  return {
    id: profile.id,
    displayName: profile.displayName,
    tagline: profile.tagline,
    description: profile.description,
    tier: profile.tier,
    capabilities: profile.capabilities,
    provider: profile.modelConfig.provider,
    voice: profile.voice,
  };
}

const listProfiles = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tier = (req.query.tier as AgentTier) || "pro";

  const profiles = getProfilesForTier(tier).map((p) => toDTO(p.id));

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Profiles retrieved", {
    profiles,
    defaultProfileId: DEFAULT_AGENT_PROFILE_ID,
  });
});

const getProfile = reqResAsyncHandler(async (req: Request, res: Response) => {
  const profileId = req.params.id;

  if (!AGENT_PROFILES[profileId]) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "Profile not found");
  }

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Profile retrieved", {
    profile: toDTO(profileId),
  });
});

const getUserSelectedProfile = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId } = userResult;

    try {
      const agentPref =
        await preferencesService.getAgentProfilePreference(userId);
      const profileId = agentPref?.profileId || DEFAULT_AGENT_PROFILE_ID;

      if (!AGENT_PROFILES[profileId]) {
        return sendR(res, STATUS_RESPONSE.SUCCESS, "Profile retrieved", {
          profile: toDTO(DEFAULT_AGENT_PROFILE_ID),
          isDefault: true,
        });
      }

      return sendR(res, STATUS_RESPONSE.SUCCESS, "Profile retrieved", {
        profile: toDTO(profileId),
        isDefault: !agentPref,
      });
    } catch (error) {
      console.error("Error fetching agent profile preference:", error);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error fetching preference"
      );
    }
  }
);

const setUserSelectedProfile = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUserId(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId } = userResult;

    const { profileId } = req.body;

    if (!(profileId && AGENT_PROFILES[profileId])) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid profile ID");
    }

    try {
      await preferencesService.updatePreference(userId, "agent_profile", {
        profileId,
      });

      return sendR(res, STATUS_RESPONSE.SUCCESS, "Profile saved", {
        profile: toDTO(profileId),
      });
    } catch (error) {
      console.error("Error saving agent profile preference:", error);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Error saving preference"
      );
    }
  }
);

export const agentProfilesController = {
  listProfiles,
  getProfile,
  getUserSelectedProfile,
  setUserSelectedProfile,
};
