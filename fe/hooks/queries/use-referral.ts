'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { referralService, type ApplyReferralData } from '@/services/referral-service'
import { toast } from 'sonner'

export const referralKeys = {
  all: ['referral'] as const,
  code: () => [...referralKeys.all, 'code'] as const,
  referrals: () => [...referralKeys.all, 'list'] as const,
  stats: () => [...referralKeys.all, 'stats'] as const,
  validation: (code: string) => [...referralKeys.all, 'validation', code] as const,
}

export function useReferralCode() {
  return useQuery({
    queryKey: referralKeys.code(),
    queryFn: async () => {
      const response = await referralService.getMyReferralCode()
      return response.data
    },
  })
}

export function useMyReferrals() {
  return useQuery({
    queryKey: referralKeys.referrals(),
    queryFn: async () => {
      const response = await referralService.getMyReferrals()
      return response.data?.referrals ?? []
    },
  })
}

export function useReferralStats() {
  return useQuery({
    queryKey: referralKeys.stats(),
    queryFn: async () => {
      const response = await referralService.getMyReferralStats()
      return (
        response.data?.stats ?? {
          total_referrals: 0,
          successful_referrals: 0,
          pending_referrals: 0,
          total_rewards_earned: 0,
          total_free_months_earned: 0,
        }
      )
    },
  })
}

export function useValidateReferralCode(code: string) {
  return useQuery({
    queryKey: referralKeys.validation(code),
    queryFn: async () => {
      const response = await referralService.validateReferralCode(code)
      return response.data
    },
    enabled: !!code && code.length >= 6,
  })
}

export function useCreateReferral() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (referredEmail?: string) => {
      const response = await referralService.createReferral(referredEmail)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referralKeys.all })
      toast.success('Referral link created!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create referral')
    },
  })
}

export function useApplyReferralCode() {
  return useMutation({
    mutationFn: async (data: ApplyReferralData) => {
      const response = await referralService.applyReferralCode(data)
      return response.data
    },
    onSuccess: () => {
      toast.success("Referral code applied! You'll receive your reward after signing up.")
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to apply referral code')
    },
  })
}

export function useConvertReferral() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await referralService.convertReferral()
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referralKeys.all })
      toast.success('Referral converted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to convert referral')
    },
  })
}

export function useClaimReward() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (referralId: string) => {
      const response = await referralService.claimReward(referralId)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: referralKeys.all })
      toast.success(
        `Reward claimed! You earned ${data?.rewardAmount} ${data?.rewardType === 'free_month' ? 'free month(s)' : data?.rewardType}`,
      )
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to claim reward')
    },
  })
}
