import { jest } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";
import type { User } from "@supabase/supabase-js";

/**
 * Creates a mock Express Request object
 */
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  return {
    headers: {},
    cookies: {},
    body: {},
    params: {},
    query: {},
    user: undefined,
    ...overrides,
  };
};

/**
 * Creates a mock Express Response object with chainable methods
 */
export const createMockResponse = (): {
  res: Partial<Response>;
  statusMock: jest.Mock;
  jsonMock: jest.Mock;
  setHeaderMock: jest.Mock;
  cookieMock: jest.Mock;
} => {
  const jsonMock = jest.fn();
  const setHeaderMock = jest.fn();
  const cookieMock = jest.fn();
  const statusMock = jest.fn().mockReturnValue({
    json: jsonMock,
  });

  const res: Partial<Response> = {
    status: statusMock as unknown as Response["status"],
    json: jsonMock as unknown as Response["json"],
    setHeader: setHeaderMock as unknown as Response["setHeader"],
    cookie: cookieMock as unknown as Response["cookie"],
  };

  return { res, statusMock, jsonMock, setHeaderMock, cookieMock };
};

/**
 * Creates a mock NextFunction
 */
export const createMockNext = (): jest.Mock<NextFunction> => {
  return jest.fn() as unknown as jest.Mock<NextFunction>;
};

/**
 * Creates a mock Supabase user
 */
export const createMockUser = (overrides: Partial<User> = {}): User => {
  return {
    id: "test-user-id",
    email: "test@example.com",
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  } as User;
};

/**
 * Creates a mock admin user
 */
export const createMockAdminUser = (overrides: Partial<User> = {}): User => {
  return createMockUser({
    id: "admin-user-id",
    email: "admin@example.com",
    ...overrides,
  });
};

/**
 * Mock Supabase client factory
 */
export const createMockSupabase = () => {
  const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });
  const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });
  const mockSelect = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
      in: jest.fn().mockReturnValue({
        single: mockSingle,
        maybeSingle: mockMaybeSingle,
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      }),
      order: jest.fn().mockReturnValue({
        range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        limit: jest.fn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    }),
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    or: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        }),
      }),
    }),
    order: jest.fn().mockReturnValue({
      ascending: true,
    }),
  });

  const mockInsert = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      single: mockSingle,
    }),
  });

  const mockUpdate = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: mockSingle,
        maybeSingle: mockMaybeSingle,
      }),
    }),
  });

  const mockUpsert = jest.fn().mockResolvedValue({ error: null });

  const mockFrom = jest.fn().mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    upsert: mockUpsert,
  });

  const mockAuth = {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    setSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    refreshSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
  };

  return {
    from: mockFrom,
    auth: mockAuth,
    _mocks: {
      mockFrom,
      mockSelect,
      mockInsert,
      mockUpdate,
      mockSingle,
      mockMaybeSingle,
      mockUpsert,
    },
  };
};

/**
 * Mock LemonSqueezy functions
 */
export const createMockLemonSqueezy = () => {
  return {
    createCheckout: jest.fn().mockResolvedValue({
      data: {
        data: {
          id: "checkout-id",
          attributes: {
            url: "https://checkout.lemonsqueezy.com/test",
          },
        },
      },
      error: null,
    }),
    getSubscription: jest.fn().mockResolvedValue({
      data: { data: { attributes: {} } },
      error: null,
    }),
    updateSubscription: jest.fn().mockResolvedValue({
      data: { data: { attributes: {} } },
      error: null,
    }),
    cancelSubscription: jest.fn().mockResolvedValue({
      data: { data: { attributes: {} } },
      error: null,
    }),
    getCustomer: jest.fn().mockResolvedValue({
      data: {
        data: {
          attributes: {
            urls: { customer_portal: "https://portal.lemonsqueezy.com/test" },
          },
        },
      },
      error: null,
    }),
    listCustomers: jest.fn().mockResolvedValue({
      data: { data: [] },
      error: null,
    }),
  };
};

/**
 * Helper to wait for async operations
 */
export const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

/**
 * Creates test data helpers
 */
export const testData = {
  plan: {
    id: "plan-123",
    name: "Pro Plan",
    slug: "pro" as const,
    description: "Professional plan",
    lemonsqueezy_product_id: "ls-prod-123",
    lemonsqueezy_variant_id_monthly: "ls-var-monthly-123",
    lemonsqueezy_variant_id_yearly: "ls-var-yearly-123",
    price_monthly_cents: 1999,
    price_yearly_cents: 19999,
    price_per_use_cents: 5,
    ai_interactions_monthly: 1000,
    action_pack_size: null,
    features: ["Feature 1", "Feature 2"],
    is_active: true,
    is_popular: true,
    is_highlighted: false,
  },
  subscription: {
    id: "sub-123",
    user_id: "test-user-id",
    plan_id: "plan-123",
    lemonsqueezy_customer_id: "ls-cust-123",
    lemonsqueezy_subscription_id: "ls-sub-123",
    lemonsqueezy_variant_id: "ls-var-123",
    status: "active" as const,
    interval: "monthly" as const,
    trial_start: null,
    trial_end: null,
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    first_payment_at: new Date().toISOString(),
    money_back_eligible_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_at_period_end: false,
    canceled_at: null,
    cancellation_reason: null,
    ai_interactions_used: 50,
    credits_remaining: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  creditPack: {
    id: "credit-123",
    user_id: "test-user-id",
    lemonsqueezy_order_id: "ls-order-123",
    credits_purchased: 500,
    credits_remaining: 450,
    price_cents: 500,
    status: "succeeded",
    purchased_at: new Date().toISOString(),
    expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};
