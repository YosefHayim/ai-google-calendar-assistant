import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock functions
const mockGenerateAuthUrl = jest.fn<() => string>();
const mockSetCredentials = jest.fn<() => void>();
const mockRefreshAccessToken = jest.fn<() => Promise<{ credentials: unknown }>>();
const mockFindUserWithGoogleTokens = jest.fn<() => Promise<{ data: unknown; error: string | null }>>();
const mockFindUserIdByEmail = jest.fn<() => Promise<string | null>>();
const mockUpdateGoogleTokens = jest.fn<() => Promise<void>>();
const mockDeactivateGoogleTokens = jest.fn<() => Promise<void>>();

// Create a mock OAuth2 class
class MockOAuth2 {
  setCredentials = mockSetCredentials;
  refreshAccessToken = mockRefreshAccessToken;
}

jest.mock("@/config", () => ({
  OAUTH2CLIENT: {
    generateAuthUrl: (options: unknown) => mockGenerateAuthUrl(options),
  },
  REDIRECT_URI: "https://example.com/callback",
  SCOPES: ["calendar.readonly", "calendar.events"],
  env: {
    googleClientId: "client-id",
    googleClientSecret: "client-secret",
  },
}));

jest.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: MockOAuth2,
    },
  },
}));

jest.mock("@/utils/date/timestamp-utils", () => ({
  isoToMs: (iso: string) => new Date(iso).getTime(),
}));

jest.mock("@/utils/repositories/UserRepository", () => ({
  userRepository: {
    findUserWithGoogleTokens: (email: string) => mockFindUserWithGoogleTokens(email),
    findUserIdByEmail: (email: string) => mockFindUserIdByEmail(email),
    updateGoogleTokens: (...args: unknown[]) => mockUpdateGoogleTokens(...args),
    deactivateGoogleTokens: (userId: string) => mockDeactivateGoogleTokens(userId),
  },
}));

// Import after mocks
import {
  generateGoogleAuthUrl,
  checkTokenExpiry,
  fetchGoogleTokensByEmail,
  refreshGoogleAccessToken,
  persistGoogleTokens,
  deactivateGoogleTokens,
  getUserIdByEmail,
  NEAR_EXPIRY_BUFFER_MS,
} from "@/utils/auth/google-token";

describe("Google Token Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateGoogleAuthUrl", () => {
    it("should generate auth URL without consent prompt by default", () => {
      mockGenerateAuthUrl.mockReturnValue("https://accounts.google.com/oauth?prompt=none");

      const url = generateGoogleAuthUrl();

      expect(mockGenerateAuthUrl).toHaveBeenCalledWith({
        access_type: "offline",
        scope: ["calendar.readonly", "calendar.events"],
        include_granted_scopes: true,
        redirect_uri: "https://example.com/callback",
      });
      expect(url).toBe("https://accounts.google.com/oauth?prompt=none");
    });

    it("should generate auth URL with consent prompt when forced", () => {
      mockGenerateAuthUrl.mockReturnValue("https://accounts.google.com/oauth?prompt=consent");

      const url = generateGoogleAuthUrl({ forceConsent: true });

      expect(mockGenerateAuthUrl).toHaveBeenCalledWith({
        access_type: "offline",
        scope: ["calendar.readonly", "calendar.events"],
        include_granted_scopes: true,
        redirect_uri: "https://example.com/callback",
        prompt: "consent",
      });
      expect(url).toBe("https://accounts.google.com/oauth?prompt=consent");
    });
  });

  describe("checkTokenExpiry", () => {
    it("should return expired if no expiry date", () => {
      const result = checkTokenExpiry(null);

      expect(result).toEqual({
        isExpired: true,
        isNearExpiry: true,
        expiresInMs: null,
      });
    });

    it("should return expired if undefined expiry date", () => {
      const result = checkTokenExpiry(undefined);

      expect(result).toEqual({
        isExpired: true,
        isNearExpiry: true,
        expiresInMs: null,
      });
    });

    it("should return expired for past date", () => {
      const pastDate = Date.now() - 60000; // 1 minute ago
      const result = checkTokenExpiry(pastDate);

      expect(result.isExpired).toBe(true);
      expect(result.expiresInMs).toBe(null);
    });

    it("should return near expiry for soon-to-expire token", () => {
      const nearFuture = Date.now() + 2 * 60 * 1000; // 2 minutes from now
      const result = checkTokenExpiry(nearFuture);

      expect(result.isExpired).toBe(false);
      expect(result.isNearExpiry).toBe(true);
      expect(result.expiresInMs).toBeGreaterThan(0);
      expect(result.expiresInMs).toBeLessThanOrEqual(NEAR_EXPIRY_BUFFER_MS);
    });

    it("should return not expired for valid token", () => {
      const futureDate = Date.now() + 30 * 60 * 1000; // 30 minutes from now
      const result = checkTokenExpiry(futureDate);

      expect(result.isExpired).toBe(false);
      expect(result.isNearExpiry).toBe(false);
      expect(result.expiresInMs).toBeGreaterThan(NEAR_EXPIRY_BUFFER_MS);
    });

    it("should handle ISO date string", () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
      const result = checkTokenExpiry(futureDate);

      expect(result.isExpired).toBe(false);
      expect(result.isNearExpiry).toBe(false);
    });
  });

  describe("fetchGoogleTokensByEmail", () => {
    it("should fetch tokens for email", async () => {
      const mockTokens = {
        access_token: "access-token",
        refresh_token: "refresh-token",
        expiry_date: Date.now() + 3600000,
      };
      mockFindUserWithGoogleTokens.mockResolvedValue({ data: mockTokens, error: null });

      const result = await fetchGoogleTokensByEmail("test@example.com");

      expect(mockFindUserWithGoogleTokens).toHaveBeenCalledWith("test@example.com");
      expect(result).toEqual({ data: mockTokens, error: null });
    });

    it("should return error if user not found", async () => {
      mockFindUserWithGoogleTokens.mockResolvedValue({ data: null, error: "User not found" });

      const result = await fetchGoogleTokensByEmail("notfound@example.com");

      expect(result).toEqual({ data: null, error: "User not found" });
    });
  });

  describe("refreshGoogleAccessToken", () => {
    it("should throw error if no refresh token", async () => {
      const tokens = {
        access_token: "access-token",
        refresh_token: null,
        expiry_date: Date.now(),
      };

      await expect(refreshGoogleAccessToken(tokens as any)).rejects.toThrow(
        "REAUTH_REQUIRED: No refresh token available"
      );
    });

    it("should refresh token successfully", async () => {
      const tokens = {
        access_token: "old-access-token",
        refresh_token: "refresh-token",
        expiry_date: Date.now(),
        token_type: "Bearer",
        scope: "calendar",
        id_token: "id-token",
      };
      const newExpiry = Date.now() + 3600000;
      mockRefreshAccessToken.mockResolvedValue({
        credentials: {
          access_token: "new-access-token",
          expiry_date: newExpiry,
        },
      });

      const result = await refreshGoogleAccessToken(tokens as any);

      expect(mockSetCredentials).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: "new-access-token",
        expiryDate: newExpiry,
      });
    });

    it("should throw error if no access token returned", async () => {
      const tokens = {
        access_token: "old-access-token",
        refresh_token: "refresh-token",
        expiry_date: Date.now(),
      };
      mockRefreshAccessToken.mockResolvedValue({
        credentials: { access_token: null, expiry_date: Date.now() },
      });

      await expect(refreshGoogleAccessToken(tokens as any)).rejects.toThrow(
        "No access token received from Google"
      );
    });

    it("should throw error if no expiry date returned", async () => {
      const tokens = {
        access_token: "old-access-token",
        refresh_token: "refresh-token",
        expiry_date: Date.now(),
      };
      mockRefreshAccessToken.mockResolvedValue({
        credentials: { access_token: "new-token", expiry_date: null },
      });

      await expect(refreshGoogleAccessToken(tokens as any)).rejects.toThrow(
        "No expiry date received from Google"
      );
    });

    it("should throw REAUTH_REQUIRED for invalid_grant error", async () => {
      const tokens = {
        access_token: "old-access-token",
        refresh_token: "refresh-token",
        expiry_date: Date.now(),
      };
      mockRefreshAccessToken.mockRejectedValue({
        code: "invalid_grant",
        message: "Token has been expired or revoked",
      });

      await expect(refreshGoogleAccessToken(tokens as any)).rejects.toThrow(
        "REAUTH_REQUIRED"
      );
    });

    it("should throw REAUTH_REQUIRED for token expired message", async () => {
      const tokens = {
        access_token: "old-access-token",
        refresh_token: "refresh-token",
        expiry_date: Date.now(),
      };
      mockRefreshAccessToken.mockRejectedValue({
        message: "Token has been expired or revoked",
      });

      await expect(refreshGoogleAccessToken(tokens as any)).rejects.toThrow(
        "REAUTH_REQUIRED"
      );
    });

    it("should throw TOKEN_REFRESH_FAILED for other errors", async () => {
      const tokens = {
        access_token: "old-access-token",
        refresh_token: "refresh-token",
        expiry_date: Date.now(),
      };
      mockRefreshAccessToken.mockRejectedValue({
        message: "Network error",
      });

      await expect(refreshGoogleAccessToken(tokens as any)).rejects.toThrow(
        "TOKEN_REFRESH_FAILED: Network error"
      );
    });
  });

  describe("persistGoogleTokens", () => {
    it("should persist tokens for existing user", async () => {
      mockFindUserIdByEmail.mockResolvedValue("user-123");
      mockUpdateGoogleTokens.mockResolvedValue();

      await persistGoogleTokens("test@example.com", {
        accessToken: "new-access-token",
        expiryDate: Date.now() + 3600000,
      });

      expect(mockFindUserIdByEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockUpdateGoogleTokens).toHaveBeenCalledWith(
        "user-123",
        "new-access-token",
        expect.any(Number)
      );
    });

    it("should throw error if user not found", async () => {
      mockFindUserIdByEmail.mockResolvedValue(null);

      await expect(
        persistGoogleTokens("notfound@example.com", {
          accessToken: "token",
          expiryDate: Date.now(),
        })
      ).rejects.toThrow("Failed to find user: User not found");
    });
  });

  describe("deactivateGoogleTokens", () => {
    it("should deactivate tokens for existing user", async () => {
      mockFindUserIdByEmail.mockResolvedValue("user-123");
      mockDeactivateGoogleTokens.mockResolvedValue();

      await deactivateGoogleTokens("test@example.com");

      expect(mockFindUserIdByEmail).toHaveBeenCalledWith("test@example.com");
      expect(mockDeactivateGoogleTokens).toHaveBeenCalledWith("user-123");
    });

    it("should throw error if user not found", async () => {
      mockFindUserIdByEmail.mockResolvedValue(null);

      await expect(deactivateGoogleTokens("notfound@example.com")).rejects.toThrow(
        "Failed to find user: User not found"
      );
    });
  });

  describe("getUserIdByEmail", () => {
    it("should return user ID for valid email", async () => {
      mockFindUserIdByEmail.mockResolvedValue("user-123");

      const result = await getUserIdByEmail("test@example.com");

      expect(mockFindUserIdByEmail).toHaveBeenCalledWith("test@example.com");
      expect(result).toBe("user-123");
    });

    it("should return null if user not found", async () => {
      mockFindUserIdByEmail.mockResolvedValue(null);

      const result = await getUserIdByEmail("notfound@example.com");

      expect(result).toBeNull();
    });
  });
});
