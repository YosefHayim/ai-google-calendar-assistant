import type { ApiResponse } from '@/types/api'
import { apiClient } from '@/lib/api/client'

export interface TeamInvite {
  id: string
  inviter_id: string
  inviter_email: string
  invitee_email: string
  invitee_id: string | null
  team_name: string | null
  role: 'admin' | 'member' | 'viewer'
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled'
  invite_token: string
  message: string | null
  expires_at: string
  accepted_at: string | null
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  description: string | null
  owner_id: string
  max_members: number
  created_at: string
  myRole?: string
  joinedAt?: string
}

export interface TeamMember {
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joined_at: string
}

export interface InviteDetails {
  valid: boolean
  expired?: boolean
  status: string
  inviterEmail: string
  teamName: string | null
  role: string
  message: string | null
}

export interface CreateInviteData {
  inviteeEmail: string
  teamName?: string
  role?: 'admin' | 'member' | 'viewer'
  message?: string
}

export interface CreateTeamData {
  name: string
  description?: string
}

export const teamInviteService = {
  async createInvite(data: CreateInviteData): Promise<ApiResponse<{ invite: Partial<TeamInvite>; inviteLink: string }>> {
    const { data: response } = await apiClient.post<ApiResponse<{ invite: Partial<TeamInvite>; inviteLink: string }>>(
      '/api/teams/invite',
      data,
    )
    return response
  },

  async getSentInvites(): Promise<ApiResponse<{ invites: TeamInvite[] }>> {
    const { data } = await apiClient.get<ApiResponse<{ invites: TeamInvite[] }>>('/api/teams/invites/sent')
    return data
  },

  async getReceivedInvites(): Promise<ApiResponse<{ invites: TeamInvite[] }>> {
    const { data } = await apiClient.get<ApiResponse<{ invites: TeamInvite[] }>>('/api/teams/invites/received')
    return data
  },

  async respondToInvite(
    inviteToken: string,
    action: 'accept' | 'decline',
  ): Promise<ApiResponse<{ status: string; inviterEmail: string; teamName: string | null }>> {
    const { data } = await apiClient.post<ApiResponse<{ status: string; inviterEmail: string; teamName: string | null }>>(
      '/api/teams/invite/respond',
      { inviteToken, action },
    )
    return data
  },

  async cancelInvite(inviteId: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/api/teams/invite/${inviteId}`)
    return data
  },

  async resendInvite(inviteId: string): Promise<ApiResponse<{ inviteLink: string; expiresAt: string }>> {
    const { data } = await apiClient.post<ApiResponse<{ inviteLink: string; expiresAt: string }>>(
      `/api/teams/invite/${inviteId}/resend`,
    )
    return data
  },

  async getInviteByToken(token: string): Promise<ApiResponse<InviteDetails>> {
    const { data } = await apiClient.get<ApiResponse<InviteDetails>>(`/api/teams/invite/${token}`)
    return data
  },

  async createTeam(teamData: CreateTeamData): Promise<ApiResponse<{ team: Team }>> {
    const { data } = await apiClient.post<ApiResponse<{ team: Team }>>('/api/teams', teamData)
    return data
  },

  async getMyTeams(): Promise<ApiResponse<{ teams: Team[] }>> {
    const { data } = await apiClient.get<ApiResponse<{ teams: Team[] }>>('/api/teams')
    return data
  },

  async getTeamMembers(teamId: string): Promise<ApiResponse<{ members: TeamMember[] }>> {
    const { data } = await apiClient.get<ApiResponse<{ members: TeamMember[] }>>(`/api/teams/${teamId}/members`)
    return data
  },
}
