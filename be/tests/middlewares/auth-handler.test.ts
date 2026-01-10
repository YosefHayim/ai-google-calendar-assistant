import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { mockFn } from "../test-utils";

// Now import after mocks are set up
import { authHandler } from "../../middlewares/auth-handler";

// Create mocks before imports
const mockGetUser = mockFn();
const mockSendR = mockFn();
const mockSupabase = {
  auth: {
    getUser: mockGetUser,
  },
};

// Mock modules
jest.mock("@/config", () => ({
  SUPABASE: mockSupabase,
}));

jest.mock("@/utils/http/send-response", () => ({
  default: mockSendR,
}));

const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2024-01-01T00:00:00Z",
};

describe("authHandler", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof mockFn>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: mockFn().mockReturnThis(),
      json: mockFn(),
    };
    mockNext = mockFn();
    mockGetUser.mockClear();
    mockSendR.mockClear();
  });

  describe("successful authentication", () => {
    it("should authenticate user with valid token", async () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await authHandler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockGetUser).toHaveBeenCalledWith("valid-token");
      expect(mockNext).toHaveBeenCalled();
      expect(mockSendR).not.toHaveBeenCalled();
    });

    it("should attach user to request object", async () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await authHandler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect((mockRequest as Request & { user: typeof mockUser }).user).toEqual(mockUser);
    });

    it("should handle Bearer token with extra spaces", async () => {
      mockRequest.headers = {
        authorization: "Bearer   valid-token",
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await authHandler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockGetUser).toHaveBeenCalledWith("  valid-token");
    });
  });

  describe("failed authentication", () => {
    it("should return 401 when authorization header is missing", async () => {
      mockRequest.headers = {};

      await authHandler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 401, "Missing authorization headers: ", undefined);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when token is empty string", async () => {
      mockRequest.headers = {
        authorization: "Bearer ",
      };

      await authHandler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 401, "Missing authorization headers: ", "");
    });

    it("should return 401 when user is not found", async () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      };

      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid token" },
      });

      await authHandler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 401, "You are not logged in, please logged in or register.");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when Supabase returns no user", async () => {
      mockRequest.headers = {
        authorization: "Bearer expired-token",
      };

      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await authHandler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 401, "You are not logged in, please logged in or register.");
    });
  });

  describe("edge cases", () => {
    it("should handle authorization header without Bearer prefix", async () => {
      mockRequest.headers = {
        authorization: "just-a-token",
      };

      await authHandler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 401, "Missing authorization headers: ", "just-a-token");
    });

    it("should handle malformed authorization header", async () => {
      mockRequest.headers = {
        authorization: "InvalidFormat token-here",
      };

      await authHandler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 401, "Missing authorization headers: ", "InvalidFormat token-here");
    });

    it("should handle Supabase errors gracefully", async () => {
      mockRequest.headers = {
        authorization: "Bearer error-token",
      };

      mockGetUser.mockRejectedValue(new Error("Supabase connection error"));

      await expect(authHandler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction)).rejects.toThrow("Supabase connection error");
    });

    it("should handle very long tokens", async () => {
      const longToken = "a".repeat(1000);
      mockRequest.headers = {
        authorization: `Bearer ${longToken}`,
      };

      mockGetUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await authHandler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockGetUser).toHaveBeenCalledWith(longToken);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
