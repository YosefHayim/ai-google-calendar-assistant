import type { AgentProfile } from "./agent-profiles";
import { DEFAULT_AGENT_PROFILE_ID, getAgentProfile } from "./agent-profiles";

export type AgentProfileResponse = {
  id: string;
  displayName: string;
  tagline: string;
  description: string;
  tier: string;
  supportsVoice: boolean;
};

export function formatProfileForClient(
  profile: AgentProfile
): AgentProfileResponse {
  return {
    id: profile.id,
    displayName: profile.displayName,
    tagline: profile.tagline,
    description: profile.description,
    tier: profile.tier,
    supportsVoice: profile.capabilities.includes("voice"),
  };
}

export { DEFAULT_AGENT_PROFILE_ID, getAgentProfile };
