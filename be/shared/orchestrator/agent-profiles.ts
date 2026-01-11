/**
 * Agent Profiles v1 - Branded agent configurations
 *
 * Users select agents by semantic name ("Ally Pro", "Ally Flash") rather than
 * raw model IDs. Each profile defines personality, capabilities, and tier.
 */

export type AgentTier = "free" | "pro" | "enterprise"

export type AgentCapability =
  | "calendar_read"
  | "calendar_write"
  | "gap_analysis"
  | "smart_scheduling"
  | "multi_calendar"
  | "voice"

export type VoiceStyle = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer"

export interface AgentProfile {
  /** Unique identifier (e.g., "ally-pro") */
  id: string
  /** Display name for UI (e.g., "Ally Pro") */
  displayName: string
  /** Short tagline */
  tagline: string
  /** Description for users */
  description: string
  /** Which tier is required to use this agent */
  tier: AgentTier
  /** Agent capabilities */
  capabilities: AgentCapability[]
  /** Model configuration key (resolved by model-registry) */
  modelConfig: {
    /** Provider: openai, google, anthropic */
    provider: "openai" | "google" | "anthropic"
    /** Tier within provider: fast, balanced, powerful */
    tier: "fast" | "balanced" | "powerful"
  }
  /** Voice settings for TTS */
  voice: {
    style: VoiceStyle
    speed: number
  }
  /** System prompt personality adjustments */
  personality: {
    /** How concise vs detailed responses should be (0-1) */
    conciseness: number
    /** How formal vs casual (0-1, 0=very formal) */
    casualness: number
    /** Custom personality notes appended to system prompt */
    notes: string
  }
  /** Version for future migrations */
  version: "v1"
}

/**
 * Available Agent Profiles
 *
 * Naming convention:
 * - "Ally" = base calendar assistant
 * - Suffix indicates capability/speed tradeoff
 */
export const AGENT_PROFILES: Record<string, AgentProfile> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // FREE TIER AGENTS
  // ═══════════════════════════════════════════════════════════════════════════
  "ally-lite": {
    id: "ally-lite",
    displayName: "Ally Lite",
    tagline: "Quick & Simple",
    description:
      "Fast responses for basic calendar tasks. Perfect for checking schedules and quick event creation.",
    tier: "free",
    capabilities: ["calendar_read", "calendar_write", "voice"],
    modelConfig: {
      provider: "openai",
      tier: "fast",
    },
    voice: {
      style: "alloy",
      speed: 1.1,
    },
    personality: {
      conciseness: 0.9,
      casualness: 0.6,
      notes: "Keep responses under 2 sentences. Be helpful but brief.",
    },
    version: "v1",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRO TIER AGENTS
  // ═══════════════════════════════════════════════════════════════════════════
  "ally-pro": {
    id: "ally-pro",
    displayName: "Ally Pro",
    tagline: "Smart & Capable",
    description:
      "Balanced intelligence for everyday calendar management. Handles complex scheduling, conflicts, and multi-calendar coordination.",
    tier: "pro",
    capabilities: [
      "calendar_read",
      "calendar_write",
      "gap_analysis",
      "smart_scheduling",
      "multi_calendar",
      "voice",
    ],
    modelConfig: {
      provider: "openai",
      tier: "balanced",
    },
    voice: {
      style: "nova",
      speed: 1.0,
    },
    personality: {
      conciseness: 0.7,
      casualness: 0.5,
      notes:
        "Be helpful and thorough. Proactively suggest optimizations when you notice scheduling issues.",
    },
    version: "v1",
  },

  "ally-flash": {
    id: "ally-flash",
    displayName: "Ally Flash",
    tagline: "Lightning Fast",
    description:
      "Optimized for speed. Best for rapid-fire calendar queries and quick actions when every second counts.",
    tier: "pro",
    capabilities: [
      "calendar_read",
      "calendar_write",
      "voice",
    ],
    modelConfig: {
      provider: "openai",
      tier: "fast",
    },
    voice: {
      style: "echo",
      speed: 1.2,
    },
    personality: {
      conciseness: 1.0,
      casualness: 0.4,
      notes: "Maximum brevity. One sentence answers. Action-focused.",
    },
    version: "v1",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTERPRISE TIER AGENTS
  // ═══════════════════════════════════════════════════════════════════════════
  "ally-executive": {
    id: "ally-executive",
    displayName: "Ally Executive",
    tagline: "Premium Intelligence",
    description:
      "Our most capable agent. Advanced reasoning for complex scheduling scenarios, executive assistance, and strategic time management.",
    tier: "enterprise",
    capabilities: [
      "calendar_read",
      "calendar_write",
      "gap_analysis",
      "smart_scheduling",
      "multi_calendar",
      "voice",
    ],
    modelConfig: {
      provider: "openai",
      tier: "powerful",
    },
    voice: {
      style: "onyx",
      speed: 0.95,
    },
    personality: {
      conciseness: 0.5,
      casualness: 0.3,
      notes:
        "Professional executive assistant tone. Anticipate needs. Provide context and recommendations. Handle complex multi-step requests gracefully.",
    },
    version: "v1",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ALTERNATIVE PROVIDERS
  // ═══════════════════════════════════════════════════════════════════════════
  "ally-gemini": {
    id: "ally-gemini",
    displayName: "Ally Gemini",
    tagline: "Google-Powered",
    description:
      "Powered by Google's Gemini. Excellent for users in the Google ecosystem with seamless Calendar integration.",
    tier: "pro",
    capabilities: [
      "calendar_read",
      "calendar_write",
      "gap_analysis",
      "smart_scheduling",
      "multi_calendar",
      "voice",
    ],
    modelConfig: {
      provider: "google",
      tier: "balanced",
    },
    voice: {
      style: "nova",
      speed: 1.0,
    },
    personality: {
      conciseness: 0.6,
      casualness: 0.5,
      notes: "Helpful and knowledgeable. Good at understanding context.",
    },
    version: "v1",
  },

  "ally-claude": {
    id: "ally-claude",
    displayName: "Ally Claude",
    tagline: "Anthropic-Powered",
    description:
      "Powered by Anthropic's Claude. Known for nuanced understanding, helpful responses, and strong reasoning capabilities.",
    tier: "pro",
    capabilities: [
      "calendar_read",
      "calendar_write",
      "gap_analysis",
      "smart_scheduling",
      "multi_calendar",
      "voice",
    ],
    modelConfig: {
      provider: "anthropic",
      tier: "balanced",
    },
    voice: {
      style: "nova",
      speed: 1.0,
    },
    personality: {
      conciseness: 0.6,
      casualness: 0.4,
      notes: "Thoughtful and precise. Excellent at understanding nuanced requests and providing clear explanations.",
    },
    version: "v1",
  },
}

/** Default agent for new users */
export const DEFAULT_AGENT_PROFILE_ID = "ally-lite"

/** Get profile by ID with fallback */
export function getAgentProfile(profileId: string): AgentProfile {
  return AGENT_PROFILES[profileId] ?? AGENT_PROFILES[DEFAULT_AGENT_PROFILE_ID]
}

/** Get all profiles available for a tier */
export function getProfilesForTier(tier: AgentTier): AgentProfile[] {
  const tierOrder: AgentTier[] = ["free", "pro", "enterprise"]
  const tierIndex = tierOrder.indexOf(tier)

  return Object.values(AGENT_PROFILES).filter((profile) => {
    const profileTierIndex = tierOrder.indexOf(profile.tier)
    return profileTierIndex <= tierIndex
  })
}
