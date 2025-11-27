import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { TokensProps, GoogleIdTokenPayloadProps } from "@/types";

// Mock the modules before importing the function under test
jest.mock("@/config/root-config", () => ({
  OAUTH2CLIENT: {
    getToken: jest.fn(),
  },
}));

jest.mock("jsonwebtoken", () => {
  const mockDecode = jest.fn();
  return {
    default: {
      decode: mockDecode,
    },
    decode: mockDecode,
  };
});

// Import after mocks are set up
import { exchangeOAuthCode } from "@/utils/auth/exchangeOAuthToken";
import { OAUTH2CLIENT } from "@/config/root-config";
import jwt from "jsonwebtoken";

describe("exchangeOAuthCode", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful Token Exchange", () => {
    it("should successfully exchange code for tokens and decode user info", async () => {
      const mockTokens: TokensProps = {
        access_token: "mock_access_token",
        refresh_token: "mock_refresh_token",
        id_token: "mock_id_token",
        scope: "openid email profile",
        token_type: "Bearer",
        expiry_date: Date.now() + 3600000,
      };

      const mockUser: GoogleIdTokenPayloadProps = {
        iss: "https://accounts.google.com",
        azp: "mock_client_id",
        aud: "mock_client_id",
        sub: "1234567890",
        email: "test@example.com",
        email_verified: true,
        at_hash: "mock_hash",
        name: "Test User",
        picture: "https://example.com/photo.jpg",
        given_name: "Test",
        family_name: "User",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens });
      (jwt.decode as jest.Mock).mockReturnValue(mockUser);

      const result = await exchangeOAuthCode("valid_auth_code");

      expect(OAUTH2CLIENT.getToken).toHaveBeenCalledWith("valid_auth_code");
      expect(OAUTH2CLIENT.getToken).toHaveBeenCalledTimes(1);
      expect(jwt.decode).toHaveBeenCalledWith("mock_id_token");
      expect(jwt.decode).toHaveBeenCalledTimes(1);
      expect(result.tokens).toEqual(mockTokens);
      expect(result.user).toEqual(mockUser);
    });

    it("should handle tokens without optional fields", async () => {
      const mockTokens: TokensProps = {
        access_token: "mock_access_token",
        id_token: "mock_id_token",
        token_type: "Bearer",
      };

      const mockUser: GoogleIdTokenPayloadProps = {
        iss: "https://accounts.google.com",
        azp: "mock_client_id",
        aud: "mock_client_id",
        sub: "1234567890",
        email: "test@example.com",
        email_verified: true,
        name: "Test User",
        picture: "https://example.com/photo.jpg",
        given_name: "Test",
        family_name: "User",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens });
      (jwt.decode as jest.Mock).mockReturnValue(mockUser);

      const result = await exchangeOAuthCode("valid_code");

      expect(result.tokens.access_token).toBe("mock_access_token");
      expect(result.tokens.refresh_token).toBeUndefined();
      expect(result.tokens.scope).toBeUndefined();
      expect(result.user.email).toBe("test@example.com");
    });

    it("should decode id_token when present", async () => {
      const mockTokens: TokensProps = {
        access_token: "access",
        id_token: "encoded.jwt.token",
      };

      const mockUser: GoogleIdTokenPayloadProps = {
        iss: "https://accounts.google.com",
        azp: "client_id",
        aud: "client_id",
        sub: "user_id",
        email: "user@example.com",
        email_verified: true,
        name: "User Name",
        picture: "https://example.com/pic.jpg",
        given_name: "User",
        family_name: "Name",
        iat: 1234567890,
        exp: 1234571490,
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens } as any);
      (jwt.decode as jest.Mock).mockReturnValue(mockUser as any);

      const result = await exchangeOAuthCode("code");

      expect((jwt.decode as jest.Mock)).toHaveBeenCalledWith("encoded.jwt.token");
      expect(result.user).toEqual(mockUser);
    });
  });

  describe("Error Handling", () => {
    it("should throw error when OAuth provider returns error", async () => {
      const mockError = new Error("Invalid authorization code");
      (OAUTH2CLIENT.getToken as jest.Mock).mockRejectedValue(mockError);

      await expect(exchangeOAuthCode("invalid_code")).rejects.toThrow(
        "Invalid authorization code",
      );
      expect((OAUTH2CLIENT.getToken as jest.Mock)).toHaveBeenCalledWith("invalid_code");
    });

    it("should throw error when network request fails", async () => {
      const networkError = new Error("Network request failed");
      (OAUTH2CLIENT.getToken as jest.Mock).mockRejectedValue(networkError);

      await expect(exchangeOAuthCode("valid_code")).rejects.toThrow(
        "Network request failed",
      );
    });

    it("should throw error when OAuth provider times out", async () => {
      const timeoutError = new Error("Request timeout");
      (OAUTH2CLIENT.getToken as jest.Mock).mockRejectedValue(timeoutError);

      await expect(exchangeOAuthCode("valid_code")).rejects.toThrow(
        "Request timeout",
      );
    });

    it("should throw error for expired authorization code", async () => {
      const expiredError = new Error("Authorization code has expired");
      (OAUTH2CLIENT.getToken as jest.Mock).mockRejectedValue(expiredError);

      await expect(exchangeOAuthCode("expired_code")).rejects.toThrow(
        "Authorization code has expired",
      );
    });

    it("should throw error for already-used authorization code", async () => {
      const usedError = new Error("Authorization code already used");
      (OAUTH2CLIENT.getToken as jest.Mock).mockRejectedValue(usedError);

      await expect(exchangeOAuthCode("used_code")).rejects.toThrow(
        "Authorization code already used",
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty id_token", async () => {
      const mockTokens: TokensProps = {
        access_token: "access_token",
        id_token: null,
      };

      const mockUser: GoogleIdTokenPayloadProps = {
        iss: "",
        azp: "",
        aud: "",
        sub: "",
        email: "",
        email_verified: false,
        name: "",
        picture: "",
        given_name: "",
        family_name: "",
        iat: 0,
        exp: 0,
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens } as any);
      (jwt.decode as jest.Mock).mockReturnValue(mockUser as any);

      const result = await exchangeOAuthCode("code");

      expect((jwt.decode as jest.Mock)).toHaveBeenCalledWith("");
      expect(result.tokens).toEqual(mockTokens);
    });

    it("should handle undefined id_token", async () => {
      const mockTokens: TokensProps = {
        access_token: "access_token",
        id_token: undefined,
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens } as any);
      (jwt.decode as jest.Mock).mockReturnValue({} as any);

      const result = await exchangeOAuthCode("code");

      expect((jwt.decode as jest.Mock)).toHaveBeenCalledWith("");
      expect(result.tokens.id_token).toBeUndefined();
    });

    it("should handle empty authorization code", async () => {
      const emptyCodeError = new Error("No authorization code provided");
      (OAUTH2CLIENT.getToken as jest.Mock).mockRejectedValue(emptyCodeError);

      await expect(exchangeOAuthCode("")).rejects.toThrow(
        "No authorization code provided",
      );
    });

    it("should handle malformed id_token", async () => {
      const mockTokens: TokensProps = {
        access_token: "access",
        id_token: "malformed_token",
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens } as any);
      (jwt.decode as jest.Mock).mockReturnValue(null);

      const result = await exchangeOAuthCode("code");

      expect(result.user).toBeNull();
      expect(result.tokens).toEqual(mockTokens);
    });

    it("should handle tokens with all optional fields populated", async () => {
      const mockTokens: TokensProps = {
        access_token: "access_token",
        refresh_token: "refresh_token",
        scope: "openid email profile calendar",
        token_type: "Bearer",
        id_token: "id_token",
        expiry_date: 1234567890000,
        refresh_token_expires_in: 7776000,
        email: "user@example.com",
      };

      const mockUser: GoogleIdTokenPayloadProps = {
        iss: "https://accounts.google.com",
        azp: "client_id",
        aud: "client_id",
        sub: "user_id",
        email: "user@example.com",
        email_verified: true,
        at_hash: "hash",
        name: "Full Name",
        picture: "https://example.com/pic.jpg",
        given_name: "Full",
        family_name: "Name",
        iat: 1234567890,
        exp: 1234571490,
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens } as any);
      (jwt.decode as jest.Mock).mockReturnValue(mockUser as any);

      const result = await exchangeOAuthCode("code");

      expect(result.tokens).toEqual(mockTokens);
      expect(result.tokens.refresh_token).toBe("refresh_token");
      expect(result.tokens.scope).toBe("openid email profile calendar");
      expect(result.tokens.expiry_date).toBe(1234567890000);
      expect(result.tokens.refresh_token_expires_in).toBe(7776000);
      expect(result.tokens.email).toBe("user@example.com");
      expect(result.user.at_hash).toBe("hash");
    });
  });

  describe("Token Validation", () => {
    it("should return tokens with proper structure", async () => {
      const mockTokens: TokensProps = {
        access_token: "access",
        refresh_token: "refresh",
        id_token: "id",
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens } as any);
      (jwt.decode as jest.Mock).mockReturnValue({} as any);

      const result = await exchangeOAuthCode("code");

      expect(result).toHaveProperty("tokens");
      expect(result).toHaveProperty("user");
      expect(typeof result.tokens).toBe("object");
    });

    it("should preserve all token properties", async () => {
      const mockTokens: TokensProps = {
        access_token: "access_123",
        refresh_token: "refresh_456",
        scope: "calendar.readonly",
        token_type: "Bearer",
        id_token: "id_789",
        expiry_date: 9999999999,
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens } as any);
      (jwt.decode as jest.Mock).mockReturnValue({} as any);

      const result = await exchangeOAuthCode("code");

      expect(result.tokens.access_token).toBe("access_123");
      expect(result.tokens.refresh_token).toBe("refresh_456");
      expect(result.tokens.scope).toBe("calendar.readonly");
      expect(result.tokens.token_type).toBe("Bearer");
      expect(result.tokens.id_token).toBe("id_789");
      expect(result.tokens.expiry_date).toBe(9999999999);
    });
  });

  describe("User Info Decoding", () => {
    it("should correctly decode all user fields", async () => {
      const mockTokens: TokensProps = {
        access_token: "access",
        id_token: "encoded_token",
      };

      const mockUser: GoogleIdTokenPayloadProps = {
        iss: "https://accounts.google.com",
        azp: "123456.apps.googleusercontent.com",
        aud: "123456.apps.googleusercontent.com",
        sub: "110169484474386276334",
        email: "testuser@gmail.com",
        email_verified: true,
        at_hash: "HK6E_P6Dh8Y93mRNtsDB1Q",
        name: "Test User",
        picture: "https://lh3.googleusercontent.com/a/photo.jpg",
        given_name: "Test",
        family_name: "User",
        iat: 1609459200,
        exp: 1609462800,
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens } as any);
      (jwt.decode as jest.Mock).mockReturnValue(mockUser as any);

      const result = await exchangeOAuthCode("code");

      expect(result.user.iss).toBe("https://accounts.google.com");
      expect(result.user.email).toBe("testuser@gmail.com");
      expect(result.user.email_verified).toBe(true);
      expect(result.user.name).toBe("Test User");
      expect(result.user.given_name).toBe("Test");
      expect(result.user.family_name).toBe("User");
      expect(result.user.sub).toBe("110169484474386276334");
    });

    it("should handle user info without optional at_hash", async () => {
      const mockTokens: TokensProps = {
        access_token: "access",
        id_token: "token",
      };

      const mockUser: Partial<GoogleIdTokenPayloadProps> = {
        iss: "https://accounts.google.com",
        azp: "client_id",
        aud: "client_id",
        sub: "user_id",
        email: "user@example.com",
        email_verified: true,
        name: "User",
        picture: "pic.jpg",
        given_name: "User",
        family_name: "Name",
        iat: 123,
        exp: 456,
        // at_hash is optional, not included
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens } as any);
      (jwt.decode as jest.Mock).mockReturnValue(mockUser as any);

      const result = await exchangeOAuthCode("code");

      expect(result.user.at_hash).toBeUndefined();
      expect(result.user.email).toBe("user@example.com");
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle successful OAuth flow from start to finish", async () => {
      const authCode = "4/0AY0e-g7X_sample_auth_code";
      const mockTokens: TokensProps = {
        access_token: "ya29.a0AfH6SMBx...",
        refresh_token: "1//0gL3pVz...",
        scope: "openid https://www.googleapis.com/auth/calendar",
        token_type: "Bearer",
        id_token: "eyJhbGciOiJSUzI1NiIs...",
        expiry_date: Date.now() + 3600000,
      };

      const mockUser: GoogleIdTokenPayloadProps = {
        iss: "https://accounts.google.com",
        azp: "123456789-abc.apps.googleusercontent.com",
        aud: "123456789-abc.apps.googleusercontent.com",
        sub: "110169484474386276334",
        email: "realuser@gmail.com",
        email_verified: true,
        at_hash: "HK6E_P6Dh8Y93mRNtsDB1Q",
        name: "Real User",
        picture: "https://lh3.googleusercontent.com/a/default-user",
        given_name: "Real",
        family_name: "User",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (OAUTH2CLIENT.getToken as jest.Mock).mockResolvedValue({ tokens: mockTokens } as any);
      (jwt.decode as jest.Mock).mockReturnValue(mockUser as any);

      const result = await exchangeOAuthCode(authCode);

      // Verify the complete flow
      expect((OAUTH2CLIENT.getToken as jest.Mock)).toHaveBeenCalledWith(authCode);
      expect((jwt.decode as jest.Mock)).toHaveBeenCalledWith(mockTokens.id_token);

      // Verify tokens
      expect(result.tokens.access_token).toContain("ya29");
      expect(result.tokens.refresh_token).toContain("1//0gL3pVz");
      expect(result.tokens.scope).toContain("calendar");

      // Verify user
      expect(result.user.email).toBe("realuser@gmail.com");
      expect(result.user.email_verified).toBe(true);
      expect(result.user.name).toBe("Real User");
    });
  });
});
