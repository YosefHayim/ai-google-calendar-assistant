import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'
import type { ApiResponse } from '@/types/api'
import type { TTSVoice } from '@/lib/validations/preferences'

export type TranscriptionResponse = {
  text: string
}

export type AgentProfile = {
  id: string
  displayName: string
  tagline: string
  description: string
  tier: 'free' | 'pro' | 'enterprise'
  supportsVoice: boolean
  supportsRealtime: boolean
}

export type AgentProfilesResponse = {
  profiles: AgentProfile[]
  defaultProfileId: string
}

export type LiveKitTokenResponse = {
  token: string
  roomName: string
  wsUrl: string
  profile: AgentProfile
}

export const voiceService = {
  async transcribe(audioBlob: Blob): Promise<ApiResponse<TranscriptionResponse>> {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    const { data } = await apiClient.post<ApiResponse<TranscriptionResponse>>(ENDPOINTS.VOICE_TRANSCRIBE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  async synthesize(text: string, voice?: TTSVoice): Promise<ArrayBuffer> {
    const response = await apiClient.post<ArrayBuffer>(
      ENDPOINTS.VOICE_SYNTHESIZE,
      { text, voice },
      { responseType: 'arraybuffer' },
    )
    return response.data
  },

  async getLiveKitToken(profileId?: string): Promise<ApiResponse<LiveKitTokenResponse>> {
    const { data } = await apiClient.post<ApiResponse<LiveKitTokenResponse>>(ENDPOINTS.VOICE_LIVEKIT_TOKEN, {
      profileId,
    })
    return data
  },

  async getAgentProfiles(options?: {
    tier?: 'free' | 'pro' | 'enterprise'
    voiceOnly?: boolean
  }): Promise<ApiResponse<AgentProfilesResponse>> {
    const params = new URLSearchParams()
    if (options?.tier) params.append('tier', options.tier)
    if (options?.voiceOnly) params.append('voice', 'true')

    const url = params.toString() ? `${ENDPOINTS.VOICE_AGENT_PROFILES}?${params}` : ENDPOINTS.VOICE_AGENT_PROFILES

    const { data } = await apiClient.get<ApiResponse<AgentProfilesResponse>>(url)
    return data
  },
}
