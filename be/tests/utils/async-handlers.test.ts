import type { NextFunction, Request, Response } from "express";
import { asyncHandler, reqResAsyncHandler } from "../../utils/http/async-handlers";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("async-handlers", () => {
  describe("reqResAsyncHandler", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock<NextFunction>;

    beforeEach(() => {
      mockRequest = {};
      mockResponse = {};
      mockNext = jest.fn() as unknown as jest.Mock<NextFunction>;
    });

    it("should call the async function with req, res, next", async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const handler = reqResAsyncHandler(asyncFn);

      await handler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(asyncFn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
    });

    it("should not call next when async function succeeds", async () => {
      const asyncFn = jest.fn().mockResolvedValue({ success: true });
      const handler = reqResAsyncHandler(asyncFn);

      await handler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next with error when async function throws", async () => {
      const error = new Error("Test error");
      const asyncFn = jest.fn().mockRejectedValue(error);
      const handler = reqResAsyncHandler(asyncFn);

      await handler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("should call next with error when async function rejects", async () => {
      const error = new Error("Rejected");
      const asyncFn = jest.fn(async () => {
        throw error;
      });
      const handler = reqResAsyncHandler(asyncFn);

      await handler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("should handle custom error objects", async () => {
      const customError = { status: 404, message: "Not found" };
      const asyncFn = jest.fn().mockRejectedValue(customError);
      const handler = reqResAsyncHandler(asyncFn);

      await handler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect(mockNext).toHaveBeenCalledWith(customError);
    });

    it("should preserve request modifications", async () => {
      const asyncFn = jest.fn(async (req: Request) => {
        (req as Request & { userId?: string }).userId = "123";
      });
      const handler = reqResAsyncHandler(asyncFn);

      await handler(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

      expect((mockRequest as Request & { userId?: string }).userId).toBe("123");
    });
  });

  describe("asyncHandler", () => {
    it("should resolve when function succeeds", async () => {
      const fn = jest.fn(() => "success");
      const handler = asyncHandler(fn);

      const result = await handler();
      expect(result).toBe("success");
      expect(fn).toHaveBeenCalled();
    });

    it("should resolve when async function succeeds", async () => {
      const fn = jest.fn(async () => "async success");
      const handler = asyncHandler(fn);

      const result = await handler();
      expect(result).toBe("async success");
    });

    it("should pass arguments to wrapped function", async () => {
      const fn = jest.fn((a: number, b: string) => `${a}-${b}`);
      const handler = asyncHandler(fn);

      const result = await handler(42, "test");
      expect(result).toBe("42-test");
      expect(fn).toHaveBeenCalledWith(42, "test");
    });

    it("should handle multiple arguments", async () => {
      const fn = jest.fn((...args: number[]) => args.reduce((a, b) => a + b, 0));
      const handler = asyncHandler(fn);

      const result = await handler(1, 2, 3, 4, 5);
      expect(result).toBe(15);
    });

    it("should reject when function throws", async () => {
      const testError = new Error("Test error");
      const fn = jest.fn(() => {
        throw testError;
      });
      const handler = asyncHandler(fn);

      await expect(handler()).rejects.toThrow("Test error");
    });

    it("should reject when async function throws", async () => {
      const error = new Error("Async error");
      const fn = jest.fn(async () => {
        throw error;
      });
      const handler = asyncHandler(fn);

      await expect(handler()).rejects.toThrow("Async error");
    });

    it("should preserve error object", async () => {
      const customError = new Error("Custom");
      (customError as Error & { code?: number }).code = 404;
      const fn = jest.fn(() => {
        throw customError;
      });
      const handler = asyncHandler(fn);

      try {
        await handler();
      } catch (err) {
        expect(err).toBe(customError);
        expect((err as Error & { code?: number }).code).toBe(404);
      }
    });

    it("should handle functions returning promises", async () => {
      const fn = jest.fn(() => Promise.resolve(42));
      const handler = asyncHandler(fn);

      const result = await handler();
      expect(result).toBe(42);
    });

    it("should handle functions returning rejected promises", async () => {
      const error = new Error("Promise error");
      const fn = jest.fn(() => Promise.reject(error));
      const handler = asyncHandler(fn);

      await expect(handler()).rejects.toThrow("Promise error");
    });

    it("should handle synchronous functions", async () => {
      const fn = jest.fn((x: number) => x * 2);
      const handler = asyncHandler(fn);

      const result = await handler(5);
      expect(result).toBe(10);
    });

    it("should handle functions with no return value", async () => {
      const fn = jest.fn(() => undefined);
      const handler = asyncHandler(fn);

      const result = await handler();
      expect(result).toBeUndefined();
    });
  });
});
