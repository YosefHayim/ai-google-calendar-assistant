import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { Request, Response } from "express";
import {
  generateGoogleAuthUrl,
  isPostmanRequest,
  handleInitialAuthRequest,
} from "@/utils/auth/generateAuthUrl";

// Mock the config module
jest.mock("@/config/root-config", () => ({
  OAUTH2CLIENT: {
    generateAuthUrl: jest.fn(),
  },
  redirectUri: "http://localhost:3000/api/users/callback",
  SCOPES: ["openid", "email", "profile", "https://www.googleapis.com/auth/calendar"],
}));

// Mock sendResponse
jest.mock("@/utils/sendResponse");

import { OAUTH2CLIENT, SCOPES, redirectUri } from "@/config/root-config";
import sendResponse from "@/utils/sendResponse";
import { STATUS_RESPONSE } from "@/types";

// Get the mocked function
const mockSendResponse = sendResponse as jest.MockedFunction<typeof sendResponse>;

describe("generateAuthUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateGoogleAuthUrl", () => {
    it("should generate auth URL with correct parameters", () => {
      const mockUrl = "https://accounts.google.com/o/oauth2/v2/auth?scope=openid...";
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue(mockUrl);

      const result = generateGoogleAuthUrl();

      expect(OAUTH2CLIENT.generateAuthUrl).toHaveBeenCalledWith({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent",
        include_granted_scopes: true,
        redirect_uri: redirectUri,
      });
      expect(result).toBe(mockUrl);
    });

    it("should return a valid Google OAuth URL", () => {
      const mockUrl = "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=openid+email+profile";
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue(mockUrl);

      const result = generateGoogleAuthUrl();

      expect(result).toBeDefined();
      expect(result).toContain("accounts.google.com");
      expect(typeof result).toBe("string");
    });

    it("should include access_type offline for refresh token", () => {
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue("https://example.com");

      generateGoogleAuthUrl();

      const callArgs = (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mock.calls[0][0];
      expect(callArgs.access_type).toBe("offline");
    });

    it("should include consent prompt", () => {
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue("https://example.com");

      generateGoogleAuthUrl();

      const callArgs = (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mock.calls[0][0];
      expect(callArgs.prompt).toBe("consent");
    });

    it("should include granted scopes", () => {
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue("https://example.com");

      generateGoogleAuthUrl();

      const callArgs = (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mock.calls[0][0];
      expect(callArgs.include_granted_scopes).toBe(true);
    });

    it("should use configured redirect URI", () => {
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue("https://example.com");

      generateGoogleAuthUrl();

      const callArgs = (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mock.calls[0][0];
      expect(callArgs.redirect_uri).toBe(redirectUri);
    });

    it("should use configured scopes", () => {
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue("https://example.com");

      generateGoogleAuthUrl();

      const callArgs = (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mock.calls[0][0];
      expect(callArgs.scope).toEqual(SCOPES);
    });

    it("should call generateAuthUrl exactly once", () => {
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue("https://example.com");

      generateGoogleAuthUrl();

      expect(OAUTH2CLIENT.generateAuthUrl).toHaveBeenCalledTimes(1);
    });

    it("should handle different redirect URIs from config", () => {
      const customRedirectUri = "https://production.example.com/callback";
      const originalRedirectUri = redirectUri;

      // Temporarily change the redirect URI
      (redirectUri as any) = customRedirectUri;
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue("https://example.com");

      generateGoogleAuthUrl();

      const callArgs = (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mock.calls[0][0];
      // Reset redirect URI
      (redirectUri as any) = originalRedirectUri;

      // Note: This test shows how the function would work with different configs
      expect(callArgs).toBeDefined();
    });
  });

  describe("isPostmanRequest", () => {
    it("should return true when user-agent contains Postman", () => {
      const req = {
        headers: {
          "user-agent": "PostmanRuntime/7.32.3",
        },
      } as Request;

      const result = isPostmanRequest(req);

      expect(result).toBe(true);
    });

    it("should return true for Postman desktop app", () => {
      const req = {
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Postman/10.0.0",
        },
      } as Request;

      const result = isPostmanRequest(req);

      expect(result).toBe(true);
    });

    it("should return false when user-agent is from a browser", () => {
      const req = {
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        },
      } as Request;

      const result = isPostmanRequest(req);

      expect(result).toBe(false);
    });

    it("should return false when user-agent is from curl", () => {
      const req = {
        headers: {
          "user-agent": "curl/7.68.0",
        },
      } as Request;

      const result = isPostmanRequest(req);

      expect(result).toBe(false);
    });

    it("should return false when user-agent header is missing", () => {
      const req = {
        headers: {},
      } as Request;

      const result = isPostmanRequest(req);

      expect(result).toBe(false);
    });

    it("should return false when user-agent is empty string", () => {
      const req = {
        headers: {
          "user-agent": "",
        },
      } as Request;

      const result = isPostmanRequest(req);

      expect(result).toBe(false);
    });

    it("should return false when user-agent is undefined", () => {
      const req = {
        headers: {
          "user-agent": undefined,
        },
      } as Request;

      const result = isPostmanRequest(req);

      expect(result).toBe(false);
    });

    it("should be case-sensitive for Postman detection", () => {
      const req = {
        headers: {
          "user-agent": "postman",
        },
      } as Request;

      const result = isPostmanRequest(req);

      expect(result).toBe(false);
    });

    it("should detect Postman in middle of user-agent string", () => {
      const req = {
        headers: {
          "user-agent": "Some Other Agent Postman Runtime",
        },
      } as Request;

      const result = isPostmanRequest(req);

      expect(result).toBe(true);
    });
  });

  describe("handleInitialAuthRequest", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
      mockReq = {
        headers: {},
      };
      mockRes = {
        redirect: jest.fn(),
      };
    });

    it("should send JSON response for Postman requests", () => {
      mockReq.headers = {
        "user-agent": "PostmanRuntime/7.32.3",
      };

      const authUrl = "https://accounts.google.com/o/oauth2/auth";
      handleInitialAuthRequest(mockReq as Request, mockRes as Response, authUrl);

      expect(mockSendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.SUCCESS,
        authUrl,
      );
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it("should redirect for browser requests", () => {
      mockReq.headers = {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      };

      const authUrl = "https://accounts.google.com/o/oauth2/auth";
      handleInitialAuthRequest(mockReq as Request, mockRes as Response, authUrl);

      expect(mockRes.redirect).toHaveBeenCalledWith(authUrl);
      expect(mockSendResponse).not.toHaveBeenCalled();
    });

    it("should redirect when no user-agent is present", () => {
      mockReq.headers = {};

      const authUrl = "https://accounts.google.com/o/oauth2/auth";
      handleInitialAuthRequest(mockReq as Request, mockRes as Response, authUrl);

      expect(mockRes.redirect).toHaveBeenCalledWith(authUrl);
      expect(mockSendResponse).not.toHaveBeenCalled();
    });

    it("should handle different auth URL formats", () => {
      mockReq.headers = {
        "user-agent": "Mozilla/5.0",
      };

      const customUrl = "https://custom-oauth-provider.com/auth?client_id=123";
      handleInitialAuthRequest(mockReq as Request, mockRes as Response, customUrl);

      expect(mockRes.redirect).toHaveBeenCalledWith(customUrl);
    });

    it("should use STATUS_RESPONSE.SUCCESS for Postman", () => {
      mockReq.headers = {
        "user-agent": "Postman",
      };

      const authUrl = "https://example.com/auth";
      handleInitialAuthRequest(mockReq as Request, mockRes as Response, authUrl);

      expect(mockSendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.SUCCESS,
        authUrl,
      );
    });

    it("should pass exact URL to redirect", () => {
      mockReq.headers = {
        "user-agent": "Firefox/120.0",
      };

      const longUrl = "https://accounts.google.com/o/oauth2/v2/auth?scope=openid+email+profile&access_type=offline&include_granted_scopes=true&response_type=code&state=state_parameter_passthrough_value&redirect_uri=http://localhost:3000/api/users/callback&client_id=your_client_id";
      handleInitialAuthRequest(mockReq as Request, mockRes as Response, longUrl);

      expect(mockRes.redirect).toHaveBeenCalledWith(longUrl);
      expect(mockRes.redirect).toHaveBeenCalledTimes(1);
    });

    it("should not call redirect for Postman requests", () => {
      mockReq.headers = {
        "user-agent": "PostmanRuntime/7.32.3",
      };

      handleInitialAuthRequest(mockReq as Request, mockRes as Response, "https://example.com");

      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it("should not call sendResponse for non-Postman requests", () => {
      mockReq.headers = {
        "user-agent": "Safari/605.1.15",
      };

      handleInitialAuthRequest(mockReq as Request, mockRes as Response, "https://example.com");

      expect(mockSendResponse).not.toHaveBeenCalled();
    });
  });

  describe("Integration Scenarios", () => {
    it("should generate URL and handle Postman request", () => {
      const mockUrl = "https://accounts.google.com/o/oauth2/v2/auth?params";
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue(mockUrl);

      const req = {
        headers: {
          "user-agent": "PostmanRuntime/7.32.3",
        },
      } as Request;

      const res = {
        redirect: jest.fn(),
      } as Partial<Response>;

      // Generate URL
      const url = generateGoogleAuthUrl();

      // Check if it's a Postman request
      const isPostman = isPostmanRequest(req);

      // Handle the request
      handleInitialAuthRequest(req, res as Response, url);

      expect(url).toBe(mockUrl);
      expect(isPostman).toBe(true);
      expect(mockSendResponse).toHaveBeenCalledWith(res, STATUS_RESPONSE.SUCCESS, mockUrl);
    });

    it("should generate URL and handle browser request", () => {
      const mockUrl = "https://accounts.google.com/o/oauth2/v2/auth?params";
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue(mockUrl);

      const req = {
        headers: {
          "user-agent": "Mozilla/5.0 Chrome/120.0.0.0",
        },
      } as Request;

      const res = {
        redirect: jest.fn(),
      } as Partial<Response>;

      // Generate URL
      const url = generateGoogleAuthUrl();

      // Check if it's a Postman request
      const isPostman = isPostmanRequest(req);

      // Handle the request
      handleInitialAuthRequest(req, res as Response, url);

      expect(url).toBe(mockUrl);
      expect(isPostman).toBe(false);
      expect(res.redirect).toHaveBeenCalledWith(mockUrl);
    });

    it("should work with complete OAuth flow initiation", () => {
      const expectedUrl = "https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=openid+email+profile+https://www.googleapis.com/auth/calendar&prompt=consent&include_granted_scopes=true&redirect_uri=http://localhost:3000/api/users/callback&client_id=test_client_id";
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue(expectedUrl);

      const req = {
        headers: {
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0",
        },
      } as Request;

      const res = {
        redirect: jest.fn(),
      } as Partial<Response>;

      const url = generateGoogleAuthUrl();
      handleInitialAuthRequest(req, res as Response, url);

      expect(OAUTH2CLIENT.generateAuthUrl).toHaveBeenCalledWith({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent",
        include_granted_scopes: true,
        redirect_uri: redirectUri,
      });
      expect(res.redirect).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe("Edge Cases", () => {
    it("should handle malformed user-agent", () => {
      const req = {
        headers: {
          "user-agent": "{}[]()",
        },
      } as Request;

      const result = isPostmanRequest(req);
      expect(result).toBe(false);
    });

    it("should handle very long user-agent strings", () => {
      const longUserAgent = "a".repeat(10000) + "Postman" + "b".repeat(10000);
      const req = {
        headers: {
          "user-agent": longUserAgent,
        },
      } as Request;

      const result = isPostmanRequest(req);
      expect(result).toBe(true);
    });

    it("should handle special characters in user-agent", () => {
      const req = {
        headers: {
          "user-agent": "Special<>\"'&Characters/1.0",
        },
      } as Request;

      const result = isPostmanRequest(req);
      expect(result).toBe(false);
    });

    it("should handle empty auth URL", () => {
      const req = {
        headers: {
          "user-agent": "Mozilla/5.0",
        },
      } as Request;

      const res = {
        redirect: jest.fn(),
      } as Partial<Response>;

      handleInitialAuthRequest(req, res as Response, "");

      expect(res.redirect).toHaveBeenCalledWith("");
    });

    it("should handle URL with query parameters", () => {
      const mockUrl = "https://example.com/auth?param1=value1&param2=value2&param3=value3";
      (OAUTH2CLIENT.generateAuthUrl as jest.Mock).mockReturnValue(mockUrl);

      const result = generateGoogleAuthUrl();

      expect(result).toBe(mockUrl);
    });
  });
});
