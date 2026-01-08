'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  agentProfilesService,
  type AgentProfile,
  type AgentTier,
  type AgentProfilesResponse,
  type SelectedProfileResponse,
  type GetProfilesParams,
} from '@/lib/api/services/agent-profiles.service'
import { queryKeys } from '@/lib/query/keys'
import { QUERY_CONFIG } from '@/lib/constants'
import type { QueryHookOptions } from '../useQueryWrapper'

export function useAgentProfiles(params?: GetProfilesParams, options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.agentProfiles.list(params),
    queryFn: async () => {
      const response = await agentProfilesService.getProfiles(params)
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    profiles: query.data?.profiles ?? [],
    defaultProfileId: query.data?.defaultProfileId ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useAgentProfile(id: string, options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.agentProfiles.detail(id),
    queryFn: async () => {
      const response = await agentProfilesService.getProfileById(id)
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: (options?.enabled ?? true) && Boolean(id),
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useSelectedAgentProfile(options?: QueryHookOptions) {
  const query = useQuery({
    queryKey: queryKeys.agentProfiles.selected(),
    queryFn: async () => {
      const response = await agentProfilesService.getSelectedProfile()
      return response.data
    },
    staleTime: options?.staleTime ?? QUERY_CONFIG.USER_STALE_TIME,
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnMount: options?.refetchOnMount ?? true,
  })

  return {
    data: query.data ?? null,
    profileId: query.data?.profileId ?? null,
    profile: query.data?.profile ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useUpdateSelectedAgentProfile() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (profileId: string) => agentProfilesService.setSelectedProfile(profileId),
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData<SelectedProfileResponse>(queryKeys.agentProfiles.selected(), response.data)
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.agentProfiles.all })
    },
  })

  return {
    updateProfile: mutation.mutate,
    updateProfileAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

export type { AgentProfile, AgentTier, AgentProfilesResponse, SelectedProfileResponse, GetProfilesParams }
