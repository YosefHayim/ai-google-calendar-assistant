import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock dependencies before imports
const mockSupabase = {
  from: jest.fn(),
};

const mockLemonSqueezyFns = {
  createCheckout: jest.fn(),
  getSubscription: jest.fn(),
  updateSubscription: jest.fn(),
  cancelSubscription: jest.fn(),
  getCustomer: jest.fn(),
  listCustomers: jest.fn(),
};

const mockInitializeLemonSqueezy = jest.fn();
const mockLemonSqueezyConfig = {
  TRIAL_DAYS: 7,
  MONEY_BACK_DAYS: 30,
  CHECKOUT: {
    SUCCESS_URL: "https://example.com/success",
    CANCEL_URL: "https://example.com/cancel",
  },
  METADATA_KEYS: {
    USER_ID: "user_id",
    PLAN_SLUG: "plan_slug",
    INTERVAL: "interval",
    CREDIT_PACK_SIZE: "credit_pack_size",
  },
  VARIANTS: {
    pro: { monthly: "var-pro-monthly", yearly: "var-pro-yearly" },
  },
};

jest.mock("@/config", () => ({
  SUPABASE: mockSupabase,
  env: {
    isDev: true,
    lemonSqueezy: {
      storeId: "test-store-id",
      variants: {
        pro: { monthly: "var-pro-monthly", yearly: "var-pro-yearly" },
      },
    },
  },
}));

jest.mock("@/config/clients/lemonsqueezy", () => ({
  initializeLemonSqueezy: mockInitializeLemonSqueezy,
  LEMONSQUEEZY_CONFIG: mockLemonSqueezyConfig,
}));

jest.mock("@lemonsqueezy/lemonsqueezy.js", () => mockLemonSqueezyFns);

// Import after mocks
import {
  getActivePlans,
  getPlanBySlug,
  getPlanById,
  getUserSubscription,
  getSubscriptionByLemonSqueezyId,
  checkUserAccess,
  createSubscriptionRecord,
  updateSubscriptionFromWebhook,
  cancelSubscription,
  createCheckoutSession,
  createCreditPackCheckout,
  getCustomerPortalUrl,
  isWebhookEventProcessed,
  recordWebhookEvent,
  handleOrderCreated,
  handleSubscriptionCreated,
  handleSubscriptionPaymentSuccess,
  handleSubscriptionPaymentFailed,
  recordUsage,
  processMoneyBackRefund,
  ensureFreePlan,
} from "../../services/lemonsqueezy-service";

describe("LemonSqueezy Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getActivePlans", () => {
    it("should return active plans sorted by display order", async () => {
      const mockPlans = [
        { id: "1", name: "Starter", slug: "starter", is_active: true },
        { id: "2", name: "Pro", slug: "pro", is_active: true },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockPlans, error: null }),
          }),
        }),
      });

      const plans = await getActivePlans();

      expect(plans).toEqual(mockPlans);
      expect(mockSupabase.from).toHaveBeenCalledWith("plans");
    });

    it("should throw error when fetch fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      await expect(getActivePlans()).rejects.toThrow("Failed to fetch plans: Database error");
    });

    it("should return empty array when no plans found", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const plans = await getActivePlans();
      expect(plans).toEqual([]);
    });
  });

  describe("getPlanBySlug", () => {
    it("should return plan by slug", async () => {
      const mockPlan = { id: "1", name: "Pro", slug: "pro" };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: mockPlan, error: null }),
            }),
          }),
        }),
      });

      const plan = await getPlanBySlug("pro");

      expect(plan).toEqual(mockPlan);
      expect(mockSupabase.from).toHaveBeenCalledWith("plans");
    });

    it("should return null when plan not found", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      });

      const plan = await getPlanBySlug("nonexistent" as any);
      expect(plan).toBeNull();
    });

    it("should throw error when fetch fails", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: null,
                error: { message: "Database error" },
              }),
            }),
          }),
        }),
      });

      await expect(getPlanBySlug("pro")).rejects.toThrow("Failed to fetch plan");
    });
  });

  describe("getPlanById", () => {
    it("should return plan by id", async () => {
      const mockPlan = { id: "plan-123", name: "Pro" };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: mockPlan, error: null }),
          }),
        }),
      });

      const plan = await getPlanById("plan-123");
      expect(plan).toEqual(mockPlan);
    });
  });

  describe("getUserSubscription", () => {
    it("should return active subscription for user", async () => {
      const mockSubscription = {
        id: "sub-123",
        user_id: "user-123",
        status: "active",
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: mockSubscription,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const subscription = await getUserSubscription("user-123");
      expect(subscription).toEqual(mockSubscription);
    });

    it("should return null when no active subscription", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }),
      });

      const subscription = await getUserSubscription("user-123");
      expect(subscription).toBeNull();
    });
  });

  describe("getSubscriptionByLemonSqueezyId", () => {
    it("should return subscription by LemonSqueezy ID", async () => {
      const mockSubscription = { id: "sub-123", lemonsqueezy_subscription_id: "ls-sub-123" };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
          }),
        }),
      });

      const subscription = await getSubscriptionByLemonSqueezyId("ls-sub-123");
      expect(subscription).toEqual(mockSubscription);
    });
  });

  describe("checkUserAccess", () => {
    it("should return access info for user with active subscription", async () => {
      const mockSubscription = {
        id: "sub-123",
        plan_id: "plan-123",
        status: "active",
        ai_interactions_used: 50,
        credits_remaining: 100,
        money_back_eligible_until: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const mockPlan = {
        id: "plan-123",
        name: "Pro",
        slug: "pro",
        ai_interactions_monthly: 1000,
      };

      // Mock getUserSubscription
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
                }),
              }),
            }),
          }),
        }),
      });

      // Mock credit packs query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gt: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      });

      // Mock getPlanById
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: mockPlan, error: null }),
          }),
        }),
      });

      const access = await checkUserAccess("user-123");

      expect(access.has_access).toBe(true);
      expect(access.subscription_status).toBe("active");
      expect(access.plan_name).toBe("Pro");
      expect(access.money_back_eligible).toBe(true);
    });

    it("should return no access for user without subscription and no credits", async () => {
      // Mock no subscription
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }),
      });

      // Mock no credit packs
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gt: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      });

      const access = await checkUserAccess("user-123");

      expect(access.has_access).toBe(false);
      expect(access.subscription_status).toBeNull();
      expect(access.credits_remaining).toBe(0);
    });

    it("should grant access with credits only", async () => {
      // Mock no subscription
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        }),
      });

      // Mock credit packs with remaining credits
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              gt: jest.fn().mockResolvedValue({
                data: [{ credits_remaining: 100 }, { credits_remaining: 50 }],
                error: null,
              }),
            }),
          }),
        }),
      });

      const access = await checkUserAccess("user-123");

      expect(access.has_access).toBe(true);
      expect(access.credits_remaining).toBe(150);
    });
  });

  describe("createSubscriptionRecord", () => {
    it("should create a new subscription record", async () => {
      const mockSubscription = {
        id: "new-sub-123",
        user_id: "user-123",
        plan_id: "plan-123",
        status: "trialing",
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
          }),
        }),
      });

      const subscription = await createSubscriptionRecord({
        userId: "user-123",
        planId: "plan-123",
        trialDays: 7,
      });

      expect(subscription).toEqual(mockSubscription);
      expect(mockSupabase.from).toHaveBeenCalledWith("subscriptions");
    });

    it("should create subscription without trial", async () => {
      const mockSubscription = {
        id: "new-sub-123",
        user_id: "user-123",
        plan_id: "plan-123",
        status: "active",
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockSubscription, error: null }),
          }),
        }),
      });

      const subscription = await createSubscriptionRecord({
        userId: "user-123",
        planId: "plan-123",
        status: "active",
      });

      expect(subscription.status).toBe("active");
    });

    it("should throw error when creation fails", async () => {
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: "Insert failed" },
            }),
          }),
        }),
      });

      await expect(
        createSubscriptionRecord({ userId: "user-123", planId: "plan-123" })
      ).rejects.toThrow("Failed to create subscription");
    });
  });

  describe("updateSubscriptionFromWebhook", () => {
    it("should update subscription from webhook data", async () => {
      const mockUpdatedSubscription = {
        id: "sub-123",
        status: "active",
        lemonsqueezy_subscription_id: "ls-sub-123",
      };

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: mockUpdatedSubscription,
                error: null,
              }),
            }),
          }),
        }),
      });

      const subscription = await updateSubscriptionFromWebhook({
        id: "ls-sub-123",
        customerId: "ls-cust-123",
        variantId: "ls-var-123",
        status: "active",
        trialEndsAt: null,
        renewsAt: new Date().toISOString(),
        endsAt: null,
        createdAt: new Date().toISOString(),
      });

      expect(subscription).toEqual(mockUpdatedSubscription);
    });

    it("should handle status mapping correctly", async () => {
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: { status: "canceled" },
                error: null,
              }),
            }),
          }),
        }),
      });

      await updateSubscriptionFromWebhook({
        id: "ls-sub-123",
        customerId: "ls-cust-123",
        variantId: "ls-var-123",
        status: "cancelled",  // LemonSqueezy sends "cancelled"
        trialEndsAt: null,
        renewsAt: null,
        endsAt: null,
        createdAt: new Date().toISOString(),
        cancelledAt: new Date().toISOString(),
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("subscriptions");
    });
  });

  describe("cancelSubscription", () => {
    beforeEach(() => {
      // Mock getSubscriptionByLemonSqueezyId
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: "sub-123",
                lemonsqueezy_subscription_id: "ls-sub-123",
                status: "active",
              },
              error: null,
            }),
          }),
        }),
      });
    });

    it("should cancel subscription at period end", async () => {
      mockLemonSqueezyFns.updateSubscription.mockResolvedValue({
        data: { data: { attributes: {} } },
        error: null,
      });

      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: "sub-123", status: "active", cancel_at_period_end: true },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await cancelSubscription("ls-sub-123", "Not using anymore", false);

      expect(mockInitializeLemonSqueezy).toHaveBeenCalled();
      expect(mockLemonSqueezyFns.updateSubscription).toHaveBeenCalledWith("ls-sub-123", {
        cancelled: true,
      });
      expect(result?.cancel_at_period_end).toBe(true);
    });

    it("should cancel subscription immediately", async () => {
      mockLemonSqueezyFns.cancelSubscription.mockResolvedValue({
        data: {},
        error: null,
      });

      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: { id: "sub-123", status: "canceled" },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await cancelSubscription("ls-sub-123", "Refund requested", true);

      expect(mockLemonSqueezyFns.cancelSubscription).toHaveBeenCalled();
      expect(result?.status).toBe("canceled");
    });

    it("should throw error when subscription not found", async () => {
      // Reset mock to return null
      mockSupabase.from.mockReset();
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      await expect(cancelSubscription("invalid-id")).rejects.toThrow(
        "Subscription not found or not linked to LemonSqueezy"
      );
    });
  });

  describe("createCheckoutSession", () => {
    it("should create checkout session successfully", async () => {
      const mockPlan = {
        id: "plan-123",
        name: "Pro",
        slug: "pro",
        lemonsqueezy_variant_id_monthly: "var-monthly-123",
      };

      // Mock getPlanBySlug
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: mockPlan, error: null }),
            }),
          }),
        }),
      });

      mockLemonSqueezyFns.createCheckout.mockResolvedValue({
        data: {
          data: {
            id: "checkout-123",
            attributes: { url: "https://checkout.lemonsqueezy.com/test" },
          },
        },
        error: null,
      });

      // Mock createSubscriptionRecord
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: "sub-123" },
              error: null,
            }),
          }),
        }),
      });

      const result = await createCheckoutSession({
        userId: "user-123",
        userEmail: "test@example.com",
        planSlug: "pro",
        interval: "monthly",
      });

      expect(result.url).toBe("https://checkout.lemonsqueezy.com/test");
      expect(result.id).toBe("checkout-123");
      expect(mockInitializeLemonSqueezy).toHaveBeenCalled();
    });

    it("should throw error when plan not found", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      });

      await expect(
        createCheckoutSession({
          userId: "user-123",
          userEmail: "test@example.com",
          planSlug: "nonexistent" as any,
          interval: "monthly",
        })
      ).rejects.toThrow("Plan not found");
    });

    it("should throw error when checkout creation fails", async () => {
      const mockPlan = { id: "plan-123", lemonsqueezy_variant_id_monthly: "var-123" };

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: mockPlan, error: null }),
            }),
          }),
        }),
      });

      mockLemonSqueezyFns.createCheckout.mockResolvedValue({
        data: null,
        error: { message: "API error" },
      });

      await expect(
        createCheckoutSession({
          userId: "user-123",
          userEmail: "test@example.com",
          planSlug: "pro",
          interval: "monthly",
        })
      ).rejects.toThrow("Failed to create checkout");
    });
  });

  describe("getCustomerPortalUrl", () => {
    it("should return customer portal URL", async () => {
      mockLemonSqueezyFns.getCustomer.mockResolvedValue({
        data: {
          data: {
            attributes: {
              urls: { customer_portal: "https://portal.lemonsqueezy.com/test" },
            },
          },
        },
        error: null,
      });

      const url = await getCustomerPortalUrl("cust-123");

      expect(url).toBe("https://portal.lemonsqueezy.com/test");
      expect(mockInitializeLemonSqueezy).toHaveBeenCalled();
    });

    it("should throw error when customer not found", async () => {
      mockLemonSqueezyFns.getCustomer.mockResolvedValue({
        data: null,
        error: { message: "Customer not found" },
      });

      await expect(getCustomerPortalUrl("invalid-cust")).rejects.toThrow("Failed to get customer");
    });

    it("should throw error when portal URL not available", async () => {
      mockLemonSqueezyFns.getCustomer.mockResolvedValue({
        data: { data: { attributes: { urls: {} } } },
        error: null,
      });

      await expect(getCustomerPortalUrl("cust-123")).rejects.toThrow(
        "Customer portal URL not available"
      );
    });
  });

  describe("isWebhookEventProcessed", () => {
    it("should return true for processed event", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { processed: true },
              error: null,
            }),
          }),
        }),
      });

      const isProcessed = await isWebhookEventProcessed("event-123");
      expect(isProcessed).toBe(true);
    });

    it("should return false for unprocessed event", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { processed: false },
              error: null,
            }),
          }),
        }),
      });

      const isProcessed = await isWebhookEventProcessed("event-123");
      expect(isProcessed).toBe(false);
    });

    it("should return false when event not found", async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const isProcessed = await isWebhookEventProcessed("nonexistent");
      expect(isProcessed).toBe(false);
    });
  });

  describe("recordWebhookEvent", () => {
    it("should record webhook event successfully", async () => {
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      });

      await recordWebhookEvent("event-123", "subscription_created", { data: "test" }, true);

      expect(mockSupabase.from).toHaveBeenCalledWith("lemonsqueezy_webhook_events");
    });

    it("should handle upsert errors gracefully", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      mockSupabase.from.mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ error: { message: "Upsert failed" } }),
      });

      // Should not throw
      await recordWebhookEvent("event-123", "subscription_created", { data: "test" });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("recordUsage", () => {
    it("should record usage for user with subscription", async () => {
      // Mock checkUserAccess
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({
                      data: {
                        id: "sub-123",
                        plan_id: "plan-123",
                        ai_interactions_used: 10,
                        status: "active",
                      },
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gt: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: { ai_interactions_monthly: 1000 },
                error: null,
              }),
            }),
          }),
        })
        // getUserSubscription again
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({
                      data: {
                        id: "sub-123",
                        plan_id: "plan-123",
                        ai_interactions_used: 10,
                        current_period_start: new Date().toISOString(),
                        current_period_end: new Date().toISOString(),
                      },
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: { ai_interactions_monthly: 1000 },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({ error: null }),
        });

      const result = await recordUsage("user-123", "chat_message", 1);
      expect(result).toBe(true);
    });

    it("should return false when user has no access", async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                  }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                gt: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        });

      const result = await recordUsage("user-123", "chat_message");
      expect(result).toBe(false);
    });
  });

  describe("processMoneyBackRefund", () => {
    it("should process refund when eligible", async () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: {
                  id: "sub-123",
                  lemonsqueezy_subscription_id: "ls-sub-123",
                  money_back_eligible_until: futureDate,
                },
                error: null,
              }),
            }),
          }),
        })
        // For cancelSubscription internal getSubscriptionByLemonSqueezyId
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({
                data: {
                  id: "sub-123",
                  lemonsqueezy_subscription_id: "ls-sub-123",
                },
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { id: "sub-123", status: "canceled" },
                  error: null,
                }),
              }),
            }),
          }),
        });

      mockLemonSqueezyFns.cancelSubscription.mockResolvedValue({ data: {}, error: null });

      const result = await processMoneyBackRefund("ls-sub-123", "Changed my mind");

      expect(result.success).toBe(true);
      expect(result.message).toContain("cancelled");  // The message text still uses "cancelled"
    });

    it("should reject refund when not eligible", async () => {
      const pastDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: {
                id: "sub-123",
                money_back_eligible_until: pastDate,
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await processMoneyBackRefund("ls-sub-123");

      expect(result.success).toBe(false);
      expect(result.message).toContain("expired");
    });

    it("should return error when subscription not found", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      });

      const result = await processMoneyBackRefund("invalid-id");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Subscription not found");
    });
  });

  describe("ensureFreePlan", () => {
    it("should return existing subscription if one exists", async () => {
      const existingSubscription = { id: "sub-123", status: "active" };

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: existingSubscription,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        }),
      });

      const result = await ensureFreePlan("user-123");
      expect(result).toEqual(existingSubscription);
    });

    it("should create starter plan subscription for new user", async () => {
      const starterPlan = { id: "plan-starter", slug: "starter" };
      const newSubscription = { id: "new-sub-123", plan_id: "plan-starter", status: "active" };

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                  }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({ data: starterPlan, error: null }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: newSubscription, error: null }),
            }),
          }),
        });

      const result = await ensureFreePlan("user-123");
      expect(result).toEqual(newSubscription);
    });

    it("should return null when starter plan not found", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              in: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
                  }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        });

      const result = await ensureFreePlan("user-123");
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith("Starter plan not found");

      consoleSpy.mockRestore();
    });
  });
});
