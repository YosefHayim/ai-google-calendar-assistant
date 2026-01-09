import React, { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a test query client with disabled retries
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// All providers wrapper
interface AllProvidersProps {
  children: ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Custom render function that wraps components with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from testing-library
export * from "@testing-library/react";
export { customRender as render };

// Test data factories
export const testData = {
  user: {
    id: "test-user-id",
    email: "test@example.com",
    first_name: "Test",
    last_name: "User",
    display_name: "Test User",
    avatar_url: null,
    role: "user" as const,
    status: "active" as const,
    created_at: new Date().toISOString(),
  },
  subscription: {
    id: "sub-123",
    user_id: "test-user-id",
    plan_name: "Pro",
    plan_slug: "pro",
    status: "active" as const,
    interval: "monthly" as const,
    ai_interactions_used: 50,
    credits_remaining: 100,
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  calendar: {
    id: "cal-123",
    summary: "Test Calendar",
    description: "A test calendar",
    primary: true,
    accessRole: "owner" as const,
    backgroundColor: "#1a73e8",
    foregroundColor: "#ffffff",
  },
  event: {
    id: "event-123",
    summary: "Test Event",
    description: "A test event",
    start: {
      dateTime: new Date().toISOString(),
      timeZone: "America/New_York",
    },
    end: {
      dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      timeZone: "America/New_York",
    },
    status: "confirmed",
    creator: { email: "test@example.com" },
  },
  conversation: {
    id: "conv-123",
    title: "Test Conversation",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  message: {
    id: "msg-123",
    conversation_id: "conv-123",
    role: "user" as const,
    content: "Hello, this is a test message",
    created_at: new Date().toISOString(),
  },
};

// Mock API response helpers
export const mockApiResponse = <T,>(data: T, status = 200) => ({
  data,
  status,
  statusText: status === 200 ? "OK" : "Error",
  headers: {},
  config: {},
});

export const mockApiError = (message: string, status = 400) => {
  const error = new Error(message) as Error & { response: { status: number; data: { message: string } } };
  error.response = {
    status,
    data: { message },
  };
  return error;
};

// Wait for async updates
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));
