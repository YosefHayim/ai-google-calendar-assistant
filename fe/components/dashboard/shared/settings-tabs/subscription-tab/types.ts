import type { Plan, PlanSlug } from '@/services/payment.service'

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

export const PLAN_ORDER: Record<PlanSlug, number> = {
  starter: 0,
  pro: 1,
  executive: 2,
}

export const CREDIT_PACK_SIZES: Record<PlanSlug, number> = {
  starter: 100,
  pro: 250,
  executive: 1000,
}
