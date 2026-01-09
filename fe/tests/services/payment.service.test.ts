import { describe, expect, it, beforeEach, mock, afterEach } from "bun:test";

// Mock apiClient
const mockGet = mock(() => Promise.resolve({ data: {} }));
const mockPost = mock(() => Promise.resolve({ data: {} }));

mock.module("@/lib/api/client", () => ({
  apiClient: {
    get: mockGet,
    post: mockPost,
  },
}));

mock.module("@/lib/api/endpoints", () => ({
  ENDPOINTS: {
    PAYMENTS_STATUS: "/api/payments/status",
    PAYMENTS_PLANS: "/api/payments/plans",
    PAYMENTS_SUBSCRIPTION: "/api/payments/subscription",
    PAYMENTS_INITIALIZE_FREE: "/api/payments/initialize-free",
    PAYMENTS_CHECKOUT: "/api/payments/checkout",
    PAYMENTS_CHECKOUT_CREDITS: "/api/payments/checkout/credits",
    PAYMENTS_PORTAL: "/api/payments/portal",
    PAYMENTS_CANCEL: "/api/payments/cancel",
    PAYMENTS_REFUND: "/api/payments/refund",
  },
}));

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
  formatPrice,
  calculateTrialDaysLeft,
  isMoneyBackEligible,
} from "@/services/payment.service";

describe("payment.service", () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockPost.mockClear();
  });

  describe("getPaymentStatus", () => {
    it("should fetch payment status", async () => {
      const mockStatus = {
        enabled: true,
        provider: "lemonsqueezy",
        trialDays: 14,
        moneyBackDays: 30,
      };
      mockGet.mockResolvedValue({ data: { data: mockStatus } });

      const result = await getPaymentStatus();

      expect(mockGet).toHaveBeenCalledWith("/api/payments/status");
      expect(result).toEqual(mockStatus);
    });
  });

  describe("getPlans", () => {
    it("should fetch all plans", async () => {
      const mockPlans = [
        {
          id: "plan-1",
          name: "Starter",
          slug: "starter",
          pricing: { monthly: 9.99, yearly: 99.99 },
        },
        {
          id: "plan-2",
          name: "Pro",
          slug: "pro",
          pricing: { monthly: 19.99, yearly: 199.99 },
        },
      ];
      mockGet.mockResolvedValue({ data: { data: { plans: mockPlans } } });

      const result = await getPlans();

      expect(mockGet).toHaveBeenCalledWith("/api/payments/plans");
      expect(result).toEqual(mockPlans);
    });

    it("should return empty array when no plans", async () => {
      mockGet.mockResolvedValue({ data: { data: {} } });

      const result = await getPlans();

      expect(result).toEqual([]);
    });
  });

  describe("getSubscriptionStatus", () => {
    it("should fetch subscription status", async () => {
      const mockAccess = {
        has_access: true,
        subscription_status: "active",
        plan_name: "Pro",
        credits_remaining: 100,
      };
      mockGet.mockResolvedValue({ data: { data: mockAccess } });

      const result = await getSubscriptionStatus();

      expect(mockGet).toHaveBeenCalledWith("/api/payments/subscription");
      expect(result).toEqual(mockAccess);
    });
  });

  describe("initializeFreePlan", () => {
    it("should initialize free plan", async () => {
      mockPost.mockResolvedValue({ data: { status: "success" } });

      await initializeFreePlan();

      expect(mockPost).toHaveBeenCalledWith("/api/payments/initialize-free");
    });
  });

  describe("createSubscriptionCheckout", () => {
    it("should create checkout session and return URL", async () => {
      mockPost.mockResolvedValue({
        data: {
          data: {
            checkoutUrl: "https://checkout.example.com/session-123",
            sessionId: "session-123",
          },
        },
      });

      const result = await createSubscriptionCheckout({
        planSlug: "pro",
        interval: "monthly",
      });

      expect(mockPost).toHaveBeenCalledWith("/api/payments/checkout", {
        planSlug: "pro",
        interval: "monthly",
      });
      expect(result).toBe("https://checkout.example.com/session-123");
    });

    it("should include success and cancel URLs", async () => {
      mockPost.mockResolvedValue({
        data: { data: { checkoutUrl: "https://checkout.example.com" } },
      });

      await createSubscriptionCheckout({
        planSlug: "starter",
        interval: "yearly",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });

      expect(mockPost).toHaveBeenCalledWith("/api/payments/checkout", {
        planSlug: "starter",
        interval: "yearly",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });
    });
  });

  describe("createCreditPackCheckout", () => {
    it("should create credit pack checkout and return URL", async () => {
      mockPost.mockResolvedValue({
        data: { data: { checkoutUrl: "https://checkout.example.com/credits" } },
      });

      const result = await createCreditPackCheckout({
        credits: 500,
        planSlug: "pro",
      });

      expect(mockPost).toHaveBeenCalledWith("/api/payments/checkout/credits", {
        credits: 500,
        planSlug: "pro",
      });
      expect(result).toBe("https://checkout.example.com/credits");
    });
  });

  describe("createBillingPortalSession", () => {
    it("should create portal session and return URL", async () => {
      mockPost.mockResolvedValue({
        data: { data: { portalUrl: "https://portal.example.com/customer-123" } },
      });

      const result = await createBillingPortalSession();

      expect(mockPost).toHaveBeenCalledWith("/api/payments/portal", { returnUrl: undefined });
      expect(result).toBe("https://portal.example.com/customer-123");
    });

    it("should include return URL when provided", async () => {
      mockPost.mockResolvedValue({
        data: { data: { portalUrl: "https://portal.example.com" } },
      });

      await createBillingPortalSession("https://example.com/billing");

      expect(mockPost).toHaveBeenCalledWith("/api/payments/portal", {
        returnUrl: "https://example.com/billing",
      });
    });
  });

  describe("cancelSubscription", () => {
    it("should cancel subscription", async () => {
      mockPost.mockResolvedValue({ data: { status: "success" } });

      await cancelSubscription("Too expensive");

      expect(mockPost).toHaveBeenCalledWith("/api/payments/cancel", {
        reason: "Too expensive",
        immediate: false,
      });
    });

    it("should support immediate cancellation", async () => {
      mockPost.mockResolvedValue({ data: { status: "success" } });

      await cancelSubscription("Switching providers", true);

      expect(mockPost).toHaveBeenCalledWith("/api/payments/cancel", {
        reason: "Switching providers",
        immediate: true,
      });
    });
  });

  describe("requestRefund", () => {
    it("should request refund and return success", async () => {
      mockPost.mockResolvedValue({
        data: { data: { success: true, message: "Refund processed" } },
      });

      const result = await requestRefund("Not satisfied");

      expect(mockPost).toHaveBeenCalledWith("/api/payments/refund", {
        reason: "Not satisfied",
      });
      expect(result).toEqual({ success: true, message: "Refund processed" });
    });

    it("should return failure message from API", async () => {
      mockPost.mockResolvedValue({
        data: { message: "Not eligible", data: null },
      });

      const result = await requestRefund();

      expect(result).toEqual({ success: false, message: "Not eligible" });
    });
  });

  describe("formatPrice", () => {
    it("should format cents to dollars", () => {
      expect(formatPrice(999)).toBe("$9.99");
      expect(formatPrice(1000)).toBe("$10");
      expect(formatPrice(0)).toBe("$0");
    });

    it("should handle different currencies", () => {
      expect(formatPrice(999, "EUR")).toContain("9.99");
    });

    it("should format whole numbers without decimals", () => {
      expect(formatPrice(1000)).toBe("$10");
      expect(formatPrice(2000)).toBe("$20");
    });
  });

  describe("calculateTrialDaysLeft", () => {
    it("should return null for null trial end", () => {
      expect(calculateTrialDaysLeft(null)).toBeNull();
    });

    it("should return 0 for past dates", () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      expect(calculateTrialDaysLeft(pastDate)).toBe(0);
    });

    it("should calculate days remaining", () => {
      const futureDate = new Date(Date.now() + 3 * 86400000).toISOString();
      const result = calculateTrialDaysLeft(futureDate);
      expect(result).toBeGreaterThanOrEqual(2);
      expect(result).toBeLessThanOrEqual(4);
    });
  });

  describe("isMoneyBackEligible", () => {
    it("should return false for null", () => {
      expect(isMoneyBackEligible(null)).toBe(false);
    });

    it("should return false for past dates", () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      expect(isMoneyBackEligible(pastDate)).toBe(false);
    });

    it("should return true for future dates", () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      expect(isMoneyBackEligible(futureDate)).toBe(true);
    });
  });
});
