import { describe, expect, it, beforeEach, mock } from 'bun:test'

// Mock apiClient
const mockGet = mock(() => Promise.resolve({ data: {} }))
const mockPost = mock(() => Promise.resolve({ data: {} }))

mock.module('@/lib/api/client', () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
    defaults: { baseURL: 'https://api.example.com' },
  },
}))

mock.module('@/lib/api/endpoints', () => ({
  ENDPOINTS: {
    PAYMENTS_STATUS: '/api/payments/status',
    PAYMENTS_PLANS: '/api/payments/plans',
    PAYMENTS_SUBSCRIPTION: '/api/payments/subscription',
    PAYMENTS_INITIALIZE_FREE: '/api/payments/initialize-free',
    PAYMENTS_CHECKOUT: '/api/payments/checkout',
    PAYMENTS_CHECKOUT_CREDITS: '/api/payments/checkout/credits',
    PAYMENTS_PORTAL: '/api/payments/portal',
    PAYMENTS_CANCEL: '/api/payments/cancel',
    PAYMENTS_REFUND: '/api/payments/refund',
    PAYMENTS_UPGRADE: '/api/payments/upgrade',
    PAYMENTS_BILLING: '/api/payments/billing',
    PAYMENTS_PRODUCTS: '/api/payments/products',
    PAYMENTS_PRODUCTS_VARIANTS: '/api/payments/products/variants',
  },
}))

// Import after mocks
import {
  getPaymentStatus,
  getPlans,
  getSubscriptionStatus,
  initializeFreePlan,
  createSubscriptionCheckout,
  createCreditPackCheckout,
  createBillingPortalSession,
  cancelSubscription,
  requestRefund,
  upgradeSubscription,
  getBillingOverview,
  getLemonSqueezyProducts,
  getLemonSqueezyProductsWithVariants,
  calculateTrialDaysLeft,
  isMoneyBackEligible,
} from '@/services/payment-service'

describe('paymentService', () => {
  beforeEach(() => {
    mockGet.mockClear()
    mockPost.mockClear()
  })

  describe('getPaymentStatus', () => {
    it('should fetch payment provider status', async () => {
      const mockResponse = {
        data: {
          status: 'success',
          data: {
            enabled: true,
            provider: 'lemonsqueezy',
            trialDays: 14,
            moneyBackDays: 30,
          },
        },
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await getPaymentStatus()

      expect(mockGet).toHaveBeenCalledWith('/api/payments/status')
      expect(result.enabled).toBe(true)
      expect(result.provider).toBe('lemonsqueezy')
      expect(result.trialDays).toBe(14)
    })

    it('should throw error when no data returned', async () => {
      mockGet.mockResolvedValue({ data: { status: 'success', data: null } })

      await expect(getPaymentStatus()).rejects.toThrow('Failed to get payment status')
    })
  })

  describe('getPlans', () => {
    it('should fetch available subscription plans', async () => {
      const mockPlans = [
        {
          id: 'plan-1',
          name: 'Pro',
          slug: 'pro',
          description: 'Professional plan',
          pricing: { monthly: 9.99, yearly: 99.99, perUse: 0 },
          limits: { aiInteractionsMonthly: 1000, actionPackSize: null },
          features: ['Feature 1', 'Feature 2'],
          isPopular: true,
          isHighlighted: false,
          variantIdMonthly: 'var-1',
          variantIdYearly: 'var-2',
          buyNowUrlMonthly: 'https://buy.now/monthly',
          buyNowUrlYearly: 'https://buy.now/yearly',
          hasFreeTrial: true,
          trialDays: 14,
        },
      ]
      mockGet.mockResolvedValue({
        data: { status: 'success', data: { plans: mockPlans } },
      })

      const result = await getPlans()

      expect(mockGet).toHaveBeenCalledWith('/api/payments/plans')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Pro')
      expect(result[0].hasFreeTrial).toBe(true)
    })

    it('should return empty array when no plans', async () => {
      mockGet.mockResolvedValue({
        data: { status: 'success', data: { plans: [] } },
      })

      const result = await getPlans()

      expect(result).toEqual([])
    })
  })

  describe('getSubscriptionStatus', () => {
    it('should fetch user subscription status', async () => {
      const mockAccess = {
        has_access: true,
        subscription_status: 'active',
        plan_name: 'Pro',
        plan_slug: 'pro',
        interactions_used: 50,
        interactions_remaining: 950,
        credits_remaining: 100,
        trial_days_left: null,
        trial_end_date: null,
        money_back_eligible: true,
        subscription: {
          id: 'sub-123',
          status: 'active',
          interval: 'monthly',
          trialEnd: null,
          currentPeriodEnd: '2026-02-21',
          cancelAtPeriodEnd: false,
          moneyBackEligibleUntil: '2026-02-20',
          isLinkedToProvider: true,
        },
      }
      mockGet.mockResolvedValue({
        data: { status: 'success', data: mockAccess },
      })

      const result = await getSubscriptionStatus()

      expect(mockGet).toHaveBeenCalledWith('/api/payments/subscription')
      expect(result.has_access).toBe(true)
      expect(result.subscription_status).toBe('active')
    })

    it('should throw error when no data returned', async () => {
      mockGet.mockResolvedValue({ data: { status: 'success', data: null } })

      await expect(getSubscriptionStatus()).rejects.toThrow('Failed to get subscription status')
    })
  })

  describe('initializeFreePlan', () => {
    it('should initialize free starter plan', async () => {
      mockPost.mockResolvedValue({ data: { status: 'success' } })

      await initializeFreePlan()

      expect(mockPost).toHaveBeenCalledWith('/api/payments/initialize-free')
    })
  })

  describe('createSubscriptionCheckout', () => {
    it('should create checkout session', async () => {
      mockPost.mockResolvedValue({
        data: {
          status: 'success',
          data: {
            checkoutUrl: 'https://checkout.url/session-123',
            sessionId: 'session-123',
          },
        },
      })

      const result = await createSubscriptionCheckout({
        planSlug: 'pro',
        interval: 'monthly',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
      })

      expect(mockPost).toHaveBeenCalledWith('/api/payments/checkout', {
        planSlug: 'pro',
        interval: 'monthly',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
      })
      expect(result).toBe('https://checkout.url/session-123')
    })

    it('should throw error when no checkout URL returned', async () => {
      mockPost.mockResolvedValue({
        data: { status: 'success', data: { checkoutUrl: null } },
      })

      await expect(createSubscriptionCheckout({ planSlug: 'pro', interval: 'monthly' })).rejects.toThrow(
        'Failed to create checkout',
      )
    })
  })

  describe('createCreditPackCheckout', () => {
    it('should create credit pack checkout session', async () => {
      mockPost.mockResolvedValue({
        data: {
          status: 'success',
          data: {
            checkoutUrl: 'https://checkout.url/credits-session',
            sessionId: 'credits-session',
          },
        },
      })

      const result = await createCreditPackCheckout({
        credits: 500,
        planSlug: 'credits-500',
      })

      expect(mockPost).toHaveBeenCalledWith('/api/payments/checkout/credits', {
        credits: 500,
        planSlug: 'credits-500',
      })
      expect(result).toBe('https://checkout.url/credits-session')
    })
  })

  describe('createBillingPortalSession', () => {
    it('should create billing portal session', async () => {
      mockPost.mockResolvedValue({
        data: {
          status: 'success',
          data: { portalUrl: 'https://portal.url/session' },
        },
      })

      const result = await createBillingPortalSession('https://app.com/billing')

      expect(mockPost).toHaveBeenCalledWith('/api/payments/portal', {
        returnUrl: 'https://app.com/billing',
      })
      expect(result).toBe('https://portal.url/session')
    })

    it('should throw error when no portal URL returned', async () => {
      mockPost.mockResolvedValue({
        data: { status: 'success', data: { portalUrl: null } },
      })

      await expect(createBillingPortalSession()).rejects.toThrow('Failed to create billing portal session')
    })
  })

  describe('cancelSubscription', () => {
    it('should cancel subscription with reason', async () => {
      mockPost.mockResolvedValue({ data: { status: 'success' } })

      await cancelSubscription('Too expensive', false)

      expect(mockPost).toHaveBeenCalledWith('/api/payments/cancel', {
        reason: 'Too expensive',
        immediate: false,
      })
    })

    it('should cancel subscription immediately', async () => {
      mockPost.mockResolvedValue({ data: { status: 'success' } })

      await cancelSubscription('Switching to competitor', true)

      expect(mockPost).toHaveBeenCalledWith('/api/payments/cancel', {
        reason: 'Switching to competitor',
        immediate: true,
      })
    })
  })

  describe('requestRefund', () => {
    it('should request money-back refund', async () => {
      mockPost.mockResolvedValue({
        data: {
          status: 'success',
          data: { success: true, message: 'Refund processed' },
        },
      })

      const result = await requestRefund('Not satisfied with the product')

      expect(mockPost).toHaveBeenCalledWith('/api/payments/refund', {
        reason: 'Not satisfied with the product',
      })
      expect(result.success).toBe(true)
    })

    it('should return failure when refund denied', async () => {
      mockPost.mockResolvedValue({
        data: {
          status: 'error',
          message: 'Money-back period expired',
          data: null,
        },
      })

      const result = await requestRefund()

      expect(result.success).toBe(false)
      expect(result.message).toBe('Money-back period expired')
    })
  })

  describe('upgradeSubscription', () => {
    it('should upgrade subscription plan', async () => {
      const mockUpgradeResult = {
        subscription: {
          id: 'sub-upgraded',
          status: 'active',
          interval: 'yearly',
          planId: 'plan-enterprise',
        },
        prorated: true,
      }
      mockPost.mockResolvedValue({
        data: { status: 'success', data: mockUpgradeResult },
      })

      const result = await upgradeSubscription({
        planSlug: 'enterprise',
        interval: 'yearly',
      })

      expect(mockPost).toHaveBeenCalledWith('/api/payments/upgrade', {
        planSlug: 'enterprise',
        interval: 'yearly',
      })
      expect(result.prorated).toBe(true)
      expect(result.subscription.interval).toBe('yearly')
    })
  })

  describe('getBillingOverview', () => {
    it('should fetch billing overview with payment method and transactions', async () => {
      const mockOverview = {
        paymentMethod: {
          id: 'pm-123',
          brand: 'visa',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2027,
          isDefault: true,
        },
        transactions: [
          {
            id: 'tx-1',
            date: '2026-01-21',
            description: 'Pro subscription',
            amount: 999,
            currency: 'USD',
            status: 'succeeded',
            invoiceUrl: 'https://invoice.url/1',
          },
        ],
      }
      mockGet.mockResolvedValue({
        data: { status: 'success', data: mockOverview },
      })

      const result = await getBillingOverview()

      expect(mockGet).toHaveBeenCalledWith('/api/payments/billing')
      expect(result.paymentMethod?.brand).toBe('visa')
      expect(result.transactions).toHaveLength(1)
    })
  })

  describe('getLemonSqueezyProducts', () => {
    it('should fetch Lemon Squeezy products', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Pro Plan',
          slug: 'pro-plan',
          description: 'Professional subscription',
          price: 999,
          priceFormatted: '$9.99',
          buyNowUrl: 'https://buy.now/pro',
          status: 'published',
          testMode: false,
        },
      ]
      mockGet.mockResolvedValue({
        data: { status: 'success', data: { products: mockProducts } },
      })

      const result = await getLemonSqueezyProducts()

      expect(mockGet).toHaveBeenCalledWith('/api/payments/products')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Pro Plan')
    })
  })

  describe('getLemonSqueezyProductsWithVariants', () => {
    it('should fetch products with variants', async () => {
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Pro Plan',
          slug: 'pro-plan',
          description: 'Professional subscription',
          price: 999,
          priceFormatted: '$9.99',
          buyNowUrl: 'https://buy.now/pro',
          status: 'published',
          testMode: false,
          variants: [
            {
              id: 'var-monthly',
              name: 'Monthly',
              slug: 'monthly',
              description: null,
              price: 999,
              priceFormatted: '$9.99',
              isSubscription: true,
              interval: 'month',
              intervalCount: 1,
              hasFreeTrial: true,
              trialInterval: 'day',
              trialIntervalCount: 14,
              status: 'published',
            },
          ],
        },
      ]
      mockGet.mockResolvedValue({
        data: { status: 'success', data: { products: mockProducts } },
      })

      const result = await getLemonSqueezyProductsWithVariants()

      expect(mockGet).toHaveBeenCalledWith('/api/payments/products/variants')
      expect(result[0].variants).toHaveLength(1)
      expect(result[0].variants[0].hasFreeTrial).toBe(true)
    })
  })
})

describe('paymentService utility functions', () => {
  describe('calculateTrialDaysLeft', () => {
    it('should return null when trialEnd is null', () => {
      expect(calculateTrialDaysLeft(null)).toBeNull()
    })

    it('should return 0 when trial has ended', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString() // 1 day ago
      expect(calculateTrialDaysLeft(pastDate)).toBe(0)
    })

    it('should calculate remaining days correctly', () => {
      const futureDate = new Date(Date.now() + 7 * 86400000).toISOString() // 7 days from now
      const result = calculateTrialDaysLeft(futureDate)
      expect(result).toBeGreaterThanOrEqual(6)
      expect(result).toBeLessThanOrEqual(8)
    })
  })

  describe('isMoneyBackEligible', () => {
    it('should return false when moneyBackUntil is null', () => {
      expect(isMoneyBackEligible(null)).toBe(false)
    })

    it('should return false when money-back period has expired', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString()
      expect(isMoneyBackEligible(pastDate)).toBe(false)
    })

    it('should return true when within money-back period', () => {
      const futureDate = new Date(Date.now() + 7 * 86400000).toISOString()
      expect(isMoneyBackEligible(futureDate)).toBe(true)
    })
  })
})
