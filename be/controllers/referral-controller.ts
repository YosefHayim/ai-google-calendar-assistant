import { Request, Response } from "express"
import { z } from "zod"
import { SUPABASE } from "@/config/clients"
import { sendR } from "@/utils/send-response"

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
    const userId = req.user?.id
    const userEmail = req.user?.email

    if (!userId || !userEmail) {
      return sendR(res, 401, "Unauthorized", null)
    }

    try {
      const { data: existing, error: fetchError } = await SUPABASE
        .from("referrals")
        .select("referral_code")
        .eq("referrer_id", userId)
        .is("referred_email", null)
        .single()

      if (existing) {
        return sendR(res, 200, "Referral code retrieved", {
          referralCode: existing.referral_code,
          referralLink: `${process.env.FE_BASE_URL || "https://askally.io"}/signup?ref=${existing.referral_code}`,
        })
      }

      const { data: newReferral, error: insertError } = await SUPABASE
        .from("referrals")
        .insert({
          referrer_id: userId,
          referrer_email: userEmail,
        })
        .select("referral_code")
        .single()

      if (insertError) throw insertError

      return sendR(res, 201, "Referral code created", {
        referralCode: newReferral.referral_code,
        referralLink: `${process.env.FE_BASE_URL || "https://askally.io"}/signup?ref=${newReferral.referral_code}`,
      })
    } catch (error) {
      console.error("Get referral code error:", error)
      return sendR(res, 500, "Failed to get referral code", null)
    }
  },

  async createReferral(req: Request, res: Response) {
    const userId = req.user?.id
    const userEmail = req.user?.email

    if (!userId || !userEmail) {
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

      const { data: newReferral, error } = await SUPABASE
        .from("referrals")
        .insert({
          referrer_id: userId,
          referrer_email: userEmail,
          referred_email: referredEmail || null,
        })
        .select("*")
        .single()

      if (error) throw error

      return sendR(res, 201, "Referral created", {
        referralCode: newReferral.referral_code,
        referralLink: `${process.env.FE_BASE_URL || "https://askally.io"}/signup?ref=${newReferral.referral_code}`,
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
      const { data: referral, error: fetchError } = await SUPABASE
        .from("referrals")
        .select("*")
        .eq("referral_code", referralCode)
        .single()

      if (fetchError || !referral) {
        return sendR(res, 404, "Invalid referral code", null)
      }

      if (referral.referrer_email === referredEmail) {
        return sendR(res, 400, "You cannot use your own referral code", null)
      }

      if (referral.status !== "pending") {
        return sendR(res, 400, "This referral code has already been used", null)
      }

      if (referral.expires_at && new Date(referral.expires_at) < new Date()) {
        return sendR(res, 400, "This referral code has expired", null)
      }

      const { error: updateError } = await SUPABASE
        .from("referrals")
        .update({
          referred_email: referredEmail,
          status: "signed_up",
          updated_at: new Date().toISOString(),
        })
        .eq("id", referral.id)

      if (updateError) throw updateError

      return sendR(res, 200, "Referral code applied successfully", {
        referrerEmail: referral.referrer_email,
        rewardType: referral.reward_type,
      })
    } catch (error) {
      console.error("Apply referral code error:", error)
      return sendR(res, 500, "Failed to apply referral code", null)
    }
  },

  async convertReferral(req: Request, res: Response) {
    const userId = req.user?.id
    const userEmail = req.user?.email

    if (!userId || !userEmail) {
      return sendR(res, 401, "Unauthorized", null)
    }

    try {
      const { data: referral, error: fetchError } = await SUPABASE
        .from("referrals")
        .select("*")
        .eq("referred_email", userEmail)
        .eq("status", "signed_up")
        .single()

      if (fetchError || !referral) {
        return sendR(res, 404, "No pending referral found for your account", null)
      }

      const { error: updateError } = await SUPABASE
        .from("referrals")
        .update({
          referred_id: userId,
          status: "converted",
          converted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", referral.id)

      if (updateError) throw updateError

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
    const userId = req.user?.id

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    try {
      const { data: referrals, error } = await SUPABASE
        .from("referrals")
        .select("*")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return sendR(res, 200, "Referrals retrieved", { referrals })
    } catch (error) {
      console.error("Get referrals error:", error)
      return sendR(res, 500, "Failed to get referrals", null)
    }
  },

  async getMyReferralStats(req: Request, res: Response) {
    const userId = req.user?.id

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    try {
      const { data: stats, error } = await SUPABASE
        .from("referral_stats")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") throw error

      const defaultStats = {
        total_referrals: 0,
        successful_referrals: 0,
        pending_referrals: 0,
        total_rewards_earned: 0,
        total_free_months_earned: 0,
      }

      return sendR(res, 200, "Referral stats retrieved", {
        stats: stats || defaultStats,
      })
    } catch (error) {
      console.error("Get referral stats error:", error)
      return sendR(res, 500, "Failed to get referral stats", null)
    }
  },

  async claimReward(req: Request, res: Response) {
    const userId = req.user?.id

    if (!userId) {
      return sendR(res, 401, "Unauthorized", null)
    }

    const validation = claimRewardSchema.safeParse(req.body)
    if (!validation.success) {
      return sendR(res, 400, validation.error.errors[0].message, null)
    }

    const { referralId } = validation.data

    try {
      const { data: referral, error: fetchError } = await SUPABASE
        .from("referrals")
        .select("*")
        .eq("id", referralId)
        .eq("referrer_id", userId)
        .eq("status", "converted")
        .single()

      if (fetchError || !referral) {
        return sendR(res, 404, "No claimable referral found", null)
      }

      const { error: updateError } = await SUPABASE
        .from("referrals")
        .update({
          status: "rewarded",
          reward_claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", referralId)

      if (updateError) throw updateError

      await SUPABASE
        .from("referral_stats")
        .update({
          total_rewards_earned: SUPABASE.rpc("increment", { x: 1 }),
          total_free_months_earned: referral.reward_type === "free_month" 
            ? SUPABASE.rpc("increment", { x: referral.reward_amount }) 
            : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

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
    const code = req.params.code

    if (!code) {
      return sendR(res, 400, "Referral code is required", null)
    }

    try {
      const { data: referral, error } = await SUPABASE
        .from("referrals")
        .select("referrer_email, status, expires_at, reward_type")
        .eq("referral_code", code)
        .single()

      if (error || !referral) {
        return sendR(res, 404, "Invalid referral code", { valid: false })
      }

      const isExpired = referral.expires_at && new Date(referral.expires_at) < new Date()
      const isUsed = referral.status !== "pending"

      return sendR(res, 200, "Referral code validated", {
        valid: !isExpired && !isUsed,
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
