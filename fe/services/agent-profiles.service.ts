import type { ApiResponse } from '@/types/api'
import { ENDPOINTS } from '@/lib/api/endpoints'
import { apiClient } from '@/lib/api/client'

// ============================================
// Agent Profile Types (matching backend)
// ============================================

export type AgentTier = 'free' | 'pro' | 'enterprise'

export type AgentCapability =
  | 'calendar_read'
  | 'calendar_write'
  | 'gap_analysis'
  | 'smart_scheduling'
  | 'multi_calendar'
  | 'voice'
  | 'realtime'

export type VoiceStyle = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'

export interface AgentProfile {
  id: string
  displayName: string
  tagline: string
  description: string
  tier: AgentTier
  capabilities: AgentCapability[]
  modelConfig: {
    provider: 'openai' | 'google' | 'anthropic'
    tier: 'fast' | 'balanced' | 'powerful'
    supportsRealtime: boolean
  }
  voice: {
    style: VoiceStyle
    speed: number
  }
  personality: {
    conciseness: number
    casualness: number
    notes: string
  }
  version: 'v1'
}

// ============================================
// Response Types
// ============================================

export interface AgentProfilesResponse {
  profiles: AgentProfile[]
  defaultProfileId: string
}

export interface SelectedProfileResponse {
  profileId: string
  profile: AgentProfile
}

// ============================================
// Query Params
// ============================================

export interface GetProfilesParams {
  tier?: AgentTier
  voiceOnly?: boolean
}

// ============================================
// Service
// ============================================

export const agentProfilesService = {
  /**
   * Get all available agent profiles
   * Optionally filter by tier and voice-only capability
   */
  async getProfiles(params?: GetProfilesParams): Promise<ApiResponse<AgentProfilesResponse>> {
    const searchParams = new URLSearchParams()
    if (params?.tier) searchParams.set('tier', params.tier)
    if (params?.voiceOnly) searchParams.set('voiceOnly', 'true')

    const url = searchParams.toString()
      ? `${ENDPOINTS.AGENT_PROFILES}?${searchParams.toString()}`
      : ENDPOINTS.AGENT_PROFILES

    const { data } = await apiClient.get<ApiResponse<AgentProfilesResponse>>(url)
    return data
  },

  /**
   * Get a specific agent profile by ID
   */
  async getProfileById(id: string): Promise<ApiResponse<AgentProfile>> {
    const { data } = await apiClient.get<ApiResponse<AgentProfile>>(ENDPOINTS.AGENT_PROFILES_BY_ID(id))
    return data
  },

  /**
   * Get user's currently selected agent profile
   */
  async getSelectedProfile(): Promise<ApiResponse<SelectedProfileResponse>> {
    const { data } = await apiClient.get<ApiResponse<SelectedProfileResponse>>(ENDPOINTS.AGENT_PROFILES_SELECTED)
    return data
  },

  /**
   * Set user's selected agent profile
   */
  async setSelectedProfile(profileId: string): Promise<ApiResponse<SelectedProfileResponse>> {
    const { data } = await apiClient.put<ApiResponse<SelectedProfileResponse>>(ENDPOINTS.AGENT_PROFILES_SELECTED, {
      profileId,
    })
    return data
  },
}
