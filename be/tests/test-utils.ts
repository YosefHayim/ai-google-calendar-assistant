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
    signInWithOAuth: mockFn().mockResolvedValue({
      data: { url: "https://accounts.google.com/oauth", provider: "google" },
      error: null,
    }),
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
  // Enhanced test data for comprehensive scenarios
  userJourney: {
    newUser: {
      id: "user-journey-123",
      email: "test.journey@example.com",
      first_name: "Test",
      last_name: "Journey",
      timezone: "America/New_York",
      created_at: new Date().toISOString(),
      onboarding_step: "registration",
      subscription_status: "free_trial",
    },
    proUser: {
      id: "user-pro-123",
      email: "pro.user@example.com",
      first_name: "Pro",
      last_name: "User",
      timezone: "Europe/London",
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      onboarding_completed: true,
      subscription_status: "active",
      plan_id: "pro-plan",
    },
    enterpriseUser: {
      id: "user-enterprise-123",
      email: "enterprise@example.com",
      first_name: "Enterprise",
      last_name: "User",
      timezone: "Asia/Tokyo",
      created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      onboarding_completed: true,
      subscription_status: "active",
      plan_id: "enterprise-plan",
      team_size: 25,
    },
  },
  calendarEvents: {
    simpleMeeting: {
      id: "event-simple-123",
      summary: "Team Standup",
      start: { dateTime: "2026-01-20T09:00:00-05:00", timeZone: "America/New_York" },
      end: { dateTime: "2026-01-20T09:30:00-05:00", timeZone: "America/New_York" },
      attendees: [
        { email: "organizer@example.com", displayName: "Organizer", organizer: true },
        { email: "attendee1@example.com", displayName: "Attendee 1" },
      ],
      location: "Conference Room A",
      description: "Daily standup meeting",
      status: "confirmed",
    },
    recurringMeeting: {
      id: "event-recurring-123",
      summary: "Weekly Planning",
      start: { dateTime: "2026-01-20T14:00:00Z", timeZone: "UTC" },
      end: { dateTime: "2026-01-20T15:00:00Z", timeZone: "UTC" },
      recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=10"],
      attendees: [
        { email: "team@example.com", displayName: "Team" },
      ],
      status: "confirmed",
    },
    allDayEvent: {
      id: "event-allday-123",
      summary: "Company Offsite",
      start: { date: "2026-02-15" },
      end: { date: "2026-02-16" },
      description: "Annual company offsite event",
      status: "confirmed",
    },
  },
  conversations: {
    onboarding: {
      id: "conv-onboarding-123",
      user_id: "user-journey-123",
      title: "Welcome to AI Calendar Assistant",
      platform: "web",
      messages: [
        {
          role: "user",
          content: "Hello",
          timestamp: "2026-01-20T10:00:00Z",
        },
        {
          role: "assistant",
          content: "Hello! I'm your AI calendar assistant. I can help you schedule meetings, check your availability, and manage your calendar. What would you like to do?",
          timestamp: "2026-01-20T10:00:01Z",
        },
      ],
      context: {
        pendingEvent: null,
        userPreferences: { timezone: "America/New_York" },
        onboardingStep: 1,
      },
      created_at: "2026-01-20T10:00:00Z",
      updated_at: "2026-01-20T10:00:01Z",
    },
    complexInteraction: {
      id: "conv-complex-123",
      user_id: "user-pro-123",
      title: "Schedule client presentation",
      platform: "telegram",
      messages: [
        {
          role: "user",
          content: "Schedule a presentation with the client next week",
          timestamp: "2026-01-20T14:00:00Z",
        },
        {
          role: "assistant",
          content: "I'd be happy to help you schedule a presentation. What day next week works best?",
          timestamp: "2026-01-20T14:00:01Z",
        },
        {
          role: "user",
          content: "Wednesday at 2pm",
          timestamp: "2026-01-20T14:00:05Z",
        },
        {
          role: "assistant",
          content: "Great! I've scheduled the presentation for Wednesday at 2:00 PM. Would you like me to send calendar invites to the client?",
          timestamp: "2026-01-20T14:00:06Z",
        },
      ],
      context: {
        pendingEvent: {
          summary: "Client Presentation",
          date: "2026-01-22",
          time: "14:00",
          duration: 60,
        },
        collectedInfo: {
          attendees: ["client@example.com"],
          title: "Client Presentation",
        },
      },
    },
  },
  crossPlatform: {
    webToTelegram: {
      conversationId: "conv-cross-123",
      platforms: ["web", "telegram"],
      webSession: {
        userId: "user-cross-123",
        socketId: "socket-web-123",
        lastActivity: "2026-01-20T10:00:00Z",
      },
      telegramSession: {
        chatId: 123456,
        userId: "user-cross-123",
        lastMessageId: 789,
        lastActivity: "2026-01-20T10:05:00Z",
      },
      sharedContext: {
        pendingAction: "schedule_meeting",
        collectedData: {
          date: "tomorrow",
          time: "2pm",
        },
      },
    },
  },
  errorScenarios: {
    apiFailure: {
      googleCalendarQuotaExceeded: {
        code: 403,
        message: "Calendar usage limits exceeded",
        details: { reason: "quotaExceeded" },
      },
      aiServiceOverloaded: {
        code: 503,
        message: "AI service temporarily unavailable",
        retryAfter: 300,
      },
      databaseConnectionLost: {
        code: "CONNECTION_LOST",
        message: "Database connection failed",
        retryStrategy: "exponential_backoff",
      },
    },
    userErrors: {
      invalidEmail: "Please enter a valid email address",
      weakPassword: "Password must be at least 8 characters long",
      calendarPermissionDenied: "Calendar access denied. Please check permissions.",
      eventNotFound: "The requested event could not be found",
    },
    businessLogicErrors: {
      doubleBooking: "This time slot conflicts with an existing event",
      subscriptionExpired: "Your subscription has expired. Please renew to continue.",
      rateLimitExceeded: "Too many requests. Please wait before trying again.",
    },
  },
};

/**
 * Export mockFn helper for use in other test files
 */
export { mockFn, type AnyFn };
