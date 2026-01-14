import type { ApiResponse } from '@/types/api'
import { apiClient } from '@/lib/api/client'

export interface ReferralCode {
  referralCode: string
  referralLink: string
}

export interface Referral {
  id: string
  referrer_id: string
  referrer_email: string
  referral_code: string
  referred_email: string | null
  referred_id: string | null
  status: 'pending' | 'signed_up' | 'converted' | 'rewarded' | 'expired'
  reward_type: 'free_month' | 'discount' | 'credits' | 'custom'
  reward_amount: number
  reward_claimed_at: string | null
  expires_at: string
  converted_at: string | null
  created_at: string
  updated_at: string
}

export interface ReferralStats {
  total_referrals: number
  successful_referrals: number
  pending_referrals: number
  total_rewards_earned: number
  total_free_months_earned: number
}

export interface ReferralValidation {
  valid: boolean
  expired?: boolean
  used?: boolean
  rewardType?: string
}

export interface ApplyReferralData {
  referralCode: string
  referredEmail: string
}

export const referralService = {
  async getMyReferralCode(): Promise<ApiResponse<ReferralCode>> {
    const { data } = await apiClient.get<ApiResponse<ReferralCode>>('/api/referral/code')
    return data
  },

  async createReferral(referredEmail?: string): Promise<ApiResponse<ReferralCode>> {
    const { data } = await apiClient.post<ApiResponse<ReferralCode>>('/api/referral/create', {
      referredEmail,
    })
    return data
  },

  async applyReferralCode(payload: ApplyReferralData): Promise<ApiResponse<{ referrerEmail: string; rewardType: string }>> {
    const { data } = await apiClient.post<ApiResponse<{ referrerEmail: string; rewardType: string }>>(
      '/api/referral/apply',
      payload,
    )
    return data
  },

  async convertReferral(): Promise<ApiResponse<{ rewardType: string; rewardAmount: number }>> {
    const { data } = await apiClient.post<ApiResponse<{ rewardType: string; rewardAmount: number }>>(
      '/api/referral/convert',
    )
    return data
  },

  async getMyReferrals(): Promise<ApiResponse<{ referrals: Referral[] }>> {
    const { data } = await apiClient.get<ApiResponse<{ referrals: Referral[] }>>('/api/referral/my-referrals')
    return data
  },

  async getMyReferralStats(): Promise<ApiResponse<{ stats: ReferralStats }>> {
    const { data } = await apiClient.get<ApiResponse<{ stats: ReferralStats }>>('/api/referral/stats')
    return data
  },

  async claimReward(referralId: string): Promise<ApiResponse<{ rewardType: string; rewardAmount: number }>> {
    const { data } = await apiClient.post<ApiResponse<{ rewardType: string; rewardAmount: number }>>(
      '/api/referral/claim',
      { referralId },
    )
    return data
  },

  async validateReferralCode(code: string): Promise<ApiResponse<ReferralValidation>> {
    const { data } = await apiClient.get<ApiResponse<ReferralValidation>>(`/api/referral/validate/${code}`)
    return data
  },
}
