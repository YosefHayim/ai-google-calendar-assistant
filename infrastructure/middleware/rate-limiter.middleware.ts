import { Logger } from "@/services/logging/Logger";

export interface RateLimiterOptions {
  maxRequests?: number;
  windowMs?: number;
}

const DEFAULT_OPTIONS: Required<RateLimiterOptions> = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
};

interface RequestRecord {
  timestamp: number;
  count: number;
}

/**
 * Rate limiting middleware to prevent exceeding API limits
 */
export class RateLimiter {
  private logger: Logger;
  private options: Required<RateLimiterOptions>;
  private requests: Map<string, RequestRecord[]>;

  constructor(options: RateLimiterOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.logger = new Logger("RateLimiter");
    this.requests = new Map();
  }

  /**
   * Executes a function with rate limiting
   */
  async execute<T>(
    fn: () => Promise<T>,
    key: string = "default"
  ): Promise<T> {
    await this.waitIfNeeded(key);
    this.recordRequest(key);
    return await fn();
  }

  /**
   * Waits if rate limit is reached
   */
  private async waitIfNeeded(key: string): Promise<void> {
    this.cleanupOldRequests(key);

    const records = this.requests.get(key) || [];
    const totalRequests = records.reduce((sum, r) => sum + r.count, 0);

    if (totalRequests >= this.options.maxRequests) {
      const oldestRequest = records[0];
      const waitTime = this.options.windowMs - (Date.now() - oldestRequest.timestamp);

      if (waitTime > 0) {
        this.logger.warn(`Rate limit reached for key "${key}". Waiting ${waitTime}ms`, {
          maxRequests: this.options.maxRequests,
          windowMs: this.options.windowMs,
        });

        await this.sleep(waitTime);
        this.cleanupOldRequests(key);
      }
    }
  }

  /**
   * Records a new request
   */
  private recordRequest(key: string): void {
    const records = this.requests.get(key) || [];
    records.push({
      timestamp: Date.now(),
      count: 1,
    });
    this.requests.set(key, records);
  }

  /**
   * Removes requests outside the time window
   */
  private cleanupOldRequests(key: string): void {
    const records = this.requests.get(key) || [];
    const cutoff = Date.now() - this.options.windowMs;

    const validRecords = records.filter((r) => r.timestamp > cutoff);
    this.requests.set(key, validRecords);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Gets current request count for a key
   */
  getCurrentCount(key: string = "default"): number {
    this.cleanupOldRequests(key);
    const records = this.requests.get(key) || [];
    return records.reduce((sum, r) => sum + r.count, 0);
  }

  /**
   * Resets rate limiter for a key
   */
  reset(key: string = "default"): void {
    this.requests.delete(key);
    this.logger.debug(`Rate limiter reset for key "${key}"`);
  }
}
