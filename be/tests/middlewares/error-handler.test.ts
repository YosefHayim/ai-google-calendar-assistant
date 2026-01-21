import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
// Now import after mocks
import errorHandler from "../../middlewares/error-handler";
import { mockFn } from "../test-utils";

// Create mocks before imports
const mockSendR = mockFn();

// Mock modules
jest.mock("@/lib/send-response", () => ({
  default: mockSendR,
}));

jest.mock("@/types", () => ({
  STATUS_RESPONSE: {
    INTERNAL_SERVER_ERROR: 500,
  },
}));

describe("errorHandler", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: ReturnType<typeof mockFn>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: mockFn().mockReturnThis(),
      json: mockFn(),
    };
    mockNext = mockFn();
    mockSendR.mockClear();
  });

  describe("error handling", () => {
    it("should handle error with custom status", () => {
      const error = new Error("Custom error") as Error & { status?: number };
      error.status = 404;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 404, "Custom error");
    });

    it("should handle error with 400 status", () => {
      const error = new Error("Bad request") as Error & { status?: number };
      error.status = 400;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 400, "Bad request");
    });

    it("should handle error with 401 status", () => {
      const error = new Error("Unauthorized") as Error & { status?: number };
      error.status = 401;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 401, "Unauthorized");
    });

    it("should handle error with 403 status", () => {
      const error = new Error("Forbidden") as Error & { status?: number };
      error.status = 403;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 403, "Forbidden");
    });

    it("should default to 500 when no status is provided", () => {
      const error = new Error("Server error");

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 500, "Server error");
    });

    it("should handle error without message", () => {
      const error = new Error() as Error & { status?: number };
      error.status = 500;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        500,
        "Internal Server Error"
      );
    });

    it("should handle error with empty message", () => {
      const error = new Error("") as Error & { status?: number };
      error.status = 400;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        400,
        "Internal Server Error"
      );
    });
  });

  describe("status code handling", () => {
    it("should handle 422 validation error", () => {
      const error = new Error("Validation failed") as Error & {
        status?: number;
      };
      error.status = 422;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        422,
        "Validation failed"
      );
    });

    it("should handle 503 service unavailable", () => {
      const error = new Error("Service unavailable") as Error & {
        status?: number;
      };
      error.status = 503;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockResponse,
        503,
        "Service unavailable"
      );
    });

    it("should handle status 0", () => {
      const error = new Error("Unknown") as Error & { status?: number };
      error.status = 0;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      // 0 is falsy, so should default to 500
      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 500, "Unknown");
    });
  });

  describe("edge cases", () => {
    it("should handle error with very long message", () => {
      const longMessage = "a".repeat(1000);
      const error = new Error(longMessage) as Error & { status?: number };
      error.status = 400;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 400, longMessage);
    });

    it("should handle error with special characters", () => {
      const specialMessage = "Error: User's \"data\" isn't valid!";
      const error = new Error(specialMessage) as Error & { status?: number };
      error.status = 400;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 400, specialMessage);
    });

    it("should not call next function", () => {
      const error = new Error("Test") as Error & { status?: number };
      error.status = 404;

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle error object with additional properties", () => {
      const error = new Error("Custom error") as Error & {
        status?: number;
        code?: string;
        details?: unknown;
      };
      error.status = 400;
      error.code = "CUSTOM_ERROR";
      error.details = { field: "email" };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext as NextFunction
      );

      expect(mockSendR).toHaveBeenCalledWith(mockResponse, 400, "Custom error");
    });
  });
});
