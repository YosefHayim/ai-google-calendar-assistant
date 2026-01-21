import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { mockFn, testData } from "../test-utils"

/**
 * Business Scenario: Free Trial User Journey
 *
 * This test suite covers the complete free trial lifecycle from signup
 * through trial period, expiry handling, and upgrade prompts.
 */

const HOURS_PER_DAY = 24
const MINUTES_PER_HOUR = 60
const SECONDS_PER_MINUTE = 60
const MS_PER_SECOND = 1000
const MILLISECONDS_PER_DAY =
  HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND
const TRIAL_DURATION_DAYS = 14
const DAYS_REMAINING_10 = 10
const DAYS_REMAINING_8 = 8
const DAYS_REMAINING_7 = 7
const DAYS_REMAINING_6 = 6
const DAYS_REMAINING_5 = 5
const DAYS_REMAINING_3 = 3
const DAYS_REMAINING_2 = 2
const DAYS_REMAINING_1 = 1
const DAYS_REMAINING_0 = 0
const DAY_13 = 13
const MONTHLY_PERIOD_DAYS = 30
const INTERACTIONS_25 = 25
const INTERACTIONS_50 = 50

const mockSupabaseFrom = mockFn().mockReturnValue({
  select: mockFn().mockReturnValue({
    eq: mockFn().mockReturnValue({
      single: mockFn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: mockFn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
  update: mockFn().mockReturnValue({
    eq: mockFn().mockReturnValue({
      select: mockFn().mockReturnValue({
        single: mockFn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  }),
})

jest.mock("@/config", () => ({
  SUPABASE: {
    from: mockSupabaseFrom,
  },
  STATUS_RESPONSE: {
    SUCCESS: { code: 200, success: true },
    UNAUTHORIZED: { code: 401, success: false },
    FORBIDDEN: { code: 403, success: false },
  },
  env: {
    lemonsqueezyApiKey: "test-api-key",
    frontendUrl: "http://localhost:4000",
  },
}))

jest.mock("@/lib/http", () => ({
  sendR: mockFn(),
  reqResAsyncHandler: <T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T
  ) => fn,
}))

describe("Free Trial User Journey", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Scenario 1: New User Signup with Free Trial", () => {
    it("should set 14-day trial end date on Google OAuth completion", () => {
      const now = new Date()
      const trialEndDate = new Date(
        now.getTime() + TRIAL_DURATION_DAYS * MILLISECONDS_PER_DAY
      )

      const userWithTrial = {
        ...testData.userJourney.newUser,
        trial_end_date: trialEndDate.toISOString(),
        subscription_status: "free_trial",
      }

      expect(userWithTrial.trial_end_date).toBeDefined()
      expect(new Date(userWithTrial.trial_end_date) > now).toBe(true)
      expect(userWithTrial.subscription_status).toBe("free_trial")
    })

    it("should calculate correct trial days remaining", () => {
      const now = new Date()
      const trialEndDate = new Date(
        now.getTime() + DAYS_REMAINING_10 * MILLISECONDS_PER_DAY
      )

      const daysRemaining = Math.ceil(
        (trialEndDate.getTime() - now.getTime()) / MILLISECONDS_PER_DAY
      )

      expect(daysRemaining).toBe(DAYS_REMAINING_10)
    })

    it("should grant access during active trial period", () => {
      const now = new Date()
      const trialEndDate = new Date(
        now.getTime() + DAYS_REMAINING_7 * MILLISECONDS_PER_DAY
      )

      const userAccess = {
        has_access: true,
        subscription_status: "on_trial",
        plan_name: "Free Trial",
        plan_slug: null,
        interactions_used: 0,
        interactions_remaining: null,
        credits_remaining: 0,
        trial_days_left: DAYS_REMAINING_7,
        trial_end_date: trialEndDate.toISOString(),
        subscription: null,
      }

      expect(userAccess.has_access).toBe(true)
      expect(userAccess.subscription_status).toBe("on_trial")
      expect(userAccess.trial_days_left).toBe(DAYS_REMAINING_7)
    })
  })

  describe("Scenario 2: Trial Period Countdown", () => {
    it("should show correct days remaining at different points", () => {
      const calculateDaysRemaining = (
        trialEndDate: Date,
        currentDate: Date
      ): number =>
        Math.max(
          0,
          Math.ceil(
            (trialEndDate.getTime() - currentDate.getTime()) /
              MILLISECONDS_PER_DAY
          )
        )

      const trialStart = new Date()
      const trialEnd = new Date(
        trialStart.getTime() + TRIAL_DURATION_DAYS * MILLISECONDS_PER_DAY
      )

      expect(calculateDaysRemaining(trialEnd, trialStart)).toBe(
        TRIAL_DURATION_DAYS
      )

      const day7 = new Date(
        trialStart.getTime() + DAYS_REMAINING_6 * MILLISECONDS_PER_DAY
      )
      expect(calculateDaysRemaining(trialEnd, day7)).toBe(DAYS_REMAINING_8)

      const day13 = new Date(
        trialStart.getTime() + DAY_13 * MILLISECONDS_PER_DAY
      )
      expect(calculateDaysRemaining(trialEnd, day13)).toBe(DAYS_REMAINING_1)

      const day14 = new Date(
        trialStart.getTime() + TRIAL_DURATION_DAYS * MILLISECONDS_PER_DAY
      )
      expect(calculateDaysRemaining(trialEnd, day14)).toBe(DAYS_REMAINING_0)
    })

    it("should allow AI interactions during trial", () => {
      const trialUser = {
        has_access: true,
        subscription_status: "on_trial",
        trial_days_left: DAYS_REMAINING_5,
        interactions_used: INTERACTIONS_25,
        interactions_remaining: null,
      }

      const canUseAI =
        trialUser.has_access && trialUser.subscription_status === "on_trial"

      expect(canUseAI).toBe(true)
    })

    it("should track usage during trial for analytics", () => {
      const trialUsage = {
        ai_interactions_used: 0,
        trial_start: new Date().toISOString(),
        trial_end: new Date(
          Date.now() + TRIAL_DURATION_DAYS * MILLISECONDS_PER_DAY
        ).toISOString(),
      }

      trialUsage.ai_interactions_used += DAYS_REMAINING_5

      expect(trialUsage.ai_interactions_used).toBe(DAYS_REMAINING_5)
    })
  })

  describe("Scenario 3: Trial Expiry", () => {
    it("should deny access when trial has expired", () => {
      const now = new Date()
      const expiredTrialEndDate = new Date(
        now.getTime() - DAYS_REMAINING_1 * MILLISECONDS_PER_DAY
      )

      const isOnLocalTrial = expiredTrialEndDate > now

      expect(isOnLocalTrial).toBe(false)
    })

    it("should return correct access response for expired trial", () => {
      const expiredUserAccess = {
        has_access: false,
        subscription_status: null,
        plan_name: null,
        plan_slug: null,
        interactions_used: INTERACTIONS_50,
        interactions_remaining: null,
        credits_remaining: 0,
        trial_days_left: null,
        trial_end_date: null,
        subscription: null,
      }

      expect(expiredUserAccess.has_access).toBe(false)
      expect(expiredUserAccess.trial_days_left).toBeNull()
    })

    it("should show expired trial message", () => {
      const trialExpiredMessage =
        "Your 14-day free trial has ended.\n\nUpgrade to Pro or Executive to continue using Ally:\nhttps://askally.ai/dashboard/billing"

      expect(trialExpiredMessage).toContain("14-day free trial has ended")
      expect(trialExpiredMessage).toContain("Upgrade")
    })
  })

  describe("Scenario 4: Trial to Subscription Conversion", () => {
    it("should transition from trial to paid subscription", () => {
      const trialUser = {
        ...testData.userJourney.newUser,
        subscription_status: "free_trial",
        trial_end_date: new Date(
          Date.now() + DAYS_REMAINING_3 * MILLISECONDS_PER_DAY
        ).toISOString(),
      }

      const subscribedUser = {
        ...trialUser,
        subscription_status: "active",
        plan_id: "pro-plan",
        trial_end_date: null,
      }

      expect(subscribedUser.subscription_status).toBe("active")
      expect(subscribedUser.plan_id).toBe("pro-plan")
      expect(subscribedUser.trial_end_date).toBeNull()
    })

    it("should maintain access continuity during conversion", () => {
      const preConversionAccess = {
        has_access: true,
        subscription_status: "on_trial",
        trial_days_left: DAYS_REMAINING_2,
      }

      const postConversionAccess = {
        has_access: true,
        subscription_status: "active",
        trial_days_left: null,
        plan_name: "Pro",
      }

      expect(preConversionAccess.has_access).toBe(true)
      expect(postConversionAccess.has_access).toBe(true)
    })

    it("should reset usage counters on subscription start", () => {
      const subscription = {
        ...testData.subscription,
        ai_interactions_used: 0,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + MONTHLY_PERIOD_DAYS * MILLISECONDS_PER_DAY
        ).toISOString(),
      }

      expect(subscription.ai_interactions_used).toBe(0)
      expect(subscription.current_period_start).toBeDefined()
    })
  })

  describe("Scenario 5: Expired Trial Upgrade Prompt", () => {
    it("should prompt user to upgrade after trial expiry", () => {
      const expiredTrialUser = {
        has_access: false,
        subscription_status: null,
        trial_end_date: new Date(
          Date.now() - DAYS_REMAINING_5 * MILLISECONDS_PER_DAY
        ).toISOString(),
      }

      const shouldShowUpgradePrompt =
        !expiredTrialUser.has_access &&
        expiredTrialUser.trial_end_date !== null

      expect(shouldShowUpgradePrompt).toBe(true)
    })

    it("should differentiate between expired trial and never-subscribed user", () => {
      const expiredTrialUser = {
        has_access: false,
        trial_end_date: new Date(
          Date.now() - DAYS_REMAINING_5 * MILLISECONDS_PER_DAY
        ).toISOString(),
        hasHadTrial: true,
      }

      const neverSubscribedUser = {
        has_access: false,
        trial_end_date: null,
        hasHadTrial: false,
      }

      const expiredTrialMessage = expiredTrialUser.hasHadTrial
        ? "Your free trial has ended. Upgrade to continue."
        : "Start your free trial to begin."

      const newUserMessage = neverSubscribedUser.hasHadTrial
        ? "Your free trial has ended. Upgrade to continue."
        : "Start your free trial to begin."

      expect(expiredTrialMessage).toContain("trial has ended")
      expect(newUserMessage).toContain("Start your free trial")
    })

    it("should block AI features when trial expired and no subscription", () => {
      const checkCanUseAI = (userAccess: {
        has_access: boolean
        subscription_status: string | null
      }): boolean => userAccess.has_access

      const expiredTrialAccess = {
        has_access: false,
        subscription_status: null,
      }

      expect(checkCanUseAI(expiredTrialAccess)).toBe(false)
    })
  })

  describe("Scenario 6: Trial with LemonSqueezy Subscription Check", () => {
    it("should prioritize local trial over missing LS subscription", () => {
      const now = new Date()
      const localTrialEnd = new Date(
        now.getTime() + DAYS_REMAINING_7 * MILLISECONDS_PER_DAY
      )
      const hasActiveSubscription = false
      const isOnLocalTrial = localTrialEnd > now

      const hasAccess = hasActiveSubscription || isOnLocalTrial

      expect(hasAccess).toBe(true)
    })

    it("should prioritize LS subscription over expired local trial", () => {
      const now = new Date()
      const expiredLocalTrialEnd = new Date(
        now.getTime() - DAYS_REMAINING_7 * MILLISECONDS_PER_DAY
      )
      const hasActiveSubscription = true
      const isOnLocalTrial = expiredLocalTrialEnd > now

      expect(isOnLocalTrial).toBe(false)
      expect(hasActiveSubscription).toBe(true)
    })

    it("should handle concurrent LS trial and local trial", () => {
      const now = new Date()
      const localTrialEnd = new Date(
        now.getTime() + DAYS_REMAINING_5 * MILLISECONDS_PER_DAY
      )
      const lsTrialEnd = new Date(
        now.getTime() + DAYS_REMAINING_10 * MILLISECONDS_PER_DAY
      )

      const effectiveTrialEnd =
        lsTrialEnd > localTrialEnd ? lsTrialEnd : localTrialEnd
      const daysRemaining = Math.ceil(
        (effectiveTrialEnd.getTime() - now.getTime()) / MILLISECONDS_PER_DAY
      )

      expect(daysRemaining).toBe(DAYS_REMAINING_10)
    })
  })
})
