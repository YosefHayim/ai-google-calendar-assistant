import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import type { TokensProps } from "@/types";

// Create chainable mock functions
const mockLimit = jest.fn();
const mockOrder = jest.fn();
const mockEq = jest.fn();
const mockSelect = jest.fn();
const mockFrom = jest.fn();

// Set up the chain
mockFrom.mockReturnValue({ select: mockSelect });
mockSelect.mockReturnValue({ eq: mockEq });
mockEq.mockReturnValue({ order: mockOrder, eq: mockEq });
mockOrder.mockReturnValue({ limit: mockLimit });
mockLimit.mockResolvedValue({ data: [], error: null });

const mockSupabase = {
  from: mockFrom,
};

// Mock Supabase
jest.mock("@/config/root-config", () => ({
  __esModule: true,
  SUPABASE: mockSupabase,
}));

// Mock storage
jest.mock("@/utils/storage", () => ({
  __esModule: true,
  TOKEN_FIELDS: "access_token, refresh_token, email",
}));

// Now import
import { fetchCredentialsByEmail } from "@/utils/getUserCalendarTokens";

describe("fetchCredentialsByEmail", () => {
  beforeEach(() => {
    mockLimit.mockClear();
    mockOrder.mockClear();
    mockEq.mockClear();
    mockSelect.mockClear();
    mockFrom.mockClear();
    // Reset return values
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder, eq: mockEq });
    mockOrder.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue({ data: [], error: null });
  });

  describe("successful fetch", () => {
    it("should fetch credentials for valid email", async () => {
      const mockData: TokensProps & { created_at?: string } = {
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
        email: "test@example.com",
        created_at: new Date().toISOString(),
      };

      mockLimit.mockResolvedValue({
        data: [mockData],
        error: null,
      });

      const result = await fetchCredentialsByEmail("test@example.com");

      expect(mockFrom).toHaveBeenCalledWith("user_calendar_tokens");
      expect(mockEq).toHaveBeenCalledWith("email", "test@example.com");
      expect(mockEq).toHaveBeenCalledWith("is_active", true);
      expect(result).toEqual(mockData);
    });

    it("should trim and lowercase email", async () => {
      const mockData: TokensProps & { created_at?: string } = {
        access_token: "token",
        refresh_token: "refresh",
        email: "test@example.com",
        created_at: new Date().toISOString(),
      };

      mockLimit.mockResolvedValue({
        data: [mockData],
        error: null,
      });

      await fetchCredentialsByEmail("  TEST@EXAMPLE.COM  ");

      expect(mockEq).toHaveBeenCalledWith("email", "test@example.com");
    });

    it("should order by updated_at descending", async () => {
      const mockData: TokensProps & { created_at?: string } = {
        access_token: "token",
        refresh_token: "refresh",
        email: "test@example.com",
        created_at: new Date().toISOString(),
      };

      mockLimit.mockResolvedValue({
        data: [mockData],
        error: null,
      });

      await fetchCredentialsByEmail("test@example.com");

      expect(mockOrder).toHaveBeenCalledWith("updated_at", { ascending: false });
    });

    it("should limit to 1 result", async () => {
      const mockData: TokensProps & { created_at?: string } = {
        access_token: "token",
        refresh_token: "refresh",
        email: "test@example.com",
        created_at: new Date().toISOString(),
      };

      mockLimit.mockResolvedValue({
        data: [mockData],
        error: null,
      });

      await fetchCredentialsByEmail("test@example.com");

      expect(mockLimit).toHaveBeenCalledWith(1);
    });

    it("should return first result when multiple records exist (handles duplicates)", async () => {
      const mockData1: TokensProps & { created_at?: string } = {
        access_token: "new-token",
        refresh_token: "new-refresh",
        email: "test@example.com",
        created_at: new Date().toISOString(),
      };
      const mockData2: TokensProps & { created_at?: string } = {
        access_token: "old-token",
        refresh_token: "old-refresh",
        email: "test@example.com",
        created_at: new Date().toISOString(),
      };

      // Simulate multiple records (should return most recent first due to ordering)
      mockLimit.mockResolvedValue({
        data: [mockData1, mockData2],
        error: null,
      });

      const result = await fetchCredentialsByEmail("test@example.com");

      // Should return the first (most recent) record
      expect(result).toEqual(mockData1);
    });
  });

  describe("error handling", () => {
    it("should throw error when Supabase returns error", async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      await expect(
        fetchCredentialsByEmail("test@example.com"),
      ).rejects.toThrow("Could not fetch credentials for test@example.com: Database error");
    });

    it("should throw error when no data found", async () => {
      mockLimit.mockResolvedValue({
        data: [],
        error: null,
      });

      await expect(
        fetchCredentialsByEmail("notfound@example.com"),
      ).rejects.toThrow("No credentials found for notfound@example.com");
    });

    it("should throw error when data is null", async () => {
      mockLimit.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        fetchCredentialsByEmail("notfound@example.com"),
      ).rejects.toThrow("No credentials found for notfound@example.com");
    });

    it("should handle empty string email", async () => {
      mockLimit.mockResolvedValue({
        data: [],
        error: null,
      });

      await expect(fetchCredentialsByEmail("   ")).rejects.toThrow("No credentials found for");
      expect(mockEq).toHaveBeenCalledWith("email", "");
    });
  });

  describe("edge cases", () => {
    it("should handle email with special characters", async () => {
      const mockData: TokensProps & { created_at?: string } = {
        access_token: "token",
        refresh_token: "refresh",
        email: "test+tag@example.com",
        created_at: new Date().toISOString(),
      };

      mockLimit.mockResolvedValue({
        data: [mockData],
        error: null,
      });

      await fetchCredentialsByEmail("test+tag@example.com");

      expect(mockEq).toHaveBeenCalledWith("email", "test+tag@example.com");
    });

    it("should handle very long email", async () => {
      const longEmail = `${"a".repeat(50)}@${"b".repeat(50)}.com`;
      const mockData: TokensProps & { created_at?: string } = {
        access_token: "token",
        refresh_token: "refresh",
        email: longEmail,
        created_at: new Date().toISOString(),
      };

      mockLimit.mockResolvedValue({
        data: [mockData],
        error: null,
      });

      await fetchCredentialsByEmail(longEmail);

      expect(mockEq).toHaveBeenCalledWith("email", longEmail);
    });

    it("should return complete token data", async () => {
      const completeTokenData: TokensProps & { created_at?: string } = {
        access_token: "access-token-123",
        refresh_token: "refresh-token-456",
        scope: "calendar.readonly",
        token_type: "Bearer",
        id_token: "id-token-789",
        expiry_date: Date.now() + 3600000,
        email: "test@example.com",
        created_at: new Date().toISOString(),
      };

      mockLimit.mockResolvedValue({
        data: [completeTokenData],
        error: null,
      });

      const result = await fetchCredentialsByEmail("test@example.com");

      expect(result).toEqual(completeTokenData);
      expect(result.access_token).toBe("access-token-123");
      expect(result.refresh_token).toBe("refresh-token-456");
    });
  });
});
