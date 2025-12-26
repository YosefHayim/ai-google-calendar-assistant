import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import type { TokensProps } from "@/types";
// Now import
import { fetchCredentialsByEmail } from "../../utils/auth/get-user-calendar-tokens";

// Create chain mocks
const mockSingle = jest.fn();
const mockLimit = jest.fn(() => ({ single: mockSingle }));
const mockOrder = jest.fn(() => ({ limit: mockLimit }));
const mockEq = jest.fn(() => ({ order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

const mockSupabase = {
  from: mockFrom,
};

// Mock Supabase
jest.mock("@/config/root-config", () => ({
  get SUPABASE() {
    return mockSupabase;
  },
}));

// Mock storage
jest.mock("./storage", () => ({
  TOKEN_FIELDS: "access_token, refresh_token, email",
}));

describe("fetchCredentialsByEmail", () => {
  beforeEach(() => {
    mockSingle.mockClear();
    mockLimit.mockClear();
    mockOrder.mockClear();
    mockEq.mockClear();
    mockSelect.mockClear();
    mockFrom.mockClear();
  });

  describe("successful fetch", () => {
    it("should fetch credentials for valid email", async () => {
      const mockData: TokensProps = {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        email: "test@example.com",
      };

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await fetchCredentialsByEmail("test@example.com");

      expect(mockFrom).toHaveBeenCalledWith("user_calendar_tokens");
      expect(mockEq).toHaveBeenCalledWith("email", "test@example.com");
      expect(result).toEqual(mockData);
    });

    it("should trim and lowercase email", async () => {
      const mockData: TokensProps = {
        access_token: "token",
        refresh_token: "refresh",
        email: "test@example.com",
      };

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      });

      await fetchCredentialsByEmail("  TEST@EXAMPLE.COM  ");

      expect(mockEq).toHaveBeenCalledWith("email", "test@example.com");
    });

    it("should order by updated_at descending", async () => {
      const mockData: TokensProps = {
        access_token: "token",
        refresh_token: "refresh",
        email: "test@example.com",
      };

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      });

      await fetchCredentialsByEmail("test@example.com");

      expect(mockOrder).toHaveBeenCalledWith("updated_at", { ascending: false });
    });

    it("should limit to 1 result", async () => {
      const mockData: TokensProps = {
        access_token: "token",
        refresh_token: "refresh",
        email: "test@example.com",
      };

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      });

      await fetchCredentialsByEmail("test@example.com");

      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });

  describe("error handling", () => {
    it("should throw error when Supabase returns error", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(fetchCredentialsByEmail("test@example.com")).rejects.toThrow("Could not fetch credentials for test@example.com: Database error");
    });

    it("should throw error when no data found", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(fetchCredentialsByEmail("notfound@example.com")).rejects.toThrow("No credentials found for notfound@example.com");
    });

    it("should handle empty string email", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(fetchCredentialsByEmail("   ")).rejects.toThrow("No credentials found for");
      expect(mockEq).toHaveBeenCalledWith("email", "");
    });
  });

  describe("edge cases", () => {
    it("should handle email with special characters", async () => {
      const mockData: TokensProps = {
        access_token: "token",
        refresh_token: "refresh",
        email: "test+tag@example.com",
      };

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      });

      await fetchCredentialsByEmail("test+tag@example.com");

      expect(mockEq).toHaveBeenCalledWith("email", "test+tag@example.com");
    });

    it("should handle very long email", async () => {
      const longEmail = `${"a".repeat(50)}@${"b".repeat(50)}.com`;
      const mockData: TokensProps = {
        access_token: "token",
        refresh_token: "refresh",
        email: longEmail,
      };

      mockSingle.mockResolvedValue({
        data: mockData,
        error: null,
      });

      await fetchCredentialsByEmail(longEmail);

      expect(mockEq).toHaveBeenCalledWith("email", longEmail);
    });

    it("should return complete token data", async () => {
      const completeTokenData: TokensProps = {
        access_token: "access-token-123",
        refresh_token: "refresh-token-456",
        scope: "calendar.readonly",
        token_type: "Bearer",
        id_token: "id-token-789",
        expiry_date: Date.now() + 3600000,
        email: "test@example.com",
      };

      mockSingle.mockResolvedValue({
        data: completeTokenData,
        error: null,
      });

      const result = await fetchCredentialsByEmail("test@example.com");

      expect(result).toEqual(completeTokenData);
      expect(result.access_token).toBe("access-token-123");
      expect(result.refresh_token).toBe("refresh-token-456");
    });
  });
});
