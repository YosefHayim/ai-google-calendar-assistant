import { Request, Response } from "express"
import { z } from "zod"
import { SUPABASE } from "@/config/clients"
import { sendR } from "@/utils/send-response"

const createInviteSchema = z.object({
  inviteeEmail: z.string().email("Invalid email address"),
  teamName: z.string().min(1).max(100).optional(),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
  message: z.string().max(500).optional(),
})

const respondToInviteSchema = z.object({
  inviteToken: z.string().min(1, "Invite token is required"),
  action: z.enum(["accept", "decline"]),
})

const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100),
  description: z.string().max(500).optional(),
})

export const teamInviteController = {
  async createInvite(req: Request, res: Response) {
    const userId = req.user?.id
    const userEmail = req.user?.email

    if (!userId || !userEmail) {
      return sendR(res, 401, "Unauthorized", null)
    }

    const validation = createInviteSchema.safeParse(req.body)
    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null)
    }

    const { inviteeEmail, teamName, role, message } = validation.data

    try {
      if (inviteeEmail === userEmail) {
        return sendR(res, 400, "You cannot invite yourself", null)
      }

      const { data: existingInvite } = await SUPABASE
        .from("invitations")
        .select("id, status")
        .eq("invite_type", "team")
        .eq("inviter_id", userId)
        .eq("invitee_email", inviteeEmail)
        .eq("status", "pending")
        .single()

      if (existingInvite) {
        return sendR(res, 400, "An invite is already pending for this email", null)
      }

      const { data: invite, error } = await SUPABASE
        .from("invitations")
        .insert({
          invite_type: "team",
          inviter_id: userId,
          inviter_email: userEmail,
          invitee_email: inviteeEmail,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {
            team_name: teamName,
            role,
            message,
          },
        })
        .select("*")
        .single()

      if (error) throw error

      const inviteLink = `${process.env.FE_BASE_URL || "https://askally.io"}/invite/${invite.invite_token}`

      return sendR(res, 201, "Invite sent successfully", {
        invite: {
          id: invite.id,
          inviteeEmail: invite.invitee_email,
          status: invite.status,
          role: invite.metadata?.role,
          inviteLink,
          expiresAt: invite.expires_at,
        },
      })
    } catch (error) {
      console.error("Create invite error:", error)
      return sendR(res, 500, "Failed to create invite", null)
    }
  },

  async getSentInvites(req: Request, res: Response) {
    const userId = req.user?.id

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    try {
      const { data: invitations, error } = await SUPABASE
        .from("invitations")
        .select("*")
        .eq("invite_type", "team")
        .eq("inviter_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      const invites = invitations.map((inv) => ({
        id: inv.id,
        inviter_id: inv.inviter_id,
        inviter_email: inv.inviter_email,
        invitee_email: inv.invitee_email,
        invitee_id: inv.invitee_id,
        team_name: inv.metadata?.team_name,
        role: inv.metadata?.role,
        status: inv.status,
        invite_token: inv.invite_token,
        message: inv.metadata?.message,
        expires_at: inv.expires_at,
        accepted_at: inv.accepted_at,
        created_at: inv.created_at,
        updated_at: inv.updated_at,
      }))

      return sendR(res, 200, "Sent invites retrieved", { invites })
    } catch (error) {
      console.error("Get sent invites error:", error)
      return sendR(res, 500, "Failed to get sent invites", null)
    }
  },

  async getReceivedInvites(req: Request, res: Response) {
    const userEmail = req.user?.email

    if (!userEmail) {
      return sendR(res, 401, "Unauthorized", null)
    }

    try {
      const { data: invitations, error } = await SUPABASE
        .from("invitations")
        .select("*")
        .eq("invite_type", "team")
        .eq("invitee_email", userEmail)
        .in("status", ["pending"])
        .order("created_at", { ascending: false })

      if (error) throw error

      const invites = invitations.map((inv) => ({
        id: inv.id,
        inviter_id: inv.inviter_id,
        inviter_email: inv.inviter_email,
        invitee_email: inv.invitee_email,
        invitee_id: inv.invitee_id,
        team_name: inv.metadata?.team_name,
        role: inv.metadata?.role,
        status: inv.status,
        invite_token: inv.invite_token,
        message: inv.metadata?.message,
        expires_at: inv.expires_at,
        accepted_at: inv.accepted_at,
        created_at: inv.created_at,
        updated_at: inv.updated_at,
      }))

      return sendR(res, 200, "Received invites retrieved", { invites })
    } catch (error) {
      console.error("Get received invites error:", error)
      return sendR(res, 500, "Failed to get received invites", null)
    }
  },

  async respondToInvite(req: Request, res: Response) {
    const userId = req.user?.id
    const userEmail = req.user?.email

    if (!userId || !userEmail) {
      return sendR(res, 401, "Unauthorized", null)
    }

    const validation = respondToInviteSchema.safeParse(req.body)
    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null)
    }

    const { inviteToken, action } = validation.data

    try {
      const { data: invite, error: fetchError } = await SUPABASE
        .from("invitations")
        .select("*")
        .eq("invite_type", "team")
        .eq("invite_token", inviteToken)
        .eq("invitee_email", userEmail)
        .single()

      if (fetchError || !invite) {
        return sendR(res, 404, "Invite not found", null)
      }

      if (invite.status !== "pending") {
        return sendR(res, 400, `This invite has already been ${invite.status}`, null)
      }

      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        await SUPABASE
          .from("invitations")
          .update({ status: "expired", updated_at: new Date().toISOString() })
          .eq("id", invite.id)
        return sendR(res, 400, "This invite has expired", null)
      }

      const newStatus = action === "accept" ? "accepted" : "declined"

      const { error: updateError } = await SUPABASE
        .from("invitations")
        .update({
          status: newStatus,
          invitee_id: action === "accept" ? userId : null,
          accepted_at: action === "accept" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invite.id)

      if (updateError) throw updateError

      return sendR(res, 200, `Invite ${newStatus} successfully`, {
        status: newStatus,
        inviterEmail: invite.inviter_email,
        teamName: invite.metadata?.team_name,
      })
    } catch (error) {
      console.error("Respond to invite error:", error)
      return sendR(res, 500, "Failed to respond to invite", null)
    }
  },

  async cancelInvite(req: Request, res: Response) {
    const userId = req.user?.id
    const inviteId = req.params.id

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    if (!inviteId) {
      return sendR(res, 400, "Invite ID is required", null)
    }

    try {
      const { data: invite, error: fetchError } = await SUPABASE
        .from("invitations")
        .select("*")
        .eq("id", inviteId)
        .eq("invite_type", "team")
        .eq("inviter_id", userId)
        .single()

      if (fetchError || !invite) {
        return sendR(res, 404, "Invite not found", null)
      }

      if (invite.status !== "pending") {
        return sendR(res, 400, "Only pending invites can be cancelled", null)
      }

      const { error: updateError } = await SUPABASE
        .from("invitations")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", inviteId)

      if (updateError) throw updateError

      return sendR(res, 200, "Invite cancelled successfully", null)
    } catch (error) {
      console.error("Cancel invite error:", error)
      return sendR(res, 500, "Failed to cancel invite", null)
    }
  },

  async resendInvite(req: Request, res: Response) {
    const userId = req.user?.id
    const inviteId = req.params.id

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    if (!inviteId) {
      return sendR(res, 400, "Invite ID is required", null)
    }

    try {
      const { data: invite, error: fetchError } = await SUPABASE
        .from("invitations")
        .select("*")
        .eq("id", inviteId)
        .eq("invite_type", "team")
        .eq("inviter_id", userId)
        .single()

      if (fetchError || !invite) {
        return sendR(res, 404, "Invite not found", null)
      }

      if (invite.status !== "pending" && invite.status !== "expired") {
        return sendR(res, 400, "Only pending or expired invites can be resent", null)
      }

      const { error: updateError } = await SUPABASE
        .from("invitations")
        .update({
          status: "pending",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", inviteId)

      if (updateError) throw updateError

      const inviteLink = `${process.env.FE_BASE_URL || "https://askally.io"}/invite/${invite.invite_token}`

      return sendR(res, 200, "Invite resent successfully", {
        inviteLink,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
    } catch (error) {
      console.error("Resend invite error:", error)
      return sendR(res, 500, "Failed to resend invite", null)
    }
  },

  async getInviteByToken(req: Request, res: Response) {
    const token = req.params.token

    if (!token) {
      return sendR(res, 400, "Invite token is required", null)
    }

    try {
      const { data: invite, error } = await SUPABASE
        .from("invitations")
        .select("inviter_email, metadata, status, expires_at")
        .eq("invite_type", "team")
        .eq("invite_token", token)
        .single()

      if (error || !invite) {
        return sendR(res, 404, "Invite not found", { valid: false })
      }

      const isExpired = invite.expires_at && new Date(invite.expires_at) < new Date()
      const isPending = invite.status === "pending"

      return sendR(res, 200, "Invite details retrieved", {
        valid: !isExpired && isPending,
        expired: isExpired,
        status: invite.status,
        inviterEmail: invite.inviter_email,
        teamName: invite.metadata?.team_name,
        role: invite.metadata?.role,
        message: invite.metadata?.message,
      })
    } catch (error) {
      console.error("Get invite by token error:", error)
      return sendR(res, 500, "Failed to get invite details", null)
    }
  },

  async createTeam(req: Request, res: Response) {
    const userId = req.user?.id

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    const validation = createTeamSchema.safeParse(req.body)
    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null)
    }

    const { name, description } = validation.data

    try {
      const { data: team, error: teamError } = await SUPABASE
        .from("teams")
        .insert({
          name,
          description,
          owner_id: userId,
        })
        .select("*")
        .single()

      if (teamError) throw teamError

      const { error: memberError } = await SUPABASE
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: userId,
          role: "owner",
        })

      if (memberError) throw memberError

      return sendR(res, 201, "Team created successfully", { team })
    } catch (error) {
      console.error("Create team error:", error)
      return sendR(res, 500, "Failed to create team", null)
    }
  },

  async getMyTeams(req: Request, res: Response) {
    const userId = req.user?.id

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    try {
      const { data: memberships, error } = await SUPABASE
        .from("team_members")
        .select(`
          role,
          joined_at,
          teams (
            id,
            name,
            description,
            owner_id,
            settings,
            created_at
          )
        `)
        .eq("user_id", userId)

      if (error) throw error

      const teams = memberships.map((m) => ({
        ...m.teams,
        myRole: m.role,
        joinedAt: m.joined_at,
      }))

      return sendR(res, 200, "Teams retrieved", { teams })
    } catch (error) {
      console.error("Get my teams error:", error)
      return sendR(res, 500, "Failed to get teams", null)
    }
  },

  async getTeamMembers(req: Request, res: Response) {
    const userId = req.user?.id
    const teamId = req.params.teamId

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    if (!teamId) {
      return sendR(res, 400, "Team ID is required", null)
    }

    try {
      const { data: membership } = await SUPABASE
        .from("team_members")
        .select("role")
        .eq("team_id", teamId)
        .eq("user_id", userId)
        .single()

      if (!membership) {
        return sendR(res, 403, "You are not a member of this team", null)
      }

      const { data: members, error } = await SUPABASE
        .from("team_members")
        .select("user_id, role, joined_at")
        .eq("team_id", teamId)

      if (error) throw error

      return sendR(res, 200, "Team members retrieved", { members })
    } catch (error) {
      console.error("Get team members error:", error)
      return sendR(res, 500, "Failed to get team members", null)
    }
  },
}
