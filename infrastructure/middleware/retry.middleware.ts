import { Logger } from "@/services/logging/Logger";

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  retryableErrors: ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "429"],
};

/**
 * Retry middleware for API calls with exponential backoff
 */
export class RetryMiddleware {
  private logger: Logger;
  private options: Required<RetryOptions>;

  constructor(options: RetryOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.logger = new Logger("RetryMiddleware");
  }

  /**
   * Executes a function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    context: string = "API call"
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
      try {
        this.logger.debug(`${context} - Attempt ${attempt}/${this.options.maxAttempts}`);
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (!this.isRetryableError(error)) {
          this.logger.warn(`${context} - Non-retryable error`, { error });
          throw error;
        }

        if (attempt === this.options.maxAttempts) {
          this.logger.error(`${context} - Max retry attempts reached`, lastError);
          break;
        }

        const delay = this.calculateDelay(attempt);
        this.logger.warn(
          `${context} - Attempt ${attempt} failed, retrying in ${delay}ms`,
          { error: lastError.message }
        );

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Checks if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (!error) return false;

    const err = error as Error & { code?: string; status?: number };

    // Check error code
    if (err.code && this.options.retryableErrors.includes(err.code)) {
      return true;
    }

    // Check HTTP status (429 = Too Many Requests, 503 = Service Unavailable)
    if (err.status && (err.status === 429 || err.status === 503)) {
      return true;
    }

    // Check error message
    if (err.message) {
      return this.options.retryableErrors.some((retryable) =>
        err.message.includes(retryable)
      );
    }

    return false;
  }

  /**
   * Calculates delay with exponential backoff
   */
  private calculateDelay(attempt: number): number {
    return this.options.delayMs * Math.pow(this.options.backoffMultiplier, attempt - 1);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
