import type { Request, Response } from "express"

import { SUPABASE } from "@/config/clients"
import sendR from "@/lib/send-response"
import { z } from "zod"

type InvitationMetadata = {
  referral_code?: string
  team_name?: string
  role?: string
  message?: string
}

const createReferralSchema = z.object({
  referredEmail: z.string().email("Invalid email address").optional(),
})

const applyReferralSchema = z.object({
  referralCode: z.string().min(6, "Invalid referral code"),
  referredEmail: z.string().email("Invalid email address"),
})

const claimRewardSchema = z.object({
  referralId: z.string().uuid("Invalid referral ID"),
})

export const referralController = {
  async getMyReferralCode(req: Request, res: Response) {
    const userId = req.user!.id
    const userEmail = req.user?.email

    if (!(userId && userEmail)) {
      return sendR(res, 401, "Unauthorized", null)
    }

    try {
      const { data: existing, error: fetchError } = await SUPABASE.from(
        "invitations"
      )
        .select("metadata")
        .eq("inviter_id", userId)
        .eq("invite_type", "referral")
        .eq("invitee_email", "")
        .single()

      if (existing) {
        const metadata = existing.metadata as InvitationMetadata | null
        const referralCode = metadata?.referral_code
        return sendR(res, 200, "Referral code retrieved", {
          referralCode,
          referralLink: `${process.env.FE_BASE_URL || "https://askally.io"}/signup?ref=${referralCode}`,
        })
      }

      const { data: newReferral, error: insertError } = await SUPABASE.from(
        "invitations"
      )
        .insert({
          invite_type: "referral",
          inviter_id: userId,
          inviter_email: userEmail,
          invitee_email: "",
          reward_type: "free_month",
          invite_token: "",
        })
        .select("metadata")
        .single()

      if (insertError) {
        throw insertError
      }

      const metadata = newReferral.metadata as InvitationMetadata | null
      const referralCode = metadata?.referral_code
      return sendR(res, 201, "Referral code created", {
        referralCode,
        referralLink: `${process.env.FE_BASE_URL || "https://askally.io"}/signup?ref=${referralCode}`,
      })
    } catch (error) {
      console.error("Get referral code error:", error)
      return sendR(res, 500, "Failed to get referral code", null)
    }
  },

  async createReferral(req: Request, res: Response) {
    const userId = req.user!.id
    const userEmail = req.user?.email

    if (!(userId && userEmail)) {
      return sendR(res, 401, "Unauthorized", null)
    }

    const validation = createReferralSchema.safeParse(req.body)
    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null)
    }

    const { referredEmail } = validation.data

    try {
      if (referredEmail && referredEmail === userEmail) {
        return sendR(res, 400, "You cannot refer yourself", null)
      }

      const { data: newReferral, error } = await SUPABASE.from("invitations")
        .insert({
          invite_type: "referral",
          inviter_id: userId,
          inviter_email: userEmail,
          invitee_email: referredEmail || "",
          reward_type: "free_month",
          invite_token: "",
        })
        .select("*")
        .single()

      if (error) {
        throw error
      }

      const metadata = newReferral.metadata as InvitationMetadata | null
      const referralCode = metadata?.referral_code
      return sendR(res, 201, "Referral created", {
        referralCode,
        referralLink: `${process.env.FE_BASE_URL || "https://askally.io"}/signup?ref=${referralCode}`,
      })
    } catch (error) {
      console.error("Create referral error:", error)
      return sendR(res, 500, "Failed to create referral", null)
    }
  },

  async applyReferralCode(req: Request, res: Response) {
    const validation = applyReferralSchema.safeParse(req.body)
    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null)
    }

    const { referralCode, referredEmail } = validation.data

    try {
      const { data: referral, error: fetchError } = await SUPABASE.from(
        "invitations"
      )
        .select("*")
        .eq("invite_type", "referral")
        .eq("metadata->>referral_code", referralCode)
        .single()

      if (fetchError || !referral) {
        return sendR(res, 404, "Invalid referral code", null)
      }

      if (referral.inviter_email === referredEmail) {
        return sendR(res, 400, "You cannot use your own referral code", null)
      }

      if (referral.status !== "pending") {
        return sendR(res, 400, "This referral code has already been used", null)
      }

      if (referral.expires_at && new Date(referral.expires_at) < new Date()) {
        return sendR(res, 400, "This referral code has expired", null)
      }

      const { error: updateError } = await SUPABASE.from("invitations")
        .update({
          invitee_email: referredEmail,
          status: "signed_up",
          updated_at: new Date().toISOString(),
        })
        .eq("id", referral.id)

      if (updateError) {
        throw updateError
      }

      return sendR(res, 200, "Referral code applied successfully", {
        referrerEmail: referral.inviter_email,
        rewardType: referral.reward_type,
      })
    } catch (error) {
      console.error("Apply referral code error:", error)
      return sendR(res, 500, "Failed to apply referral code", null)
    }
  },

  async convertReferral(req: Request, res: Response) {
    const userId = req.user!.id
    const userEmail = req.user?.email

    if (!(userId && userEmail)) {
      return sendR(res, 401, "Unauthorized", null)
    }

    try {
      const { data: referral, error: fetchError } = await SUPABASE.from(
        "invitations"
      )
        .select("*")
        .eq("invite_type", "referral")
        .eq("invitee_email", userEmail)
        .eq("status", "signed_up")
        .single()

      if (fetchError || !referral) {
        return sendR(
          res,
          404,
          "No pending referral found for your account",
          null
        )
      }

      const { error: updateError } = await SUPABASE.from("invitations")
        .update({
          invitee_id: userId,
          status: "converted",
          converted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", referral.id)

      if (updateError) {
        throw updateError
      }

      return sendR(res, 200, "Referral converted successfully", {
        rewardType: referral.reward_type,
        rewardAmount: referral.reward_amount,
      })
    } catch (error) {
      console.error("Convert referral error:", error)
      return sendR(res, 500, "Failed to convert referral", null)
    }
  },

  async getMyReferrals(req: Request, res: Response) {
    const userId = req.user!.id

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    try {
      const { data: invitations, error } = await SUPABASE.from("invitations")
        .select("*")
        .eq("invite_type", "referral")
        .eq("inviter_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      const referrals = invitations.map((inv) => ({
        id: inv.id,
        referrer_id: inv.inviter_id,
        referrer_email: inv.inviter_email,
        referral_code: (inv.metadata as InvitationMetadata | null)
          ?.referral_code,
        referred_email: inv.invitee_email || null,
        referred_id: inv.invitee_id,
        status: inv.status,
        reward_type: inv.reward_type,
        reward_amount: inv.reward_amount,
        reward_claimed_at: inv.reward_claimed_at,
        expires_at: inv.expires_at,
        converted_at: inv.converted_at,
        created_at: inv.created_at,
        updated_at: inv.updated_at,
      }))

      return sendR(res, 200, "Referrals retrieved", { referrals })
    } catch (error) {
      console.error("Get referrals error:", error)
      return sendR(res, 500, "Failed to get referrals", null)
    }
  },

  async getMyReferralStats(req: Request, res: Response) {
    const userId = req.user!.id

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    try {
      const { data: referrals, error } = await SUPABASE.from("invitations")
        .select("status, reward_type, reward_amount")
        .eq("invite_type", "referral")
        .eq("inviter_id", userId)

      if (error) {
        throw error
      }

      const stats = {
        total_referrals: referrals?.length || 0,
        successful_referrals:
          referrals?.filter(
            (r) => r.status === "converted" || r.status === "rewarded"
          ).length || 0,
        pending_referrals:
          referrals?.filter(
            (r) => r.status === "pending" || r.status === "signed_up"
          ).length || 0,
        total_rewards_earned:
          referrals?.filter((r) => r.status === "rewarded").length || 0,
        total_free_months_earned:
          referrals
            ?.filter(
              (r) => r.status === "rewarded" && r.reward_type === "free_month"
            )
            .reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0,
      }

      return sendR(res, 200, "Referral stats retrieved", { stats })
    } catch (error) {
      console.error("Get referral stats error:", error)
      return sendR(res, 500, "Failed to get referral stats", null)
    }
  },

  async claimReward(req: Request, res: Response) {
    const userId = req.user!.id

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    const validation = claimRewardSchema.safeParse(req.body)
    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null)
    }

    const { referralId } = validation.data

    try {
      const { data: referral, error: fetchError } = await SUPABASE.from(
        "invitations"
      )
        .select("*")
        .eq("id", referralId)
        .eq("invite_type", "referral")
        .eq("inviter_id", userId)
        .eq("status", "converted")
        .single()

      if (fetchError || !referral) {
        return sendR(res, 404, "No claimable referral found", null)
      }

      const { error: updateError } = await SUPABASE.from("invitations")
        .update({
          status: "rewarded",
          reward_claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", referralId)

      if (updateError) {
        throw updateError
      }

      return sendR(res, 200, "Reward claimed successfully", {
        rewardType: referral.reward_type,
        rewardAmount: referral.reward_amount,
      })
    } catch (error) {
      console.error("Claim reward error:", error)
      return sendR(res, 500, "Failed to claim reward", null)
    }
  },

  async validateReferralCode(req: Request, res: Response) {
    const code = Array.isArray(req.params.code)
      ? req.params.code[0]
      : req.params.code

    if (!code) {
      return sendR(res, 400, "Referral code is required", null)
    }

    try {
      const { data: referral, error } = await SUPABASE.from("invitations")
        .select("inviter_email, status, expires_at, reward_type, metadata")
        .eq("invite_type", "referral")
        .eq("metadata->>referral_code", code)
        .single()

      if (error || !referral) {
        return sendR(res, 404, "Invalid referral code", { valid: false })
      }

      const isExpired =
        referral.expires_at && new Date(referral.expires_at) < new Date()
      const isUsed = referral.status !== "pending"

      return sendR(res, 200, "Referral code validated", {
        valid: !(isExpired || isUsed),
        expired: isExpired,
        used: isUsed,
        rewardType: referral.reward_type,
      })
    } catch (error) {
      console.error("Validate referral code error:", error)
      return sendR(res, 500, "Failed to validate referral code", null)
    }
  },
}
