'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teamInviteService, type CreateInviteData, type CreateTeamData } from '@/services/team-invite-service'
import { toast } from 'sonner'

export const teamKeys = {
  all: ['teams'] as const,
  teams: () => [...teamKeys.all, 'list'] as const,
  members: (teamId: string) => [...teamKeys.all, 'members', teamId] as const,
  invites: () => [...teamKeys.all, 'invites'] as const,
  sentInvites: () => [...teamKeys.invites(), 'sent'] as const,
  receivedInvites: () => [...teamKeys.invites(), 'received'] as const,
  inviteDetails: (token: string) => [...teamKeys.invites(), 'details', token] as const,
}

export function useMyTeams() {
  return useQuery({
    queryKey: teamKeys.teams(),
    queryFn: async () => {
      const response = await teamInviteService.getMyTeams()
      return response.data?.teams ?? []
    },
  })
}

export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: teamKeys.members(teamId),
    queryFn: async () => {
      const response = await teamInviteService.getTeamMembers(teamId)
      return response.data?.members ?? []
    },
    enabled: !!teamId,
  })
}

export function useSentInvites() {
  return useQuery({
    queryKey: teamKeys.sentInvites(),
    queryFn: async () => {
      const response = await teamInviteService.getSentInvites()
      return response.data?.invites ?? []
    },
  })
}

export function useReceivedInvites() {
  return useQuery({
    queryKey: teamKeys.receivedInvites(),
    queryFn: async () => {
      const response = await teamInviteService.getReceivedInvites()
      return response.data?.invites ?? []
    },
  })
}

export function useInviteDetails(token: string) {
  return useQuery({
    queryKey: teamKeys.inviteDetails(token),
    queryFn: async () => {
      const response = await teamInviteService.getInviteByToken(token)
      return response.data
    },
    enabled: !!token,
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTeamData) => {
      const response = await teamInviteService.createTeam(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.teams() })
      toast.success('Team created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create team')
    },
  })
}

export function useCreateInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateInviteData) => {
      const response = await teamInviteService.createInvite(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.sentInvites() })
      toast.success('Invite sent successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invite')
    },
  })
}

export function useRespondToInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ token, action }: { token: string; action: 'accept' | 'decline' }) => {
      const response = await teamInviteService.respondToInvite(token, action)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all })
      toast.success(`Invite ${variables.action === 'accept' ? 'accepted' : 'declined'}!`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to respond to invite')
    },
  })
}

export function useCancelInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const response = await teamInviteService.cancelInvite(inviteId)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.sentInvites() })
      toast.success('Invite cancelled')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel invite')
    },
  })
}

export function useResendInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const response = await teamInviteService.resendInvite(inviteId)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.sentInvites() })
      toast.success('Invite resent successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend invite')
    },
  })
}
