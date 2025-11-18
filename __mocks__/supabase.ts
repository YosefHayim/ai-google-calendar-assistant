import { jest } from "@jest/globals";

export const createMockSupabaseClient = () => ({
  auth: {
    getUser: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    limit: jest.fn().mockReturnThis(),
  })),
});

export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2024-01-01T00:00:00Z",
};

export const mockTokenData = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  token_type: "Bearer",
  expiry_date: Date.now() + 3600000,
  email: "test@example.com",
};
