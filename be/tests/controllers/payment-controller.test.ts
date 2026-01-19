import { randomBytes, createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { mockFn } from "../test-utils";

// Mock functions
const mockIsLemonSqueezyEnabled = mockFn();
const mockGetActivePlans = mockFn();
const mockGetUserSubscription = mockFn();
const mockCheckUserAccess = mockFn();
const mockCreateCheckoutSession = mockFn();
const mockCreateCreditPackCheckout = mockFn();
const mockGetCustomerPortalUrl = mockFn();
const mockCancelSubscription = mockFn();
const mockProcessMoneyBackRefund = mockFn();
const mockEnsureFreePlan = mockFn();
const mockIsWebhookEventProcessed = mockFn();
const mockRecordWebhookEvent = mockFn();
const mockHandleOrderCreated = mockFn();
const mockHandleSubscriptionCreated = mockFn();
const mockUpdateSubscriptionFromWebhook = mockFn();
const mockHandleSubscriptionPaymentSuccess = mockFn();
const mockHandleSubscriptionPaymentFailed = mockFn();
const mockSendR = mockFn();

jest.mock("@/config", () => ({
  STATUS_RESPONSE: {
    SUCCESS: { code: 200, success: true },
    CREATED: { code: 201, success: true },
    BAD_REQUEST: { code: 400, success: false },
    UNAUTHORIZED: { code: 401, success: false },
    NOT_FOUND: { code: 404, success: false },
    CONFLICT: { code: 409, success: false },
    INTERNAL_SERVER_ERROR: { code: 500, success: false },
    SERVICE_UNAVAILABLE: { code: 503, success: false },
  },
  env: {
    lemonSqueezy: {
      webhookSecret: "test-webhook-secret",
    },
  },
}));

jest.mock("@/config/clients/lemonsqueezy", () => ({
  isLemonSqueezyEnabled: () => mockIsLemonSqueezyEnabled(),
  LEMONSQUEEZY_CONFIG: {
    TRIAL_DAYS: 14,
    MONEY_BACK_DAYS: 30,
  },
}));

jest.mock("@/services/lemonsqueezy-service", () => ({
  getActivePlans: () => mockGetActivePlans(),
  getUserSubscription: (userId: string) => mockGetUserSubscription(userId),
  checkUserAccess: (userId: string) => mockCheckUserAccess(userId),
  createCheckoutSession: (params: unknown) =>
    mockCreateCheckoutSession(params as { url: string; id: string }),
  createCreditPackCheckout: (params: unknown) =>
    mockCreateCreditPackCheckout(params as { url: string; id: string }),
  getCustomerPortalUrl: (customerId: string) =>
    mockGetCustomerPortalUrl(customerId),
  cancelSubscription: (...args: unknown[]) => mockCancelSubscription(...args),
  processMoneyBackRefund: (...args: unknown[]) =>
    mockProcessMoneyBackRefund(...args),
  ensureFreePlan: (userId: string) => mockEnsureFreePlan(userId),
  isWebhookEventProcessed: (eventId: string) =>
    mockIsWebhookEventProcessed(eventId),
  recordWebhookEvent: (...args: unknown[]) => mockRecordWebhookEvent(...args),
  handleOrderCreated: (data: unknown) => mockHandleOrderCreated(data),
  handleSubscriptionCreated: (data: unknown) =>
    mockHandleSubscriptionCreated(data),
  updateSubscriptionFromWebhook: (data: unknown) =>
    mockUpdateSubscriptionFromWebhook(data),
  handleSubscriptionPaymentSuccess: (data: unknown) =>
    mockHandleSubscriptionPaymentSuccess(data),
  handleSubscriptionPaymentFailed: (id: string) =>
    mockHandleSubscriptionPaymentFailed(id),
}));

jest.mock("@/utils/http", () => ({
  sendR: (...args: unknown[]) => mockSendR(...args),
  reqResAsyncHandler:
    <T extends (...args: unknown[]) => Promise<unknown>>(fn: T) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next),
}));

// Import after mocks
import {
  cancelUserSubscription,
  createCreditPackCheckoutSession,
  createPortalSession,
  createSubscriptionCheckout,
  getPaymentStatus,
  getPlans,
  getSubscriptionStatus,
  handleWebhook,
  initializeFreePlan,
  requestRefund,
} from "@/controllers/payment-controller";

describe("Payment Controller", () => {
  let mockReq: Partial<Request> & { user?: any };
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      query: {},
      headers: {},
      user: {
        id: "user-123",
        email: "test@example.com",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      },
    };
    mockRes = {
      status: mockFn().mockReturnThis() as unknown as Response["status"],
      json: mockFn().mockReturnThis() as unknown as Response["json"],
    };
    mockNext = mockFn();
    mockIsLemonSqueezyEnabled.mockReturnValue(true);
  });

  describe("getPaymentStatus", () => {
    it("should return payment status", async () => {
      await getPaymentStatus(mockReq as Request, mockRes as Response, mockNext);

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Payment status",
        {
          enabled: true,
          provider: "lemonsqueezy",
          trialDays: 14,
          moneyBackDays: 30,
        }
      );
    });

    it("should return disabled status when LemonSqueezy is not enabled", async () => {
      mockIsLemonSqueezyEnabled.mockReturnValue(false);

      await getPaymentStatus(mockReq as Request, mockRes as Response, mockNext);

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Payment status",
        expect.objectContaining({ enabled: false })
      );
    });
  });

  describe("getPlans", () => {
    it("should return formatted plans", async () => {
      const mockPlans = [
        {
          id: "plan-1",
          name: "Starter",
          slug: "starter",
          description: "Basic plan",
          price_monthly_cents: 999,
          price_yearly_cents: 9999,
          price_per_use_cents: 10,
          ai_interactions_monthly: 100,
          action_pack_size: 50,
          features: ["Feature 1"],
          is_popular: true,
          is_highlighted: false,
        },
      ];
      mockGetActivePlans.mockResolvedValue(mockPlans);

      await getPlans(mockReq as Request, mockRes as Response, mockNext);

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Plans retrieved",
        {
          plans: [
            {
              id: "plan-1",
              name: "Starter",
              slug: "starter",
              description: "Basic plan",
              pricing: { monthly: 9.99, yearly: 99.99, perUse: 0.1 },
              limits: { aiInteractionsMonthly: 100, actionPackSize: 50 },
              features: ["Feature 1"],
              isPopular: true,
              isHighlighted: false,
            },
          ],
        }
      );
    });
  });

  describe("getSubscriptionStatus", () => {
    it("should return unauthorized if user not authenticated", async () => {
      mockReq.user = undefined;

      await getSubscriptionStatus(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 401 }),
        "User not authenticated"
      );
    });

    it("should return subscription status with access info", async () => {
      mockCheckUserAccess.mockResolvedValue({ hasAccess: true, tier: "pro" });
      mockGetUserSubscription.mockResolvedValue({
        id: "sub-123",
        status: "active",
        interval: "monthly",
        trial_end: null,
        current_period_end: "2024-02-01",
        cancel_at_period_end: false,
        money_back_eligible_until: "2024-02-01",
      });

      await getSubscriptionStatus(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockCheckUserAccess).toHaveBeenCalledWith("user-123");
      expect(mockGetUserSubscription).toHaveBeenCalledWith("user-123");
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Subscription status",
        expect.objectContaining({
          hasAccess: true,
          tier: "pro",
          subscription: expect.objectContaining({ id: "sub-123" }),
        })
      );
    });
  });

  describe("initializeFreePlan", () => {
    it("should return unauthorized if user not authenticated", async () => {
      mockReq.user = undefined;

      await initializeFreePlan(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 401 }),
        "User not authenticated"
      );
    });

    it("should initialize free plan successfully", async () => {
      const mockSub = { id: "sub-free", plan_id: "free" };
      mockEnsureFreePlan.mockResolvedValue(mockSub);

      await initializeFreePlan(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockEnsureFreePlan).toHaveBeenCalledWith("user-123");
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Free plan initialized",
        { subscription: mockSub }
      );
    });
  });

  describe("createSubscriptionCheckout", () => {
    it("should return unauthorized if user not authenticated", async () => {
      mockReq.user = undefined;

      await createSubscriptionCheckout(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 401 }),
        "User not authenticated"
      );
    });

    it("should return service unavailable if payment not enabled", async () => {
      mockIsLemonSqueezyEnabled.mockReturnValue(false);

      await createSubscriptionCheckout(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 503 }),
        "Payment provider is not configured"
      );
    });

    it("should return bad request for invalid plan slug", async () => {
      mockReq.body = { planSlug: "invalid", interval: "monthly" };

      await createSubscriptionCheckout(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Invalid plan slug"
      );
    });

    it("should return bad request for invalid interval", async () => {
      mockReq.body = { planSlug: "starter", interval: "weekly" };

      await createSubscriptionCheckout(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Invalid interval"
      );
    });

    it("should return conflict if user has active subscription", async () => {
      mockReq.body = { planSlug: "pro", interval: "monthly" };
      mockGetUserSubscription.mockResolvedValue({
        status: "active",
        plan_id: "starter",
      });

      await createSubscriptionCheckout(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 409 }),
        "User already has an active subscription",
        expect.any(Object)
      );
    });

    it("should create checkout session successfully", async () => {
      mockReq.body = {
        planSlug: "pro",
        interval: "monthly",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      };
      mockGetUserSubscription.mockResolvedValue(null);
      mockCreateCheckoutSession.mockResolvedValue({
        url: "https://checkout.lemonsqueezy.com/session-123",
        id: "session-123",
      });

      await createSubscriptionCheckout(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockCreateCheckoutSession).toHaveBeenCalled();
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Checkout session created",
        {
          checkoutUrl: "https://checkout.lemonsqueezy.com/session-123",
          sessionId: "session-123",
        }
      );
    });
  });

  describe("createCreditPackCheckoutSession", () => {
    it("should return bad request for invalid credits", async () => {
      mockReq.body = { credits: 50, planSlug: "starter" };

      await createCreditPackCheckoutSession(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Credits must be between 100 and 10000"
      );
    });

    it("should create credit pack checkout successfully", async () => {
      mockReq.body = {
        credits: 500,
        planSlug: "pro",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      };
      mockCreateCreditPackCheckout.mockResolvedValue({
        url: "https://checkout.lemonsqueezy.com/credit-session",
        id: "credit-session-123",
      });

      await createCreditPackCheckoutSession(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockCreateCreditPackCheckout).toHaveBeenCalled();
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Credit pack checkout created",
        expect.objectContaining({ sessionId: "credit-session-123" })
      );
    });
  });

  describe("createPortalSession", () => {
    it("should return not found if no billing info", async () => {
      mockGetUserSubscription.mockResolvedValue(null);

      await createPortalSession(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 404 }),
        "No billing information found"
      );
    });

    it("should return portal URL successfully", async () => {
      mockGetUserSubscription.mockResolvedValue({
        lemonsqueezy_customer_id: "customer-123",
      });
      mockGetCustomerPortalUrl.mockResolvedValue(
        "https://portal.lemonsqueezy.com/customer-123"
      );

      await createPortalSession(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Portal URL retrieved",
        { portalUrl: "https://portal.lemonsqueezy.com/customer-123" }
      );
    });
  });

  describe("cancelUserSubscription", () => {
    it("should return not found if no subscription", async () => {
      mockGetUserSubscription.mockResolvedValue(null);

      await cancelUserSubscription(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 404 }),
        "No active subscription found"
      );
    });

    it("should cancel subscription successfully", async () => {
      mockGetUserSubscription.mockResolvedValue({
        lemonsqueezy_subscription_id: "sub-123",
      });
      mockCancelSubscription.mockResolvedValue({
        cancel_at_period_end: true,
        current_period_end: "2024-02-01",
      });
      mockReq.body = { reason: "Too expensive", immediate: false };

      await cancelUserSubscription(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockCancelSubscription).toHaveBeenCalledWith(
        "sub-123",
        "Too expensive",
        false
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Subscription cancellation initiated",
        expect.any(Object)
      );
    });
  });

  describe("requestRefund", () => {
    it("should process refund successfully", async () => {
      mockGetUserSubscription.mockResolvedValue({
        lemonsqueezy_subscription_id: "sub-123",
      });
      mockProcessMoneyBackRefund.mockResolvedValue({
        success: true,
        message: "Refund processed",
      });
      mockReq.body = { reason: "Not satisfied" };

      await requestRefund(mockReq as Request, mockRes as Response, mockNext);

      expect(mockProcessMoneyBackRefund).toHaveBeenCalledWith(
        "sub-123",
        "Not satisfied"
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Refund processed"
      );
    });

    it("should return bad request if refund fails", async () => {
      mockGetUserSubscription.mockResolvedValue({
        lemonsqueezy_subscription_id: "sub-123",
      });
      mockProcessMoneyBackRefund.mockResolvedValue({
        success: false,
        message: "Not eligible for refund",
      });
      mockReq.body = { reason: "Not satisfied" };

      await requestRefund(mockReq as Request, mockRes as Response, mockNext);

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Not eligible for refund"
      );
    });
  });

  describe("handleWebhook", () => {
    const createSignature = (body: Buffer, secret: string): string => {
      const hmac = createHmac("sha256", secret);
      return hmac.update(body).digest("hex");
    };

    it("should return 503 if payment not enabled", async () => {
      mockIsLemonSqueezyEnabled.mockReturnValue(false);

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(503);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Payment provider is not configured",
      });
    });

    it("should return 400 if no signature provided", async () => {
      mockReq.headers = {};

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "No signature provided",
      });
    });

    it("should return 400 if signature verification fails", async () => {
      const rawBody = Buffer.from(
        JSON.stringify({ meta: { event_name: "test" }, data: { id: "1" } })
      );
      mockReq.body = rawBody;
      // Use a hex string of the same length as SHA-256 digest (64 chars)
      mockReq.headers = { "x-signature": "0".repeat(64) };

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Webhook signature verification failed",
      });
    });

    it("should return 400 for invalid JSON payload", async () => {
      const rawBody = Buffer.from("invalid json");
      const signature = createSignature(rawBody, "test-webhook-secret");
      mockReq.body = rawBody;
      mockReq.headers = { "x-signature": signature };

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid JSON payload",
      });
    });

    it("should skip duplicate events", async () => {
      const event = {
        meta: { event_name: "subscription_created" },
        data: { id: "data-123", attributes: {} },
      };
      const rawBody = Buffer.from(JSON.stringify(event));
      const signature = createSignature(rawBody, "test-webhook-secret");
      mockReq.body = rawBody;
      mockReq.headers = { "x-signature": signature };
      mockIsWebhookEventProcessed.mockResolvedValue(true);

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        received: true,
        duplicate: true,
      });
    });

    it("should process order_created event", async () => {
      const event = {
        meta: {
          event_name: "order_created",
          custom_data: { userId: "user-123" },
        },
        data: {
          id: "order-123",
          attributes: {
            customer_id: "cust-123",
            user_email: "test@example.com",
            status: "paid",
            total_formatted: "$9.99",
          },
        },
      };
      const rawBody = Buffer.from(JSON.stringify(event));
      const signature = createSignature(rawBody, "test-webhook-secret");
      mockReq.body = rawBody;
      mockReq.headers = { "x-signature": signature };
      mockIsWebhookEventProcessed.mockResolvedValue(false);
      mockRecordWebhookEvent.mockResolvedValue(undefined);
      mockHandleOrderCreated.mockResolvedValue(undefined);

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(mockHandleOrderCreated).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
    });

    it("should process subscription_created event", async () => {
      const event = {
        meta: {
          event_name: "subscription_created",
          custom_data: { userId: "user-123" },
        },
        data: {
          id: "sub-123",
          attributes: {
            customer_id: "cust-123",
            variant_id: "variant-123",
            status: "active",
            trial_ends_at: null,
            renews_at: "2024-02-01",
            ends_at: null,
            created_at: "2024-01-01",
          },
        },
      };
      const rawBody = Buffer.from(JSON.stringify(event));
      const signature = createSignature(rawBody, "test-webhook-secret");
      mockReq.body = rawBody;
      mockReq.headers = { "x-signature": signature };
      mockIsWebhookEventProcessed.mockResolvedValue(false);
      mockRecordWebhookEvent.mockResolvedValue(undefined);
      mockHandleSubscriptionCreated.mockResolvedValue(undefined);

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(mockHandleSubscriptionCreated).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should process subscription_updated event", async () => {
      const event = {
        meta: { event_name: "subscription_updated" },
        data: {
          id: "sub-123",
          attributes: {
            customer_id: "cust-123",
            variant_id: "variant-123",
            status: "cancelled",
            trial_ends_at: null,
            renews_at: null,
            ends_at: "2024-02-01",
            created_at: "2024-01-01",
            cancelled_at: "2024-01-15",
          },
        },
      };
      const rawBody = Buffer.from(JSON.stringify(event));
      const signature = createSignature(rawBody, "test-webhook-secret");
      mockReq.body = rawBody;
      mockReq.headers = { "x-signature": signature };
      mockIsWebhookEventProcessed.mockResolvedValue(false);
      mockRecordWebhookEvent.mockResolvedValue(undefined);
      mockUpdateSubscriptionFromWebhook.mockResolvedValue(undefined);

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(mockUpdateSubscriptionFromWebhook).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should process subscription_payment_success event", async () => {
      const event = {
        meta: { event_name: "subscription_payment_success" },
        data: {
          id: "sub-123",
          attributes: { renews_at: "2024-02-01" },
        },
      };
      const rawBody = Buffer.from(JSON.stringify(event));
      const signature = createSignature(rawBody, "test-webhook-secret");
      mockReq.body = rawBody;
      mockReq.headers = { "x-signature": signature };
      mockIsWebhookEventProcessed.mockResolvedValue(false);
      mockRecordWebhookEvent.mockResolvedValue(undefined);
      mockHandleSubscriptionPaymentSuccess.mockResolvedValue(undefined);

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(mockHandleSubscriptionPaymentSuccess).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should process subscription_payment_failed event", async () => {
      const event = {
        meta: { event_name: "subscription_payment_failed" },
        data: {
          id: "sub-123",
          attributes: {},
        },
      };
      const rawBody = Buffer.from(JSON.stringify(event));
      const signature = createSignature(rawBody, "test-webhook-secret");
      mockReq.body = rawBody;
      mockReq.headers = { "x-signature": signature };
      mockIsWebhookEventProcessed.mockResolvedValue(false);
      mockRecordWebhookEvent.mockResolvedValue(undefined);
      mockHandleSubscriptionPaymentFailed.mockResolvedValue(undefined);

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(mockHandleSubscriptionPaymentFailed).toHaveBeenCalledWith(
        "sub-123"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it("should handle webhook processing errors", async () => {
      const event = {
        meta: { event_name: "subscription_created", custom_data: {} },
        data: { id: "sub-123", attributes: {} },
      };
      const rawBody = Buffer.from(JSON.stringify(event));
      const signature = createSignature(rawBody, "test-webhook-secret");
      mockReq.body = rawBody;
      mockReq.headers = { "x-signature": signature };
      mockIsWebhookEventProcessed.mockResolvedValue(false);
      mockRecordWebhookEvent.mockResolvedValue(undefined);
      mockHandleSubscriptionCreated.mockRejectedValue(
        new Error("Processing failed")
      );

      await handleWebhook(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Webhook processing failed",
      });
    });
  });
});
