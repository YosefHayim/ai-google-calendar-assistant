import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { mockFn } from "../test-utils";

// Define mocks at module level
const mockValidateSupabaseToken = mockFn();
const mockRefreshSupabaseSession = mockFn();
const mockSetAuthCookies = mockFn();
const mockSendR = mockFn();

jest.mock("@/domains/auth/utils/cookie-utils", () => ({
  ACCESS_TOKEN_COOKIE: "access_token",
  REFRESH_TOKEN_COOKIE: "refresh_token",
  setAuthCookies: (...args: unknown[]) => mockSetAuthCookies(...args),
}));

jest.mock("@/domains/auth/utils/supabase-token", () => ({
  validateSupabaseToken: (...args: unknown[]) =>
    mockValidateSupabaseToken(...args),
  refreshSupabaseSession: (...args: unknown[]) =>
    mockRefreshSupabaseSession(...args),
}));

jest.mock("@/lib/http", () => ({
  sendR: (...args: unknown[]) => mockSendR(...args),
  reqResAsyncHandler:
    <T extends (...args: unknown[]) => Promise<unknown>>(fn: T) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next),
}));

jest.mock("@/config", () => ({
  STATUS_RESPONSE: {
    UNAUTHORIZED: 401,
  },
}));

// Import after mocks
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth";

describe("supabaseAuth Middleware", () => {
  let mockRequest: Partial<Request> & { user?: any };
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof mockFn>;
  let setHeaderMock: ReturnType<typeof mockFn>;

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    aud: "authenticated",
    role: "authenticated",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    setHeaderMock = mockFn();
    mockRequest = {
      headers: {},
      cookies: {},
    };
    mockResponse = {
      setHeader: setHeaderMock as unknown as Response["setHeader"],
    };
    mockNext = mockFn();
  });

  describe("token extraction", () => {
    it("should extract token from Authorization header", async () => {
      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };
      mockRequest.cookies = {};

      mockValidateSupabaseToken.mockResolvedValue({
        user: mockUser,
        needsRefresh: false,
      });

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockValidateSupabaseToken).toHaveBeenCalledWith("valid-token");
      expect(mockNext).toHaveBeenCalled();
    });

    it("should prioritize cookie token over header", async () => {
      mockRequest.cookies = { access_token: "cookie-token" };
      mockRequest.headers = { authorization: "Bearer header-token" };

      mockValidateSupabaseToken.mockResolvedValue({
        user: mockUser,
        needsRefresh: false,
      });

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockValidateSupabaseToken).toHaveBeenCalledWith("cookie-token");
    });

    it("should return 401 when no token provided", async () => {
      mockRequest.headers = {};
      mockRequest.cookies = {};

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        401,
        "Missing authorization header or cookie"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when Authorization header has wrong format", async () => {
      mockRequest.headers = { authorization: "InvalidFormat token" };
      mockRequest.cookies = {};

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        401,
        "Missing authorization header or cookie"
      );
    });
  });

  describe("successful authentication", () => {
    it("should authenticate user with valid token", async () => {
      mockRequest.headers = { authorization: "Bearer valid-token" };
      mockRequest.cookies = {};

      mockValidateSupabaseToken.mockResolvedValue({
        user: mockUser,
        needsRefresh: false,
      });

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockSendR).not.toHaveBeenCalled();
    });

    it("should attach user to request object", async () => {
      mockRequest.headers = { authorization: "Bearer valid-token" };
      mockRequest.cookies = {};

      mockValidateSupabaseToken.mockResolvedValue({
        user: mockUser,
        needsRefresh: false,
      });

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockRequest.user?.email).toBe("test@example.com");
    });
  });

  describe("token refresh", () => {
    it("should refresh token when expired and autoRefresh enabled (default)", async () => {
      mockRequest.headers = { authorization: "Bearer expired-token" };
      mockRequest.cookies = { refresh_token: "valid-refresh-token" };

      mockValidateSupabaseToken.mockResolvedValue({
        user: null,
        needsRefresh: true,
      });
      mockRefreshSupabaseSession.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        user: mockUser,
      });

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockRefreshSupabaseSession).toHaveBeenCalledWith(
        "valid-refresh-token"
      );
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockSetAuthCookies).toHaveBeenCalledWith(
        mockResponse,
        "new-access-token",
        "new-refresh-token",
        mockUser
      );
      expect(setHeaderMock).toHaveBeenCalledWith(
        "access_token",
        "new-access-token"
      );
      expect(setHeaderMock).toHaveBeenCalledWith(
        "refresh_token",
        "new-refresh-token"
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should get refresh token from header when not in cookie", async () => {
      mockRequest.headers = {
        authorization: "Bearer expired-token",
        refresh_token: "header-refresh-token",
      };
      mockRequest.cookies = {};

      mockValidateSupabaseToken.mockResolvedValue({
        user: null,
        needsRefresh: true,
      });
      mockRefreshSupabaseSession.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        user: mockUser,
      });

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockRefreshSupabaseSession).toHaveBeenCalledWith(
        "header-refresh-token"
      );
    });

    it("should return 401 when refresh token not available", async () => {
      mockRequest.headers = { authorization: "Bearer expired-token" };
      mockRequest.cookies = {};

      mockValidateSupabaseToken.mockResolvedValue({
        user: null,
        needsRefresh: true,
      });

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        401,
        "Session expired. Please login again.",
        { code: "SESSION_EXPIRED" }
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should not refresh when autoRefresh is disabled", async () => {
      mockRequest.headers = { authorization: "Bearer expired-token" };
      mockRequest.cookies = { refresh_token: "valid-refresh-token" };

      mockValidateSupabaseToken.mockResolvedValue({
        user: null,
        needsRefresh: true,
      });

      const middleware = supabaseAuth({ autoRefresh: false });
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockRefreshSupabaseSession).not.toHaveBeenCalled();
      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        401,
        "Not authorized. Please login or register to continue."
      );
    });

    it("should return 401 when refresh fails", async () => {
      mockRequest.headers = { authorization: "Bearer expired-token" };
      mockRequest.cookies = { refresh_token: "invalid-refresh-token" };

      mockValidateSupabaseToken.mockResolvedValue({
        user: null,
        needsRefresh: true,
      });
      mockRefreshSupabaseSession.mockRejectedValue(new Error("Refresh failed"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        401,
        "Session expired. Please login again.",
        { code: "SESSION_REFRESH_FAILED" }
      );
      expect(mockNext).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should return 401 when refresh returns no user", async () => {
      mockRequest.headers = { authorization: "Bearer expired-token" };
      mockRequest.cookies = { refresh_token: "valid-refresh-token" };

      mockValidateSupabaseToken.mockResolvedValue({
        user: null,
        needsRefresh: true,
      });
      mockRefreshSupabaseSession.mockResolvedValue({
        accessToken: "new-token",
        refreshToken: "new-refresh",
        user: null,
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        401,
        "Session expired. Please login again.",
        { code: "SESSION_REFRESH_FAILED" }
      );

      consoleSpy.mockRestore();
    });

    it("should return 401 when refreshed user has no email", async () => {
      mockRequest.headers = { authorization: "Bearer expired-token" };
      mockRequest.cookies = { refresh_token: "valid-refresh-token" };

      mockValidateSupabaseToken.mockResolvedValue({
        user: null,
        needsRefresh: true,
      });
      mockRefreshSupabaseSession.mockResolvedValue({
        accessToken: "new-token",
        refreshToken: "new-refresh",
        user: { id: "user-123", email: null },
      });

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        401,
        "Session expired. Please login again.",
        { code: "SESSION_REFRESH_FAILED" }
      );

      consoleSpy.mockRestore();
    });

    it("should update Authorization header after successful refresh", async () => {
      mockRequest.headers = { authorization: "Bearer expired-token" };
      mockRequest.cookies = { refresh_token: "valid-refresh-token" };

      mockValidateSupabaseToken.mockResolvedValue({
        user: null,
        needsRefresh: true,
      });
      mockRefreshSupabaseSession.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        user: mockUser,
      });

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockRequest.headers?.authorization).toBe(
        "Bearer new-access-token"
      );
    });
  });

  describe("failed authentication", () => {
    it("should return 401 when token validation fails without refresh option", async () => {
      mockRequest.headers = { authorization: "Bearer invalid-token" };
      mockRequest.cookies = {};

      mockValidateSupabaseToken.mockResolvedValue({
        user: null,
        needsRefresh: false,
      });

      const middleware = supabaseAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        401,
        "Not authorized. Please login or register to continue."
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("options configuration", () => {
    it("should use default autoRefresh=true", async () => {
      mockRequest.headers = { authorization: "Bearer expired-token" };
      mockRequest.cookies = { refresh_token: "refresh-token" };

      mockValidateSupabaseToken.mockResolvedValue({
        user: null,
        needsRefresh: true,
      });
      mockRefreshSupabaseSession.mockResolvedValue({
        accessToken: "new-token",
        refreshToken: "new-refresh",
        user: mockUser,
      });

      const middleware = supabaseAuth(); // No options = default autoRefresh: true
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockRefreshSupabaseSession).toHaveBeenCalled();
    });

    it("should respect autoRefresh=false option", async () => {
      mockRequest.headers = { authorization: "Bearer expired-token" };
      mockRequest.cookies = { refresh_token: "refresh-token" };

      mockValidateSupabaseToken.mockResolvedValue({
        user: null,
        needsRefresh: true,
      });

      const middleware = supabaseAuth({ autoRefresh: false });
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockRefreshSupabaseSession).not.toHaveBeenCalled();
      expect(mockSendR).toHaveBeenCalled();
    });
  });
});
