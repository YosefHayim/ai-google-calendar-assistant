import { jest } from "@jest/globals";
import type { User } from "@supabase/supabase-js";
import type { Request, Response } from "express";

// Type helper for flexible mock functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;
const mockFn = () => jest.fn<AnyFn>();

/**
 * Creates a mock Express Request object
 */
export const createMockRequest = (
  overrides: Partial<Request> = {}
): Partial<Request> & { user?: User } => ({
  headers: {},
  cookies: {},
  body: {},
  params: {},
  query: {},
  user: undefined,
  ...overrides,
});

/**
 * Creates a mock Express Response object with chainable methods
 */
export const createMockResponse = (): {
  res: Partial<Response>;
  statusMock: jest.Mock<AnyFn>;
  jsonMock: jest.Mock<AnyFn>;
  setHeaderMock: jest.Mock<AnyFn>;
  cookieMock: jest.Mock<AnyFn>;
} => {
  const jsonMock = mockFn();
  const setHeaderMock = mockFn();
  const cookieMock = mockFn();
  const statusMock = mockFn().mockReturnValue({
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
export const createMockNext = (): jest.Mock<AnyFn> => mockFn();

/**
 * Creates a mock Supabase user
 */
export const createMockUser = (overrides: Partial<User> = {}): User =>
  ({
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
  }) as User;

/**
 * Creates a mock admin user
 */
export const createMockAdminUser = (overrides: Partial<User> = {}): User =>
  createMockUser({
    id: "admin-user-id",
    email: "admin@example.com",
    ...overrides,
  });

/**
 * Mock Supabase client factory
 */
export const createMockSupabase = () => {
  const mockSingle = mockFn().mockResolvedValue({ data: null, error: null });
  const mockMaybeSingle = mockFn().mockResolvedValue({
    data: null,
    error: null,
  });
  const mockSelect = mockFn().mockReturnValue({
    eq: mockFn().mockReturnValue({
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
      in: mockFn().mockReturnValue({
        single: mockSingle,
        maybeSingle: mockMaybeSingle,
        order: mockFn().mockReturnValue({
          limit: mockFn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
          }),
        }),
      }),
      order: mockFn().mockReturnValue({
        range: mockFn().mockResolvedValue({ data: [], error: null, count: 0 }),
        limit: mockFn().mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    }),
    single: mockSingle,
    maybeSingle: mockMaybeSingle,
    or: mockFn().mockReturnValue({
      eq: mockFn().mockReturnValue({
        order: mockFn().mockReturnValue({
          range: mockFn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        }),
      }),
    }),
    order: mockFn().mockReturnValue({
      ascending: true,
    }),
  });

  const mockInsert = mockFn().mockReturnValue({
    select: mockFn().mockReturnValue({
      single: mockSingle,
    }),
  });

  const mockUpdate = mockFn().mockReturnValue({
    eq: mockFn().mockReturnValue({
      select: mockFn().mockReturnValue({
        single: mockSingle,
        maybeSingle: mockMaybeSingle,
      }),
    }),
  });

  const mockUpsert = mockFn().mockResolvedValue({ error: null });

  const mockFrom = mockFn().mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
    upsert: mockUpsert,
  });

  const mockAuth = {
    getUser: mockFn().mockResolvedValue({ data: { user: null }, error: null }),
    setSession: mockFn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    refreshSession: mockFn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    resetPasswordForEmail: mockFn().mockResolvedValue({ error: null }),
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
export const createMockLemonSqueezy = () => ({
  createCheckout: mockFn().mockResolvedValue({
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
  getSubscription: mockFn().mockResolvedValue({
    data: { data: { attributes: {} } },
    error: null,
  }),
  updateSubscription: mockFn().mockResolvedValue({
    data: { data: { attributes: {} } },
    error: null,
  }),
  cancelSubscription: mockFn().mockResolvedValue({
    data: { data: { attributes: {} } },
    error: null,
  }),
  getCustomer: mockFn().mockResolvedValue({
    data: {
      data: {
        attributes: {
          urls: { customer_portal: "https://portal.lemonsqueezy.com/test" },
        },
      },
    },
    error: null,
  }),
  listCustomers: mockFn().mockResolvedValue({
    data: { data: [] },
    error: null,
  }),
});

/**
 * Helper to wait for async operations
 */
export const flushPromises = () =>
  new Promise((resolve) => setImmediate(resolve));

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
    price_yearly_cents: 19_999,
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
    current_period_end: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    first_payment_at: new Date().toISOString(),
    money_back_eligible_until: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    cancel_at_period_end: false,
    canceled_at: null,
    cancellation_reason: null,
    ai_interactions_used: 50,
    credits_remaining: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

/**
 * Export mockFn helper for use in other test files
 */
export { mockFn, type AnyFn };
