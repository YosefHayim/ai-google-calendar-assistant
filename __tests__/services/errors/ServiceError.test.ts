import { describe, it, expect } from "@jest/globals";
import {
  ServiceError,
  EventServiceError,
  CalendarServiceError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
} from "@/services/errors/ServiceError";

describe("ServiceError Classes", () => {
  describe("ServiceError", () => {
    it("should create error with all properties", () => {
      const error = new ServiceError("Test error", "TEST_CODE", 400, {
        field: "test",
      });

      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: "test" });
      expect(error.name).toBe("ServiceError");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ServiceError);
      expect(error.stack).toBeDefined();
    });

    it("should default to status code 500", () => {
      const error = new ServiceError("Test error", "TEST_CODE");

      expect(error.statusCode).toBe(500);
    });

    it("should work without details", () => {
      const error = new ServiceError("Test error", "TEST_CODE", 404);

      expect(error.details).toBeUndefined();
    });
  });

  describe("EventServiceError", () => {
    it("should create EventServiceError", () => {
      const error = new EventServiceError("Event creation failed", {
        eventId: "123",
      });

      expect(error.message).toBe("Event creation failed");
      expect(error.code).toBe("EVENT_SERVICE_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ eventId: "123" });
      expect(error.name).toBe("EventServiceError");
      expect(error).toBeInstanceOf(ServiceError);
    });

    it("should work without details", () => {
      const error = new EventServiceError("Event creation failed");

      expect(error.details).toBeUndefined();
    });
  });

  describe("CalendarServiceError", () => {
    it("should create CalendarServiceError", () => {
      const error = new CalendarServiceError("Calendar sync failed", {
        calendarId: "primary",
      });

      expect(error.message).toBe("Calendar sync failed");
      expect(error.code).toBe("CALENDAR_SERVICE_ERROR");
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ calendarId: "primary" });
      expect(error.name).toBe("CalendarServiceError");
      expect(error).toBeInstanceOf(ServiceError);
    });

    it("should work without details", () => {
      const error = new CalendarServiceError("Calendar sync failed");

      expect(error.details).toBeUndefined();
    });
  });

  describe("ValidationError", () => {
    it("should create ValidationError", () => {
      const error = new ValidationError("Invalid input", {
        field: "email",
        reason: "invalid format",
      });

      expect(error.message).toBe("Invalid input");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({
        field: "email",
        reason: "invalid format",
      });
      expect(error.name).toBe("ValidationError");
      expect(error).toBeInstanceOf(ServiceError);
    });

    it("should work without details", () => {
      const error = new ValidationError("Invalid input");

      expect(error.statusCode).toBe(400);
      expect(error.details).toBeUndefined();
    });
  });

  describe("NotFoundError", () => {
    it("should create NotFoundError with ID", () => {
      const error = new NotFoundError("Event", "event-123");

      expect(error.message).toBe("Event with ID event-123 not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe("NotFoundError");
      expect(error).toBeInstanceOf(ServiceError);
    });

    it("should create NotFoundError without ID", () => {
      const error = new NotFoundError("Calendar");

      expect(error.message).toBe("Calendar not found");
      expect(error.code).toBe("NOT_FOUND");
      expect(error.statusCode).toBe(404);
    });

    it("should work with undefined ID", () => {
      const error = new NotFoundError("User", undefined);

      expect(error.message).toBe("User not found");
    });
  });

  describe("AuthenticationError", () => {
    it("should create AuthenticationError", () => {
      const error = new AuthenticationError("Invalid credentials", {
        email: "user@example.com",
      });

      expect(error.message).toBe("Invalid credentials");
      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.statusCode).toBe(401);
      expect(error.details).toEqual({ email: "user@example.com" });
      expect(error.name).toBe("AuthenticationError");
      expect(error).toBeInstanceOf(ServiceError);
    });

    it("should work without details", () => {
      const error = new AuthenticationError("Invalid credentials");

      expect(error.statusCode).toBe(401);
      expect(error.details).toBeUndefined();
    });
  });

  describe("AuthorizationError", () => {
    it("should create AuthorizationError with custom message", () => {
      const error = new AuthorizationError("Insufficient permissions");

      expect(error.message).toBe("Insufficient permissions");
      expect(error.code).toBe("AUTHORIZATION_ERROR");
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe("AuthorizationError");
      expect(error).toBeInstanceOf(ServiceError);
    });

    it("should use default message", () => {
      const error = new AuthorizationError();

      expect(error.message).toBe("Access denied");
      expect(error.statusCode).toBe(403);
    });
  });
});
