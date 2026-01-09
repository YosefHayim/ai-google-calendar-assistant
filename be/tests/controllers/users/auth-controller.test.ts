import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { Request, Response, NextFunction } from "express";

// Mock dependencies
const mockSignUp = jest.fn<() => Promise<{ data: unknown; error: unknown }>>();
const mockSignInWithPassword = jest.fn<() => Promise<{ data: unknown; error: unknown }>>();
const mockVerifyOtp = jest.fn<() => Promise<{ data: unknown; error: unknown }>>();
const mockRefreshSession = jest.fn<() => Promise<{ data: unknown }>>();
const mockSetAuthCookies = jest.fn<() => void>();
const mockClearAuthCookies = jest.fn<() => void>();
const mockSupabaseThirdPartySignInOrSignUp = jest.fn<() => Promise<void>>();
const mockSendR = jest.fn<() => void>();

jest.mock("@/config", () => ({
  PROVIDERS: {
    GOOGLE: "google",
    GITHUB: "github",
  },
  STATUS_RESPONSE: {
    SUCCESS: { code: 200, success: true },
    BAD_REQUEST: { code: 400, success: false },
    INTERNAL_SERVER_ERROR: { code: 500, success: false },
  },
  SUPABASE: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
      refreshSession: (...args: unknown[]) => mockRefreshSession(...args),
    },
  },
}));

jest.mock("@/utils/auth/cookie-utils", () => ({
  setAuthCookies: (...args: unknown[]) => mockSetAuthCookies(...args),
  clearAuthCookies: (...args: unknown[]) => mockClearAuthCookies(...args),
}));

jest.mock("@/utils/auth", () => ({
  supabaseThirdPartySignInOrSignUp: (...args: unknown[]) =>
    mockSupabaseThirdPartySignInOrSignUp(...args),
}));

jest.mock("@/utils/http", () => ({
  sendR: (...args: unknown[]) => mockSendR(...args),
  reqResAsyncHandler: <T extends (...args: unknown[]) => Promise<unknown>>(fn: T) => {
    return (req: Request, res: Response, next: NextFunction) => {
      return Promise.resolve(fn(req, res, next)).catch(next);
    };
  },
}));

// Import after mocks
import { authController } from "@/controllers/users/auth-controller";

describe("authController", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      user: { id: "user-123", email: "test@example.com" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis() as unknown as Response["status"],
      json: jest.fn().mockReturnThis() as unknown as Response["json"],
    };
    mockNext = jest.fn();
  });

  describe("signUpUserReg", () => {
    it("should return bad request if email is missing", async () => {
      mockReq.body = { password: "password123" };

      await authController.signUpUserReg(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Email and password are required."
      );
    });

    it("should return bad request if password is missing", async () => {
      mockReq.body = { email: "test@example.com" };

      await authController.signUpUserReg(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Email and password are required."
      );
    });

    it("should sign up user successfully", async () => {
      mockReq.body = { email: "test@example.com", password: "password123" };
      const mockData = { user: { id: "new-user-123" } };
      mockSignUp.mockResolvedValue({ data: mockData, error: null });

      await authController.signUpUserReg(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "User signed up successfully.",
        mockData
      );
    });

    it("should return error if signup fails", async () => {
      mockReq.body = { email: "test@example.com", password: "password123" };
      const mockError = { message: "Email already exists" };
      mockSignUp.mockResolvedValue({ data: null, error: mockError });

      await authController.signUpUserReg(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 500 }),
        "Failed to sign up user.",
        mockError
      );
    });
  });

  describe("signInUserReg", () => {
    it("should return bad request if email is missing", async () => {
      mockReq.body = { password: "password123" };

      await authController.signInUserReg(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Email and password are required."
      );
    });

    it("should sign in user successfully and set cookies", async () => {
      mockReq.body = { email: "test@example.com", password: "password123" };
      const mockSession = {
        access_token: "access-token",
        refresh_token: "refresh-token",
      };
      const mockUser = { id: "user-123", email: "test@example.com" };
      const mockData = { session: mockSession, user: mockUser };
      mockSignInWithPassword.mockResolvedValue({ data: mockData, error: null });

      await authController.signInUserReg(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockSetAuthCookies).toHaveBeenCalledWith(
        mockRes,
        "access-token",
        "refresh-token",
        mockUser
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "User signin successfully.",
        mockData
      );
    });

    it("should sign in without setting cookies if no session", async () => {
      mockReq.body = { email: "test@example.com", password: "password123" };
      const mockData = { session: null, user: { id: "user-123" } };
      mockSignInWithPassword.mockResolvedValue({ data: mockData, error: null });

      await authController.signInUserReg(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSetAuthCookies).not.toHaveBeenCalled();
    });

    it("should return error if signin fails", async () => {
      mockReq.body = { email: "test@example.com", password: "wrongpassword" };
      const mockError = { message: "Invalid credentials" };
      mockSignInWithPassword.mockResolvedValue({ data: null, error: mockError });

      await authController.signInUserReg(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 500 }),
        "Failed to fetch user by email.",
        mockError
      );
    });
  });

  describe("signUpOrSignInWithGoogle", () => {
    it("should call supabaseThirdPartySignInOrSignUp with Google provider", async () => {
      mockSupabaseThirdPartySignInOrSignUp.mockResolvedValue();

      await authController.signUpOrSignInWithGoogle(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSupabaseThirdPartySignInOrSignUp).toHaveBeenCalledWith(
        mockRes,
        "google"
      );
    });
  });

  describe("signUpUserViaGitHub", () => {
    it("should call supabaseThirdPartySignInOrSignUp with GitHub provider", async () => {
      mockSupabaseThirdPartySignInOrSignUp.mockResolvedValue();

      await authController.signUpUserViaGitHub(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSupabaseThirdPartySignInOrSignUp).toHaveBeenCalledWith(
        mockRes,
        "github"
      );
    });
  });

  describe("verifyEmailByOtp", () => {
    it("should return bad request if email is missing", async () => {
      mockReq.body = { token: "123456" };

      await authController.verifyEmailByOtp(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Email and token are required."
      );
    });

    it("should return bad request if token is missing", async () => {
      mockReq.body = { email: "test@example.com" };

      await authController.verifyEmailByOtp(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Email and token are required."
      );
    });

    it("should verify OTP successfully", async () => {
      mockReq.body = { email: "test@example.com", token: "123456" };
      const mockData = { user: { id: "user-123" } };
      mockVerifyOtp.mockResolvedValue({ data: mockData, error: null });

      await authController.verifyEmailByOtp(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockVerifyOtp).toHaveBeenCalledWith({
        type: "email",
        email: "test@example.com",
        token: "123456",
      });
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Email verified successfully.",
        mockData
      );
    });

    it("should return error if OTP verification fails", async () => {
      mockReq.body = { email: "test@example.com", token: "invalid" };
      const mockError = { message: "Invalid OTP" };
      mockVerifyOtp.mockResolvedValue({ data: null, error: mockError });

      await authController.verifyEmailByOtp(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 500 }),
        "Failed to verify email.",
        mockError
      );
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      mockReq.body = { refresh_token: "refresh-token-123" };
      const mockData = { session: { access_token: "new-access-token" } };
      mockRefreshSession.mockResolvedValue({ data: mockData });

      await authController.refreshToken(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRefreshSession).toHaveBeenCalledWith({
        refresh_token: "refresh-token-123",
      });
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Token refreshed successfully.",
        mockData
      );
    });
  });

  describe("logout", () => {
    it("should clear cookies and return success", async () => {
      await authController.logout(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockClearAuthCookies).toHaveBeenCalledWith(mockRes);
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Logged out successfully."
      );
    });
  });

  describe("checkSession", () => {
    it("should return session info for authenticated user", async () => {
      mockReq.user = { id: "user-123", email: "test@example.com" };

      await authController.checkSession(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Session is valid.",
        {
          authenticated: true,
          userId: "user-123",
          email: "test@example.com",
        }
      );
    });

    it("should return undefined userId if user not set", async () => {
      mockReq.user = undefined;

      await authController.checkSession(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Session is valid.",
        {
          authenticated: true,
          userId: undefined,
          email: undefined,
        }
      );
    });
  });
});
