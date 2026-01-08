'use client'

import { useQuery } from '@tanstack/react-query'
import { voiceService, type AgentProfile } from '@/lib/api/services/voice.service'

export type AgentTier = 'free' | 'pro' | 'enterprise'

export interface UseAgentProfilesOptions {
  tier?: AgentTier
  voiceOnly?: boolean
  enabled?: boolean
}

export function useAgentProfiles(options: UseAgentProfilesOptions = {}) {
  const { tier, voiceOnly = true, enabled = true } = options

  return useQuery({
    queryKey: ['agent-profiles', tier, voiceOnly],
    queryFn: async () => {
      const response = await voiceService.getAgentProfiles({ tier, voiceOnly })
      if (response.status !== 'success') {
        throw new Error(response.message)
      }
      return response.data
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  })
}

export function useDefaultProfile(profiles: AgentProfile[] | undefined, defaultId: string | undefined) {
  if (!profiles || !defaultId) return undefined
  return profiles.find((p) => p.id === defaultId) ?? profiles[0]
}
