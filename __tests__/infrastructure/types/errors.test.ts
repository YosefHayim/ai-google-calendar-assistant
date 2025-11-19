import { describe, it, expect } from "@jest/globals";
import {
  isApiError,
  isGoogleCalendarError,
  isSupabaseError,
  getErrorMessage,
  getErrorCode,
  type ApiError,
  type GoogleCalendarError,
  type SupabaseError,
} from "@/infrastructure/types/errors";

describe("Error Type Guards and Utilities", () => {
  describe("isApiError", () => {
    it("should return true for error with code number", () => {
      const error = Object.assign(new Error("Test"), { code: 404 });
      expect(isApiError(error)).toBe(true);
    });

    it("should return true for error with code string", () => {
      const error = Object.assign(new Error("Test"), { code: "NOT_FOUND" });
      expect(isApiError(error)).toBe(true);
    });

    it("should return true for error with response", () => {
      const error = Object.assign(new Error("Test"), {
        response: { status: 404 },
      });
      expect(isApiError(error)).toBe(true);
    });

    it("should return true for error with statusCode", () => {
      const error = Object.assign(new Error("Test"), { statusCode: 500 });
      expect(isApiError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Test");
      expect(isApiError(error)).toBe(false);
    });

    it("should return false for non-Error objects", () => {
      expect(isApiError({ message: "test" })).toBe(false);
      expect(isApiError("error string")).toBe(false);
      expect(isApiError(null)).toBe(false);
      expect(isApiError(undefined)).toBe(false);
    });
  });

  describe("isGoogleCalendarError", () => {
    it("should return true for GoogleCalendarError", () => {
      const error: GoogleCalendarError = Object.assign(new Error("Google error"), {
        response: {
          status: 403,
          data: {
            error: {
              code: 403,
              message: "Forbidden",
            },
          },
        },
      });

      expect(isGoogleCalendarError(error)).toBe(true);
    });

    it("should return false for error without response", () => {
      const error = Object.assign(new Error("Test"), { code: 404 });
      expect(isGoogleCalendarError(error)).toBe(false);
    });

    it("should return false for non-ApiError", () => {
      const error = new Error("Test");
      expect(isGoogleCalendarError(error)).toBe(false);
    });
  });

  describe("isSupabaseError", () => {
    it("should return true for error with code", () => {
      const error: SupabaseError = Object.assign(new Error("Supabase error"), {
        code: "PGRST116",
      });

      expect(isSupabaseError(error)).toBe(true);
    });

    it("should return true for error with details", () => {
      const error = Object.assign(new Error("Supabase error"), {
        details: "Table not found",
      });

      expect(isSupabaseError(error)).toBe(true);
    });

    it("should return true for error with hint", () => {
      const error = Object.assign(new Error("Supabase error"), {
        hint: "Check your query",
      });

      expect(isSupabaseError(error)).toBe(true);
    });

    it("should return false for regular Error", () => {
      const error = new Error("Test");
      expect(isSupabaseError(error)).toBe(false);
    });

    it("should return false for non-Error objects", () => {
      expect(isSupabaseError({ message: "test", code: "123" })).toBe(false);
    });
  });

  describe("getErrorMessage", () => {
    it("should extract message from Error instance", () => {
      const error = new Error("Test error message");
      expect(getErrorMessage(error)).toBe("Test error message");
    });

    it("should return string error as-is", () => {
      expect(getErrorMessage("Error string")).toBe("Error string");
    });

    it("should extract message from object with message property", () => {
      const error = { message: "Object error message" };
      expect(getErrorMessage(error)).toBe("Object error message");
    });

    it("should return 'Unknown error' for null", () => {
      expect(getErrorMessage(null)).toBe("Unknown error");
    });

    it("should return 'Unknown error' for undefined", () => {
      expect(getErrorMessage(undefined)).toBe("Unknown error");
    });

    it("should return 'Unknown error' for number", () => {
      expect(getErrorMessage(123)).toBe("Unknown error");
    });

    it("should return 'Unknown error' for object without message", () => {
      expect(getErrorMessage({ code: 404 })).toBe("Unknown error");
    });

    it("should return 'Unknown error' for object with non-string message", () => {
      expect(getErrorMessage({ message: 123 })).toBe("Unknown error");
    });
  });

  describe("getErrorCode", () => {
    it("should extract code from ApiError", () => {
      const error: ApiError = Object.assign(new Error("Test"), { code: 404 });
      expect(getErrorCode(error)).toBe(404);
    });

    it("should extract status from response", () => {
      const error: ApiError = Object.assign(new Error("Test"), {
        response: { status: 500 },
      });
      expect(getErrorCode(error)).toBe(500);
    });

    it("should extract statusCode", () => {
      const error: ApiError = Object.assign(new Error("Test"), {
        statusCode: 403,
      });
      expect(getErrorCode(error)).toBe(403);
    });

    it("should prioritize code over response status", () => {
      const error: ApiError = Object.assign(new Error("Test"), {
        code: 404,
        response: { status: 500 },
      });
      expect(getErrorCode(error)).toBe(404);
    });

    it("should prioritize response status over statusCode", () => {
      const error: ApiError = Object.assign(new Error("Test"), {
        response: { status: 500 },
        statusCode: 403,
      });
      expect(getErrorCode(error)).toBe(500);
    });

    it("should return undefined for regular Error", () => {
      const error = new Error("Test");
      expect(getErrorCode(error)).toBeUndefined();
    });

    it("should return undefined for non-Error objects", () => {
      expect(getErrorCode({ code: 404 })).toBeUndefined();
      expect(getErrorCode("error")).toBeUndefined();
      expect(getErrorCode(null)).toBeUndefined();
    });

    it("should handle string codes", () => {
      const error: ApiError = Object.assign(new Error("Test"), {
        code: "NOT_FOUND",
      });
      expect(getErrorCode(error)).toBe("NOT_FOUND");
    });
  });
});
