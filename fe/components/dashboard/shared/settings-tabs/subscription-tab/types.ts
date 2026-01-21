import type { Plan } from '@/services/payment-service'

export type ActionType = 'upgrade' | 'downgrade' | 'current'

export interface PlanRowProps {
  plan: Plan
  selectedFrequency: string
  actionType: ActionType
  isLoading: boolean
  onAction: (customCredits?: number) => void
  isPerUse: boolean
}

export const PAYMENT_FREQUENCIES = ['monthly', 'yearly', 'per use']

export const PLAN_ORDER: Record<string, number> = {
  starter: 0,
  pro: 1,
  executive: 2,
}

export const CREDIT_PACK_SIZES: Record<string, number> = {
  starter: 100,
  pro: 250,
  executive: 1000,
}

export const getPlanOrder = (slug: string): number => {
  if (slug.includes('starter')) return 0
  if (slug.includes('pro') || slug.includes('operational')) return 1
  if (slug.includes('executive') || slug.includes('sovereignty')) return 2
  return PLAN_ORDER[slug] ?? 99
}

export const getCreditPackSize = (slug: string): number => {
  if (slug.includes('starter')) return 100
  if (slug.includes('pro') || slug.includes('operational')) return 250
  if (slug.includes('executive') || slug.includes('sovereignty')) return 1000
  return CREDIT_PACK_SIZES[slug] ?? 100
}
