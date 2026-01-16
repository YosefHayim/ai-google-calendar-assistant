import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { mockFn } from "../test-utils";

// Define mocks at module level
const mockSupabaseFrom = mockFn();
const mockSendR = mockFn();

// Mock modules before imports with factory functions
jest.mock("@/config", () => ({
  SUPABASE: {
    from: (...args: unknown[]) => mockSupabaseFrom(...args),
  },
  STATUS_RESPONSE: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
  },
}));

jest.mock("@/utils/http", () => ({
  sendR: (...args: unknown[]) => mockSendR(...args),
  reqResAsyncHandler:
    <T extends (...args: unknown[]) => Promise<unknown>>(fn: T) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next),
}));

// Import after mocks are defined
import { type AdminRequest, adminAuth } from "../../middlewares/admin-auth";

describe("adminAuth Middleware", () => {
  let mockRequest: Partial<AdminRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof mockFn>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      user: { id: "user-123", email: "test@example.com" } as any,
    };
    mockResponse = {};
    mockNext = mockFn();
  });

  describe("authentication check", () => {
    it("should return 401 when user is not authenticated", async () => {
      mockRequest.user = undefined;

      const middleware = adminAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        401,
        "Authentication required"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when user id is missing", async () => {
      mockRequest.user = { email: "test@example.com" } as any;

      const middleware = adminAuth();
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        401,
        "Authentication required"
      );
    });
  });

  describe("role verification", () => {
    it("should allow admin user when admin role required", async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "admin", status: "active" },
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.userRole).toBe("admin");
      expect(mockSendR).not.toHaveBeenCalled();
    });

    it("should allow moderator when moderator or admin is required", async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "moderator", status: "active" },
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin", "moderator"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.userRole).toBe("moderator");
    });

    it("should deny regular user when admin role required", async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "user", status: "active" },
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        403,
        "Insufficient permissions to access this resource"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should default to user role when role is null", async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: null, status: "active" },
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        403,
        "Insufficient permissions to access this resource"
      );
    });

    it("should use default admin role when no roles specified", async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "admin", status: "active" },
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(); // Uses default ["admin"]
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("suspended user check", () => {
    it("should deny suspended user", async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "admin", status: "suspended" },
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        403,
        "Account suspended"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should allow active admin user", async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "admin", status: "active" },
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("database error handling", () => {
    it("should return 403 when database query fails", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: null,
              error: { message: "Database error" },
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        403,
        "Unable to verify user permissions"
      );
      expect(mockNext).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should return 403 when user not found in database", async () => {
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        403,
        "Unable to verify user permissions"
      );

      consoleSpy.mockRestore();
    });
  });

  describe("request augmentation", () => {
    it("should attach userRole to request for downstream use", async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "admin", status: "active" },
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockRequest.userRole).toBe("admin");
    });

    it("should fetch role from users table", async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "admin", status: "active" },
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSupabaseFrom).toHaveBeenCalledWith("users");
    });
  });

  describe("multiple allowed roles", () => {
    it("should allow user with any of the allowed roles", async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "support", status: "active" },
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin", "moderator", "support"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.userRole).toBe("support");
    });

    it("should deny user with role not in allowed list", async () => {
      mockSupabaseFrom.mockReturnValue({
        select: mockFn().mockReturnValue({
          eq: mockFn().mockReturnValue({
            single: mockFn().mockResolvedValue({
              data: { role: "user", status: "active" },
              error: null,
            }),
          }),
        }),
      });

      const middleware = adminAuth(["admin", "moderator"]);
      await middleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        403,
        "Insufficient permissions to access this resource"
      );
    });
  });
});
