import { apiClient } from '@/lib/api/client'
import { ENDPOINTS } from '@/lib/api/endpoints'

// ============================================================================
// Types
// ============================================================================

export type PlanSlug = 'starter' | 'pro' | 'executive'
export type PlanInterval = 'monthly' | 'yearly'
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'

export interface Plan {
  id: string
  name: string
  slug: PlanSlug
  description: string
  pricing: {
    monthly: number
    yearly: number
    perUse: number
  }
  limits: {
    aiInteractionsMonthly: number | null
    actionPackSize: number | null
  }
  features: string[]
  isPopular: boolean
  isHighlighted: boolean
}

export interface PaymentStatus {
  enabled: boolean
  provider: 'lemonsqueezy'
  trialDays: number
  moneyBackDays: number
}

export interface SubscriptionInfo {
  id: string
  status: SubscriptionStatus
  interval: PlanInterval
  trialEnd: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  moneyBackEligibleUntil: string | null
}

export interface UserAccess {
  has_access: boolean
  subscription_status: SubscriptionStatus | null
  plan_name: string | null
  plan_slug: string | null
  interactions_remaining: number | null
  credits_remaining: number
  trial_days_left: number | null
  money_back_eligible: boolean
  subscription: SubscriptionInfo | null
}

export interface CheckoutParams {
  planSlug: PlanSlug
  interval: PlanInterval
  successUrl?: string
  cancelUrl?: string
}

export interface CreditPackCheckoutParams {
  credits: number
  planSlug: PlanSlug
  successUrl?: string
  cancelUrl?: string
}

// ============================================================================
// API Response Types
// ============================================================================

interface ApiResponse<T> {
  status: 'success' | 'error'
  message: string
  data?: T
}

// ============================================================================
// Payment Service
// ============================================================================

/**
 * Get payment provider configuration status
 */
export const getPaymentStatus = async (): Promise<PaymentStatus> => {
  const response = await apiClient.get<ApiResponse<PaymentStatus>>(ENDPOINTS.PAYMENTS_STATUS)
  return response.data.data!
}

/**
 * Get all available subscription plans
 */
export const getPlans = async (): Promise<Plan[]> => {
  const response = await apiClient.get<ApiResponse<{ plans: Plan[] }>>(ENDPOINTS.PAYMENTS_PLANS)
  return response.data.data?.plans || []
}

/**
 * Get current user's subscription status
 */
export const getSubscriptionStatus = async (): Promise<UserAccess> => {
  const response = await apiClient.get<ApiResponse<UserAccess>>(ENDPOINTS.PAYMENTS_SUBSCRIPTION)
  return response.data.data!
}

/**
 * Initialize free starter plan for user
 */
export const initializeFreePlan = async (): Promise<void> => {
  await apiClient.post(ENDPOINTS.PAYMENTS_INITIALIZE_FREE)
}

/**
 * Create checkout session for subscription
 */
export const createSubscriptionCheckout = async (params: CheckoutParams): Promise<string> => {
  const response = await apiClient.post<ApiResponse<{ checkoutUrl: string; sessionId: string }>>(
    ENDPOINTS.PAYMENTS_CHECKOUT,
    params,
  )
  return response.data.data!.checkoutUrl
}

/**
 * Create checkout session for credit pack
 */
export const createCreditPackCheckout = async (params: CreditPackCheckoutParams): Promise<string> => {
  const response = await apiClient.post<ApiResponse<{ checkoutUrl: string; sessionId: string }>>(
    ENDPOINTS.PAYMENTS_CHECKOUT_CREDITS,
    params,
  )
  return response.data.data!.checkoutUrl
}

/**
 * Create billing portal session and redirect
 */
export const createBillingPortalSession = async (returnUrl?: string): Promise<string> => {
  const response = await apiClient.post<ApiResponse<{ portalUrl: string }>>(ENDPOINTS.PAYMENTS_PORTAL, { returnUrl })
  return response.data.data!.portalUrl
}

/**
 * Cancel subscription
 */
export const cancelSubscription = async (reason?: string, immediate = false): Promise<void> => {
  await apiClient.post(ENDPOINTS.PAYMENTS_CANCEL, { reason, immediate })
}

/**
 * Request money-back refund
 */
export const requestRefund = async (reason?: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(ENDPOINTS.PAYMENTS_REFUND, {
    reason,
  })
  return response.data.data || { success: false, message: response.data.message }
}

export interface UpgradeParams {
  planSlug: PlanSlug
  interval: PlanInterval
}

export interface UpgradeResult {
  subscription: {
    id: string
    status: SubscriptionStatus
    interval: PlanInterval
    planId: string
  }
  prorated: boolean
}

/**
 * Upgrade or downgrade subscription plan
 */
export const upgradeSubscription = async (params: UpgradeParams): Promise<UpgradeResult> => {
  const response = await apiClient.post<ApiResponse<UpgradeResult>>(ENDPOINTS.PAYMENTS_UPGRADE, params)
  return response.data.data!
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Redirect to checkout
 */
export const redirectToCheckout = async (params: CheckoutParams): Promise<void> => {
  const checkoutUrl = await createSubscriptionCheckout(params)
  window.location.href = checkoutUrl
}

/**
 * Redirect to credit pack checkout
 */
export const redirectToCreditPackCheckout = async (params: CreditPackCheckoutParams): Promise<void> => {
  const checkoutUrl = await createCreditPackCheckout(params)
  window.location.href = checkoutUrl
}

/**
 * Redirect to billing portal
 */
export const redirectToBillingPortal = async (returnUrl?: string): Promise<void> => {
  const portalUrl = await createBillingPortalSession(returnUrl)
  window.location.href = portalUrl
}

/**
 * Format price for display
 */
export const formatPrice = (cents: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * Calculate days remaining in trial
 */
export const calculateTrialDaysLeft = (trialEnd: string | null): number | null => {
  if (!trialEnd) return null
  const endDate = new Date(trialEnd)
  const now = new Date()
  const diffMs = endDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

/**
 * Check if subscription is in money-back period
 */
export const isMoneyBackEligible = (moneyBackUntil: string | null): boolean => {
  if (!moneyBackUntil) return false
  return new Date(moneyBackUntil) > new Date()
}
