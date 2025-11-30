/**
 * Base class for service-level errors
 */
export class ServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Event-related service errors
 */
export class EventServiceError extends ServiceError {
  constructor(message: string, details?: unknown) {
    super(message, "EVENT_SERVICE_ERROR", 500, details);
    this.name = "EventServiceError";
  }
}

/**
 * Calendar-related service errors
 */
export class CalendarServiceError extends ServiceError {
  constructor(message: string, details?: unknown) {
    super(message, "CALENDAR_SERVICE_ERROR", 500, details);
    this.name = "CalendarServiceError";
  }
}

/**
 * Validation errors
 */
export class ValidationError extends ServiceError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends ServiceError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

/**
 * Authentication errors
 */
export class AuthenticationError extends ServiceError {
  constructor(message: string, details?: unknown) {
    super(message, "AUTHENTICATION_ERROR", 401, details);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization errors
 */
export class AuthorizationError extends ServiceError {
  constructor(message: string = "Access denied") {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
  }
}
