import type { calendar_v3 } from "googleapis";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { RetryMiddleware } from "../middleware/retry.middleware";
import { RateLimiter } from "../middleware/rate-limiter.middleware";
import { Logger } from "@/services/logging/Logger";

/**
 * Enhanced Google Calendar API client with resilience patterns
 */
export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar;
  private retryMiddleware: RetryMiddleware;
  private rateLimiter: RateLimiter;
  private logger: Logger;

  constructor(auth: OAuth2Client) {
    this.calendar = google.calendar({ version: "v3", auth });
    this.retryMiddleware = new RetryMiddleware({
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
    });
    this.rateLimiter = new RateLimiter({
      maxRequests: 100,
      windowMs: 60000, // 100 requests per minute
    });
    this.logger = new Logger("GoogleCalendarClient");
  }

  /**
   * Get calendar events resource with resilience
   */
  get events(): calendar_v3.Resource$Events {
    return this.wrapResource(this.calendar.events);
  }

  /**
   * Get calendars resource with resilience
   */
  get calendars(): calendar_v3.Resource$Calendars {
    return this.wrapResource(this.calendar.calendars);
  }

  /**
   * Get calendar list resource with resilience
   */
  get calendarList(): calendar_v3.Resource$Calendarlist {
    return this.wrapResource(this.calendar.calendarList);
  }

  /**
   * Wraps a resource to add retry and rate limiting
   */
  private wrapResource<T extends object>(resource: T): T {
    const wrapped = {} as T;

    for (const [key, value] of Object.entries(resource)) {
      if (typeof value === "function") {
        wrapped[key as keyof T] = (async (...args: unknown[]) => {
          const operationName = `${resource.constructor.name}.${key}`;

          return await this.rateLimiter.execute(
            () =>
              this.retryMiddleware.execute(async () => {
                this.logger.debug(`Executing ${operationName}`);
                const result = await (value as (...args: unknown[]) => Promise<unknown>).apply(resource, args);
                this.logger.debug(`${operationName} completed successfully`);
                return result;
              }, operationName),
            operationName
          );
        }) as T[keyof T];
      } else {
        wrapped[key as keyof T] = value as T[keyof T];
      }
    }

    return wrapped;
  }

  /**
   * Get the underlying calendar instance (for advanced use)
   */
  getCalendar(): calendar_v3.Calendar {
    return this.calendar;
  }
}
