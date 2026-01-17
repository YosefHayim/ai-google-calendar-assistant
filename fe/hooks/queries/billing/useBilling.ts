'use client'

import { useQuery, useQueries } from '@tanstack/react-query'
import {
  getSubscriptionStatus,
  getPlans,
  getBillingOverview,
  getLemonSqueezyProductsWithVariants,
  type UserAccess,
  type Plan,
  type BillingOverview,
  type LemonSqueezyProductWithVariants,
} from '@/services/payment.service'
import { QUERY_CONFIG, STORAGE_KEYS } from '@/lib/constants'

const hasPreviousSession = () => typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

const MINIMAL_FALLBACK_PLANS: Plan[] = []

export const billingKeys = {
  all: ['billing'] as const,
  subscriptionStatus: () => [...billingKeys.all, 'subscription-status'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  overview: () => [...billingKeys.all, 'overview'] as const,
  lemonSqueezyProducts: () => [...billingKeys.all, 'lemon-squeezy-products'] as const,
}

export function useSubscriptionStatus(options?: { enabled?: boolean }) {
  return useQuery<UserAccess>({
    queryKey: billingKeys.subscriptionStatus(),
    queryFn: getSubscriptionStatus,
    staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: options?.enabled ?? hasPreviousSession(),
  })
}

export function usePlans(options?: { enabled?: boolean }) {
  return useQuery<Plan[]>({
    queryKey: billingKeys.plans(),
    queryFn: async () => {
      const plans = await getPlans()
      return plans.length > 0 ? plans : MINIMAL_FALLBACK_PLANS
    },
    staleTime: 5 * QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: options?.enabled !== false,
  })
}

export function useBillingOverview(options?: { enabled?: boolean }) {
  return useQuery<BillingOverview>({
    queryKey: billingKeys.overview(),
    queryFn: getBillingOverview,
    staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: options?.enabled ?? hasPreviousSession(),
  })
}

export function useLemonSqueezyProducts(options?: { enabled?: boolean }) {
  return useQuery<LemonSqueezyProductWithVariants[]>({
    queryKey: billingKeys.lemonSqueezyProducts(),
    queryFn: getLemonSqueezyProductsWithVariants,
    staleTime: 10 * QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: options?.enabled !== false,
  })
}

export function useBillingData() {
  const results = useQueries({
    queries: [
      {
        queryKey: billingKeys.subscriptionStatus(),
        queryFn: getSubscriptionStatus,
        staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
        enabled: hasPreviousSession(),
      },
      {
        queryKey: billingKeys.plans(),
        queryFn: async () => {
          const plans = await getPlans()
          return plans.length > 0 ? plans : MINIMAL_FALLBACK_PLANS
        },
        staleTime: 5 * QUERY_CONFIG.DEFAULT_STALE_TIME,
        enabled: hasPreviousSession(),
      },
      {
        queryKey: billingKeys.overview(),
        queryFn: getBillingOverview,
        staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
        enabled: hasPreviousSession(),
      },
    ],
  })

  const [accessQuery, plansQuery, overviewQuery] = results

  return {
    access: accessQuery.data as UserAccess | undefined,
    plans: plansQuery.data as Plan[] | undefined,
    billingOverview: overviewQuery.data as BillingOverview | undefined,
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
    refetchAll: () => Promise.all(results.map((r) => r.refetch())),
  }
}
