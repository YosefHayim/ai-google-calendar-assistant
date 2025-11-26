import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { validateTokens, validateTokensByEmail } from "@/utils/auth/validateTokens";
import type { TokensProps } from "@/types";

// Mock Supabase
jest.mock("@/config/root-config", () => ({
  SUPABASE: {
    from: jest.fn(),
  },
}));

jest.mock("@/utils/storage", () => ({
  TOKEN_FIELDS: "access_token, refresh_token, expiry_date, refresh_token_expires_in, created_at",
}));

describe("validateTokens", () => {
  const now = Date.now();
  const oneHour = 3600 * 1000; // 1 hour in milliseconds
  const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  describe("valid tokens", () => {
    it("should return valid status when tokens are not expired", () => {
      const tokens: TokensProps & { created_at?: string } = {
        access_token: "ya29.valid_token",
        refresh_token: "1//valid_refresh_token",
        expiry_date: now + oneHour, // Expires in 1 hour
        refresh_token_expires_in: 604799, // 7 days in seconds
        created_at: new Date(now - oneDay).toISOString(), // Created 1 day ago
      };

      const result = validateTokens(tokens);

      expect(result.isValid).toBe(true);
      expect(result.requiresReAuth).toBe(false);
      expect(result.status).toBe("valid");
      expect(result.isAccessTokenExpired).toBe(false);
      expect(result.isRefreshTokenExpired).toBe(false);
      expect(result.accessTokenTimeRemaining).toBeGreaterThan(0);
      expect(result.refreshTokenTimeRemaining).toBeGreaterThan(0);
    });

    it("should account for buffer time when checking expiry", () => {
      const bufferMinutes = 5;
      const bufferMs = bufferMinutes * 60 * 1000;
      const tokens: TokensProps & { created_at?: string } = {
        access_token: "ya29.valid_token",
        refresh_token: "1//valid_refresh_token",
        expiry_date: now + bufferMs - 1000, // Expires in 4 minutes (less than buffer)
        refresh_token_expires_in: 604799,
        created_at: new Date(now - oneDay).toISOString(),
      };

      const result = validateTokens(tokens, bufferMinutes);

      expect(result.isAccessTokenExpired).toBe(true);
      expect(result.status).toBe("access_token_expired");
    });
  });

  describe("expired access token", () => {
    it("should detect expired access token but valid refresh token", () => {
      const tokens: TokensProps & { created_at?: string } = {
        access_token: "ya29.expired_token",
        refresh_token: "1//valid_refresh_token",
        expiry_date: now - oneHour, // Expired 1 hour ago
        refresh_token_expires_in: 604799, // 7 days
        created_at: new Date(now - oneDay).toISOString(), // Created 1 day ago
      };

      const result = validateTokens(tokens);

      expect(result.isValid).toBe(false);
      expect(result.requiresReAuth).toBe(false); // Can refresh
      expect(result.status).toBe("access_token_expired");
      expect(result.isAccessTokenExpired).toBe(true);
      expect(result.isRefreshTokenExpired).toBe(false);
      expect(result.message).toContain("Access token has expired");
      expect(result.message).toContain("can be refreshed");
    });
  });

  describe("expired refresh token", () => {
    it("should detect expired refresh token and require re-auth", () => {
      const tokens: TokensProps & { created_at?: string } = {
        access_token: "ya29.token",
        refresh_token: "1//expired_refresh_token",
        expiry_date: now + oneHour,
        refresh_token_expires_in: 604799, // 7 days in seconds
        created_at: new Date(now - sevenDays - oneDay).toISOString(), // Created 8 days ago (expired)
      };

      const result = validateTokens(tokens);

      expect(result.isValid).toBe(false);
      expect(result.requiresReAuth).toBe(true);
      expect(result.status).toBe("refresh_token_expired");
      expect(result.isRefreshTokenExpired).toBe(true);
      expect(result.message).toContain("Refresh token has expired");
      expect(result.message).toContain("re-authenticate");
    });

    it("should handle missing refresh_token_expires_in gracefully", () => {
      const tokens: TokensProps & { created_at?: string } = {
        access_token: "ya29.token",
        refresh_token: "1//refresh_token",
        expiry_date: now + oneHour,
        refresh_token_expires_in: null, // Missing
        created_at: new Date(now - oneDay).toISOString(),
      };

      const result = validateTokens(tokens);

      // If refresh_token_expires_in is missing, assume token is still valid
      // (Google refresh tokens can be long-lived)
      expect(result.isRefreshTokenExpired).toBe(false);
    });

    it("should handle missing created_at when refresh_token_expires_in exists", () => {
      const tokens: TokensProps & { created_at?: string } = {
        access_token: "ya29.token",
        refresh_token: "1//refresh_token",
        expiry_date: now + oneHour,
        refresh_token_expires_in: 604799,
        created_at: null, // Missing
      };

      const result = validateTokens(tokens);

      // If created_at is missing, assume expired to be safe
      expect(result.isRefreshTokenExpired).toBe(true);
      expect(result.requiresReAuth).toBe(true);
    });
  });

  describe("missing tokens", () => {
    it("should detect missing access token", () => {
      const tokens: TokensProps & { created_at?: string } = {
        access_token: null,
        refresh_token: "1//refresh_token",
        expiry_date: now + oneHour,
        refresh_token_expires_in: 604799,
        created_at: new Date(now - oneDay).toISOString(),
      };

      const result = validateTokens(tokens);

      expect(result.isValid).toBe(false);
      expect(result.requiresReAuth).toBe(true);
      expect(result.status).toBe("tokens_missing");
      expect(result.message).toContain("Tokens are missing");
    });

    it("should detect missing refresh token", () => {
      const tokens: TokensProps & { created_at?: string } = {
        access_token: "ya29.token",
        refresh_token: null,
        expiry_date: now + oneHour,
        refresh_token_expires_in: 604799,
        created_at: new Date(now - oneDay).toISOString(),
      };

      const result = validateTokens(tokens);

      expect(result.isValid).toBe(false);
      expect(result.requiresReAuth).toBe(true);
      expect(result.status).toBe("tokens_missing");
    });

    it("should detect missing expiry_date", () => {
      const tokens: TokensProps & { created_at?: string } = {
        access_token: "ya29.token",
        refresh_token: "1//refresh_token",
        expiry_date: null, // Missing
        refresh_token_expires_in: 604799,
        created_at: new Date(now - oneDay).toISOString(),
      };

      const result = validateTokens(tokens);

      expect(result.isAccessTokenExpired).toBe(true);
      expect(result.status).toBe("access_token_expired");
    });
  });

  describe("edge cases", () => {
    it("should handle tokens expiring exactly at buffer boundary", () => {
      const bufferMinutes = 5;
      const bufferMs = bufferMinutes * 60 * 1000;
      const tokens: TokensProps & { created_at?: string } = {
        access_token: "ya29.token",
        refresh_token: "1//refresh_token",
        expiry_date: now + bufferMs, // Exactly at buffer
        refresh_token_expires_in: 604799,
        created_at: new Date(now - oneDay).toISOString(),
      };

      const result = validateTokens(tokens, bufferMinutes);

      // Should be considered expired (at or past buffer)
      expect(result.isAccessTokenExpired).toBe(true);
    });

    it("should calculate time remaining correctly", () => {
      const futureExpiry = now + oneHour;
      const tokens: TokensProps & { created_at?: string } = {
        access_token: "ya29.token",
        refresh_token: "1//refresh_token",
        expiry_date: futureExpiry,
        refresh_token_expires_in: 604799,
        created_at: new Date(now - oneDay).toISOString(),
      };

      const result = validateTokens(tokens);

      expect(result.accessTokenTimeRemaining).toBeGreaterThan(0);
      expect(result.accessTokenTimeRemaining).toBeLessThan(oneHour);
      expect(result.refreshTokenTimeRemaining).toBeGreaterThan(0);
    });
  });
});

describe("validateTokensByEmail", () => {
  const { SUPABASE } = require("@/config/root-config");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should validate tokens when user exists with valid tokens", async () => {
    const now = Date.now();
    const oneHour = 3600 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;

    const mockData = {
      access_token: "ya29.valid_token",
      refresh_token: "1//valid_refresh_token",
      expiry_date: now + oneHour,
      refresh_token_expires_in: 604799,
      created_at: new Date(now - oneDay).toISOString(),
    };

    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    };

    SUPABASE.from.mockReturnValue(mockQuery);

    const result = await validateTokensByEmail("test@example.com");

    expect(SUPABASE.from).toHaveBeenCalledWith("user_calendar_tokens");
    expect(result.isValid).toBe(true);
    expect(result.requiresReAuth).toBe(false);
  });

  it("should return requiresReAuth when user not found", async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    SUPABASE.from.mockReturnValue(mockQuery);

    const result = await validateTokensByEmail("nonexistent@example.com");

    expect(result.isValid).toBe(false);
    expect(result.requiresReAuth).toBe(true);
    expect(result.status).toBe("tokens_missing");
  });

  it("should return requiresReAuth when database error occurs", async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      }),
    };

    SUPABASE.from.mockReturnValue(mockQuery);

    const result = await validateTokensByEmail("test@example.com");

    expect(result.isValid).toBe(false);
    expect(result.requiresReAuth).toBe(true);
    expect(result.status).toBe("tokens_missing");
  });

  it("should query with correct filters", async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    };

    SUPABASE.from.mockReturnValue(mockQuery);

    await validateTokensByEmail("test@example.com");

    expect(mockQuery.eq).toHaveBeenCalledWith("email", "test@example.com");
    expect(mockQuery.eq).toHaveBeenCalledWith("is_active", true);
    expect(mockQuery.order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(mockQuery.limit).toHaveBeenCalledWith(1);
  });
});

