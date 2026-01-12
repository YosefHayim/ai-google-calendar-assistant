'use client'

import { useQuery, useQueries } from '@tanstack/react-query'
import {
  getSubscriptionStatus,
  getPlans,
  getBillingOverview,
  type UserAccess,
  type Plan,
  type BillingOverview,
} from '@/services/payment.service'
import { QUERY_CONFIG, STORAGE_KEYS } from '@/lib/constants'

const hasPreviousSession = () =>
  typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

export const billingKeys = {
  all: ['billing'] as const,
  subscriptionStatus: () => [...billingKeys.all, 'subscription-status'] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  overview: () => [...billingKeys.all, 'overview'] as const,
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
    queryFn: getPlans,
    staleTime: 5 * QUERY_CONFIG.DEFAULT_STALE_TIME,
    enabled: options?.enabled ?? hasPreviousSession(),
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
        queryFn: getPlans,
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
