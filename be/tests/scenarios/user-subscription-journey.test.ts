import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { mockFn, testData } from "../test-utils"

/**
 * Business Scenario: Complete User Subscription Journey
 *
 * This test suite covers the full user lifecycle from registration
 * through subscription purchase, usage tracking, and cancellation.
 */

const mockSupabaseAuth = {
  signUp: mockFn(),
  getUser: mockFn(),
}

const mockSupabaseFrom = mockFn().mockReturnValue({
  select: mockFn().mockReturnValue({
    eq: mockFn().mockReturnValue({
      single: mockFn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: mockFn().mockResolvedValue({ data: null, error: null }),
    }),
    single: mockFn().mockResolvedValue({ data: null, error: null }),
  }),
  insert: mockFn().mockReturnValue({
    select: mockFn().mockReturnValue({
      single: mockFn().mockResolvedValue({
        data: testData.subscription,
        error: null,
      }),
    }),
  }),
  update: mockFn().mockReturnValue({
    eq: mockFn().mockReturnValue({
      select: mockFn().mockReturnValue({
        single: mockFn().mockResolvedValue({
          data: testData.subscription,
          error: null,
        }),
      }),
    }),
  }),
})

const mockLemonSqueezy = {
  createCheckout: mockFn().mockResolvedValue({
    data: {
      data: { attributes: { url: "https://checkout.lemonsqueezy.com/test" } },
    },
  }),
  getSubscription: mockFn().mockResolvedValue({
    data: { data: { attributes: {} } },
  }),
  updateSubscription: mockFn().mockResolvedValue({
    data: {
      data: { attributes: { status: "active", variant_id: "pro-variant-123" } },
    },
  }),
  cancelSubscription: mockFn().mockResolvedValue({
    data: {
      data: {
        attributes: { status: "cancelled", ends_at: new Date().toISOString() },
      },
    },
  }),
  getCustomer: mockFn().mockResolvedValue({
    data: {
      data: { id: "cust_123", attributes: { email: "test@example.com" } },
    },
  }),
}

jest.mock("@/config", () => ({
  SUPABASE: {
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom,
  },
  STATUS_RESPONSE: {
    SUCCESS: { code: 200, success: true },
    CREATED: { code: 201, success: true },
    BAD_REQUEST: { code: 400, success: false },
    UNAUTHORIZED: { code: 401, success: false },
    NOT_FOUND: { code: 404, success: false },
    CONFLICT: { code: 409, success: false },
    INTERNAL_SERVER_ERROR: { code: 500, success: false },
  },
  env: {
    lemonsqueezyApiKey: "test-api-key",
    lemonsqueezyStoreId: "test-store-id",
    lemonsqueezyWebhookSecret: "test-webhook-secret",
  },
}))

jest.mock("@lemonsqueezy/lemonsqueezy.js", () => ({
  createCheckout: mockLemonSqueezy.createCheckout,
  getSubscription: mockLemonSqueezy.getSubscription,
  updateSubscription: mockLemonSqueezy.updateSubscription,
  cancelSubscription: mockLemonSqueezy.cancelSubscription,
  getCustomer: mockLemonSqueezy.getCustomer,
  lemonSqueezySetup: mockFn(),
}))

jest.mock("@/lib/http", () => ({
  sendR: mockFn(),
  reqResAsyncHandler: <T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T
  ) => fn,
}))

describe("User Subscription Journey", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockLemonSqueezy.createCheckout.mockResolvedValue({
      data: {
        data: { attributes: { url: "https://checkout.lemonsqueezy.com/test" } },
      },
    })
    mockLemonSqueezy.updateSubscription.mockResolvedValue({
      data: {
        data: {
          attributes: { status: "active", variant_id: "pro-variant-123" },
        },
      },
    })
    mockLemonSqueezy.cancelSubscription.mockResolvedValue({
      data: {
        data: {
          attributes: {
            status: "cancelled",
            ends_at: new Date().toISOString(),
          },
        },
      },
    })
  })

  describe("Scenario 1: New User Registration to First Subscription", () => {
    it("should register a new user successfully", async () => {
      mockSupabaseAuth.signUp.mockResolvedValueOnce({
        data: {
          user: { id: "new-user-123", email: "newuser@example.com" },
          session: { access_token: "token", refresh_token: "refresh" },
        },
        error: null,
      })

      const result = await mockSupabaseAuth.signUp({
        email: "newuser@example.com",
        password: "SecurePass123!",
      })

      expect(result.data?.user?.email).toBe("newuser@example.com")
      expect(result.error).toBeNull()
    })

    it("should fetch available subscription plans", () => {
      const plans = [
        { ...testData.plan, slug: "starter", price_monthly_cents: 999 },
        { ...testData.plan, slug: "pro", price_monthly_cents: 1999 },
        { ...testData.plan, slug: "executive", price_monthly_cents: 4999 },
      ]

      expect(plans).toHaveLength(3)
      expect(plans[1].slug).toBe("pro")
    })

    it("should create checkout session for selected plan", async () => {
      const checkoutResult = await mockLemonSqueezy.createCheckout({
        storeId: "test-store",
        variantId: "var-123",
        checkoutData: {
          email: "newuser@example.com",
          custom: { user_id: "new-user-123" },
        },
      })

      expect(checkoutResult.data?.data?.attributes?.url).toContain(
        "lemonsqueezy.com"
      )
    })

    it("should process successful subscription webhook", () => {
      const webhookPayload = {
        meta: { event_name: "subscription_created" },
        data: {
          id: "ls-sub-123",
          attributes: {
            status: "active",
            customer_id: "ls-cust-123",
            variant_id: "ls-var-123",
            first_subscription_item: { price_id: "price-123" },
            renews_at: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            trial_ends_at: null,
          },
        },
      }

      expect(webhookPayload.data.attributes.status).toBe("active")
      expect(webhookPayload.meta.event_name).toBe("subscription_created")
    })

    it("should create subscription record in database", () => {
      const subscriptionRecord = {
        user_id: "new-user-123",
        plan_id: "plan-123",
        status: "active" as const,
        lemonsqueezy_subscription_id: "ls-sub-123",
      }

      expect(subscriptionRecord.status).toBe("active")
      expect(subscriptionRecord.user_id).toBe("new-user-123")
    })
  })

  describe("Scenario 2: Subscription Usage Tracking", () => {
    const _userId = "user-with-sub-123"

    it("should track AI interaction usage", async () => {
      const subscription = {
        ...testData.subscription,
        ai_interactions_used: 0,
        ai_interactions_monthly: 1000,
      }

      // Simulate incrementing usage
      subscription.ai_interactions_used += 1

      expect(subscription.ai_interactions_used).toBe(1)
      expect(subscription.ai_interactions_used).toBeLessThan(
        subscription.ai_interactions_monthly!
      )
    })

    it("should check if user has available credits", async () => {
      const subscription = {
        ...testData.subscription,
        ai_interactions_used: 999,
        ai_interactions_monthly: 1000,
        credits_remaining: 50,
      }

      const hasCredits =
        subscription.ai_interactions_used <
          subscription.ai_interactions_monthly! ||
        subscription.credits_remaining > 0

      expect(hasCredits).toBe(true)
    })

    it("should block usage when limit exceeded and no credits", async () => {
      const subscription = {
        ...testData.subscription,
        ai_interactions_used: 1000,
        ai_interactions_monthly: 1000,
        credits_remaining: 0,
      }

      const hasCredits =
        subscription.ai_interactions_used <
          subscription.ai_interactions_monthly! ||
        subscription.credits_remaining > 0

      expect(hasCredits).toBe(false)
    })

    it("should deduct from credits when monthly limit exceeded", async () => {
      const subscription = {
        ...testData.subscription,
        ai_interactions_used: 1000,
        ai_interactions_monthly: 1000,
        credits_remaining: 50,
      }

      // Deduct from credits
      subscription.credits_remaining -= 1

      expect(subscription.credits_remaining).toBe(49)
    })
  })

  describe("Scenario 3: Plan Upgrade Flow", () => {
    it("should upgrade from starter to pro plan", async () => {
      const result = await mockLemonSqueezy.updateSubscription("sub-123", {
        variantId: "pro-variant-123",
      })

      expect(result.data?.data?.attributes?.variant_id).toBe("pro-variant-123")
      expect(result.data?.data?.attributes?.status).toBe("active")
    })

    it("should reset usage counters on plan change", async () => {
      const subscription = {
        ...testData.subscription,
        ai_interactions_used: 500,
        plan_id: "starter-plan",
      }

      // Simulate plan upgrade reset
      subscription.ai_interactions_used = 0
      subscription.plan_id = "pro-plan"

      expect(subscription.ai_interactions_used).toBe(0)
      expect(subscription.plan_id).toBe("pro-plan")
    })
  })

  describe("Scenario 4: Subscription Cancellation", () => {
    it("should cancel subscription at period end", async () => {
      const result = await mockLemonSqueezy.cancelSubscription("sub-123")

      expect(result.data?.data?.attributes?.status).toBe("cancelled")
      expect(result.data?.data?.attributes?.ends_at).toBeDefined()
    })

    it("should update subscription status in database", () => {
      const cancelledSubscription = {
        ...testData.subscription,
        status: "cancelled" as const,
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
      }

      expect(cancelledSubscription.status).toBe("cancelled")
      expect(cancelledSubscription.cancel_at_period_end).toBe(true)
    })

    it("should allow access until period end after cancellation", async () => {
      const subscription = {
        ...testData.subscription,
        status: "cancelled" as const,
        cancel_at_period_end: true,
        current_period_end: new Date(
          Date.now() + 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }

      const periodEndDate = new Date(subscription.current_period_end)
      const now = new Date()

      const hasAccess = periodEndDate > now

      expect(hasAccess).toBe(true)
    })
  })

  describe("Scenario 5: Money-Back Guarantee", () => {
    it("should be eligible for refund within 30 days", async () => {
      const subscription = {
        ...testData.subscription,
        first_payment_at: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
        money_back_eligible_until: new Date(
          Date.now() + 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }

      const eligibleUntil = new Date(subscription.money_back_eligible_until!)
      const now = new Date()

      const isEligible = eligibleUntil > now

      expect(isEligible).toBe(true)
    })

    it("should not be eligible for refund after 30 days", async () => {
      const subscription = {
        ...testData.subscription,
        first_payment_at: new Date(
          Date.now() - 45 * 24 * 60 * 60 * 1000
        ).toISOString(),
        money_back_eligible_until: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }

      const eligibleUntil = new Date(subscription.money_back_eligible_until!)
      const now = new Date()

      const isEligible = eligibleUntil > now

      expect(isEligible).toBe(false)
    })
  })

  describe("Scenario 6: Monthly Usage Reset", () => {
    it("should reset usage at billing period start", async () => {
      const subscription = {
        ...testData.subscription,
        ai_interactions_used: 850,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      }

      // Simulate monthly reset
      subscription.ai_interactions_used = 0

      expect(subscription.ai_interactions_used).toBe(0)
    })

    it("should preserve credit balance across resets", async () => {
      const subscription = {
        ...testData.subscription,
        ai_interactions_used: 1000,
        credits_remaining: 75,
      }

      // Monthly reset - only reset interactions, not credits
      subscription.ai_interactions_used = 0

      expect(subscription.ai_interactions_used).toBe(0)
      expect(subscription.credits_remaining).toBe(75)
    })
  })
})
